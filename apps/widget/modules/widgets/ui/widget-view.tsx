"use client";

import * as React from "react";
import {
  Home,
  Inbox,
  MessageSquare,
  PhoneCall,
  Mic,
  ChevronRight,
  AlertTriangleIcon,
  LoaderIcon,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widgets/atoms/widget-atoms";
import { WidgetChatScreen } from "@/modules/widgets/screens/widget-chat-screen";
import { GreetingsHeader } from "./greetings-header";
import { NavigationHeader } from "./navigation-header";
import { formatDistanceToNow } from "date-fns";
import { StatusIcon } from "@workspace/ui/components/status-icon";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfinteScrollTrigger } from "@workspace/ui/components/infinte-scroll-trigger";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export function ChatbotWidget({
  className,
  organizationId,
}: {
  greeting?: string;
  subtitle?: string;
  className?: string;
  organizationId: string;
}) {
  const screen = useAtomValue(screenAtom);
  const setScreen = useSetAtom(screenAtom);
  const screenComponents = {
    error: <ErrorScreen />,
    loading: <LoadingScreen organizationId={organizationId} />,
    auth: <AuthScreen />,
    voice: <p>TODO</p>,
    inbox: <InboxView />,
    selection: <HomeView />,
    chat: <WidgetChatScreen />,
    contact: <p>TODO</p>,
  };

  return (
    <section
      aria-label="AI Support Chatbot Widget"
      className={cn(
        // container
        "w-full min-h-svh max-w-screen rounded-2xl border border-border bg-card text-card-foreground shadow-lg",
        "flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "px-4 py-3 border-b border-b-border",
          "bg-card/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur",
          "flex items-center justify-between"
        )}
      >
        {screen === "chat" || screen === "voice" || screen === "contact" ? (
          <NavigationHeader />
        ) : (
          <GreetingsHeader />
        )}
      </header>

      {/* Body */}
      <main className="min-h-48 flex-1 bg-card flex items-center justify-center">
        {screenComponents[screen]}
      </main>

      {/* Footer (Segmented Nav) */}
      <nav
        role="tablist"
        aria-label="Widget navigation"
        className="grid grid-cols-2 border-t border-t-border"
      >
        <TabButton
          icon={<Home className="h-4 w-4" aria-hidden="true" />}
          label="Home"
          selected={screen === "selection"}
          onClick={() => setScreen("selection")}
        />
        <TabButton
          icon={<Inbox className="h-4 w-4" aria-hidden="true" />}
          label="Inbox"
          selected={screen === "inbox"}
          onClick={() => setScreen("inbox")}
        />
      </nav>
    </section>
  );
}

function TabButton({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`panel-${label.toLowerCase()}`}
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "bg-secondary text-secondary-foreground"
          : "bg-card hover:bg-accent/60 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-2 py-1",
          selected ? "bg-secondary text-secondary-foreground" : "bg-transparent"
        )}
      >
        {icon}
        <span className="text-sm">{label}</span>
      </span>
    </button>
  );
}

function AuthScreen() {
  const organizationId = useAtomValue(organizationIdAtom);
  const setContactSessionId = useSetAtom(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const createContactSession = useMutation(api.public.contactSession.create);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!organizationId) return;

    const metadata: Doc<"contactSession">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages.join(","),
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${screen.width}X${screen.height}`,
      viewportSize: `${window.innerWidth}X${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      referrer: document.referrer || "direct",
      currentUrl: window.location.href,
    };

    const contactSessionId = await createContactSession({
      ...values,
      organizationId,
      metadata,
    });
    console.log(contactSessionId);
    setContactSessionId(contactSessionId);
    console.log(values);
  };
  return (
    <div className="p-4 space-y-4 w-full">
      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="h-10 bg-background"
                    placeholder="John Doe"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="h-10 bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting}
            size={"lg"}
            type="submit"
            className="block w-full cursor-pointer"
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
}

function ErrorScreen() {
  const errorMsg = useAtomValue(errorMessageAtom);

  return (
    <div className="flex flex-col flex-1 gap-y-4 p-4 items-center justify-center text-muted-foreground">
      <AlertTriangleIcon />
      <p className="text-sm">{errorMsg || "Invalid Configuration"}</p>
    </div>
  );
}

