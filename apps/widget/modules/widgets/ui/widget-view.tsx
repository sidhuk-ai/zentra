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
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
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
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { useAtomValue, useSetAtom } from "jotai";
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  organizationIdAtom,
  screenAtom,
} from "@/modules/widgets/atoms/widget-atoms";

type Tab = "home" | "inbox";
type InitStep = "org" | "session" | "settings" | "vapi" | "done";
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export function ChatbotWidget({
  greeting = "Hi there 👋",
  subtitle = "How can we help today?",
  className,
  organizationId,
}: {
  greeting?: string;
  subtitle?: string;
  className?: string;
  organizationId: string;
}) {
  const [active, setActive] = React.useState<Tab>("home");
  const screen = useAtomValue(screenAtom);
  const screenComponents = {
    error: <ErrorScreen />,
    loading: <LoadingScreen organizationId={organizationId} />,
    auth: <AuthScreen />,
    voice: <p>TODO</p>,
    inbox: <InboxView />,
    selection: <HomeView />,
    chat: <p>TODO</p>,
    contact: <p>TODO</p>,
  };

  return (
    <section
      aria-label="AI Support Chatbot Widget"
      className={cn(
        // container
        "w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-lg",
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
        <div className="min-w-0">
          <h2 className="text-pretty text-xl font-semibold leading-tight">
            {greeting}
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium",
              "text-secondary-foreground border-border"
            )}
            aria-live="polite"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-primary-foreground opacity-75 animate-pulse" />
              {/* <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" /> */}
            </span>
            Online
          </Badge>
        </div>
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
          onClick={() => setActive("home")}
        />
        <TabButton
          icon={<Inbox className="h-4 w-4" aria-hidden="true" />}
          label="Inbox"
          selected={screen === "inbox"}
          onClick={() => setActive("inbox")}
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
  }, [step, contactSessionId, setLoadingMsg, validateContactSession, setSessionValid]);

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
  return (
    <div
      id="panel-home"
      role="tabpanel"
      aria-labelledby="Home"
      className="p-4 space-y-4 w-full"
    >
      <div className="space-y-3">
        <ActionButton
          icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
          label="Start Chat"
          description="Connect with our AI assistant instantly"
          onClick={() => {
            // placeholder action
            console.log("Start Chat clicked");
          }}
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
  return (
    <div
      id="panel-inbox"
      role="tabpanel"
      aria-labelledby="Inbox"
      className="p-4"
    >
      <div className="flex h-40 flex-col items-center justify-center rounded-xl">
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card">
          <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium">No new messages</p>
        <p className="text-xs text-muted-foreground">
          When you start a chat, it will appear here.
        </p>
        <button
          type="button"
          onClick={() => console.log("Inbox CTA clicked")}
          className={cn(
            "mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium",
            "transition-all hover:bg-accent/60"
          )}
          aria-label="Start a new conversation"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          New conversation
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
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
        <ChevronRight className="text-muted-foreground" />
      </span>
    </button>
  );
}
