"use client";

import * as React from "react";
import {
  Home,
  Inbox,
  MessageSquare,
  PhoneCall,
  Mic,
  ChevronRight,
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
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { useAtomValue } from "jotai";
import { screenAtom } from "@/modules/widgets/atoms/widget-atoms";

type Tab = "home" | "inbox";
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
    error: <p>TODO</p>,
    loading: <p>TODO</p>,
    auth: <AuthScreen />,
    voice: <p>TODO</p>,
    inbox: <p>TODO</p>,
    selection: <p>TODO</p>,
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
      <main className="min-h-48 flex-1 bg-card">
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
          selected={active === "home"}
          onClick={() => setActive("home")}
        />
        <TabButton
          icon={<Inbox className="h-4 w-4" aria-hidden="true" />}
          label="Inbox"
          selected={active === "inbox"}
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
  const organizationId = "1234";
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
      <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-border bg-card/50">
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