function LoadingScreen({ organizationId }: { organizationId: string }) {
  const [step, setStep] = React.useState<InitStep>("org");
  const [sessionValid, setSessionValid] = React.useState<boolean>(false);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const loadingMsg = useAtomValue(loadingMessageAtom);
  const setLoadingMsg = useSetAtom(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId)
  );

  // Step 1: Validating organizationn
  const validateOrganization = useAction(api.public.organization.validate);
  React.useEffect(() => {
    if (step !== "org") return;

    setLoadingMsg("Loading organization details...");
    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
    }
    setLoadingMsg("Verifying organization...");

    validateOrganization({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrganizationId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setScreen,
    setLoadingMsg,
    validateOrganization,
    setOrganizationId,
    setStep,
  ]);

  // Step 2: validating session (agar exist karta hai toh)
  const validateContactSession = useMutation(
    api.public.contactSession.validate
  );
  React.useEffect(() => {
    if (step !== "session") return;

    setLoadingMsg("Finding contact session ID...");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMsg("Validating session...");
    validateContactSession({ contactSessionId })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [
    step,
    contactSessionId,
    setLoadingMsg,
    validateContactSession,
    setSessionValid,
  ]);

  React.useEffect(() => {
    if (step !== "done") return;

    const hasSessionId = contactSessionId && sessionValid;
    setScreen(hasSessionId ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <div className="flex flex-col flex-1 gap-y-4 p-4 items-center justify-center text-muted-foreground">
      <LoaderIcon className="animate-spin" />
      <p className="text-sm">{loadingMsg || "Loading..."}</p>
    </div>
  );
}

function HomeView() {
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const setErrorMsg = useSetAtom(errorMessageAtom);

  const createConversations = useMutation(api.public.conversations.create);

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const habdleNewConversations = async () => {
    if (!organizationId) {
      setErrorMsg("Missing organization ID");
      setScreen("error");
      return;
    }

    if (!contactSessionId) {
      setScreen("auth");
      return;
    }

    setIsPending(true);
    try {
      const conversationId = await createConversations({
        organizationId,
        contactSessionId,
      });

      setConversationId(conversationId);
      setScreen("chat");
    } catch (error) {
      setScreen("auth");
    } finally {
      setIsPending(false);
    }
  };
  return (
    <div
      id="panel-home"
      role="tabpanel"
      aria-labelledby="Home"
      className="p-4 space-y-4 w-full"
    >
      <div className="space-y-3">
        <ActionButton
          icon={<MessageSquareText className="h-5 w-5" aria-hidden="true" />}
          label="Start Chat"
          description="Connect with our AI assistant instantly"
          onClick={habdleNewConversations}
          disabled={isPending}
        />
        <ActionButton
          icon={<Mic className="h-5 w-5" aria-hidden="true" />}
          label="Start Voice Call"
          description="Speak to our AI for faster resolution"
          onClick={() => {
            console.log("Start Voice Call clicked");
          }}
        />
        <ActionButton
          icon={<PhoneCall className="h-5 w-5" aria-hidden="true" />}
          label="Call Us"
          description="Reach our support team by phone"
          onClick={() => {
            console.log("Call Us clicked");
          }}
        />
      </div>
    </div>
  );
}

function InboxView() {
  const organizationId = useAtomValue(organizationIdAtom);
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );
  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId ? { contactSessionId } : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: conversations.status,
      loadMore: conversations.loadMore,
      loadSize: 10
    });
  return (
    <div
      id="panel-inbox"
      role="tabpanel"
      aria-labelledby="Inbox"
      className="p-4 w-full"
    >
      {conversations.results.length === 0 && (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
            <Inbox
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm font-medium">No new messages</p>
          <p className="text-xs text-muted-foreground">
            When you start a chat, it will appear here.
          </p>
        </div>
      )}
      {
        <>
          <div className="flex flex-1 flex-col w-full space-y-2 p-4 overflow-y-auto">
            {conversations?.results.length > 0 &&
              conversations?.results.map((conversation) => (
                <Button
                  className="h-20 w-full justify-between cursor-pointer"
                  key={conversation._id}
                  onClick={() => {
                    setConversationId(conversation._id);
                    setScreen("chat");
                  }}
                  variant={"outline"}
                >
                  <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                    <div className="flex w-full items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Chat</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(conversation.creationTime)
                        )}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <p className="truncate text-sm">
                        {conversation.lastMessage?.text}
                      </p>
                      <StatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Button>
              ))}
          </div>
          <InfinteScrollTrigger
            ref={topElementRef}
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
          />
        </>
      }
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl border border-border bg-card px-4 py-3 text-left",
        "flex items-center justify-between cursor-pointer",
        "transition-all hover:bg-accent/60 focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      aria-label={label}
      disabled={disabled}
    >
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
          {/* decorative halo on hover */}
          <span className="absolute -z-10 hidden rounded-full bg-primary/10 blur-md transition-opacity duration-300 group-hover:block" />
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <span className="opacity-0 group-hover:opacity-100 group-hover:transition-all group-hover:duration-300 group-hover:translate-x-1">
        <ChevronRight className="text-muted-foreground size-5" />
      </span>
    </button>
  );
}
