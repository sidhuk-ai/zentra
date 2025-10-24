import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Conversation,
  ConversationContent,
} from "@workspace/ui/components/ai/conversations";
import { cn } from "@workspace/ui/lib/utils";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@workspace/ui/components/ai/prompt-input";

function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5 p-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="flex items-start gap-3 rounded-lg p-4" key={i}>
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="flex w-full items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-3 w-12 shrink-0" />
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WidgetViewLoadingSkeleton() {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="w-full flex flex-col gap-2 p-4" key={i}>
          <div className="flex justify-between">
            <Skeleton className="w-14 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationIdViewSkeleton() {
  return (
    <div className="flex flex-col w-full h-screen text-sidebar-foreground bg-background justify-start">
      <header className="border-b border-b-border flex justify-between p-2.5">
        <Skeleton className="size-8" />
        <Skeleton className="h-8 w-26" />
      </header>
      <Conversation>
        <ConversationContent>
          {Array.from({ length: 9 }).map((_, i) => {
            const isUser = i % 2 === 0;
            const widths = ["w-48", "w-60", "w-72"];
            const width = widths[i % widths.length];

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-4/5",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={i}
              >
                <Skeleton
                  className={`h-9 ${width} rounded-lg not-dark:bg-neutral-200`}
                />
                <Skeleton className="size-8 rounded-full not-dark:bg-neutral-200" />
              </div>
            );
          })}
        </ConversationContent>
      </Conversation>
      <div className="p-2">
        <PromptInput onSubmit={() => Promise.resolve()}>
          <PromptInputTextarea
            disabled
            placeholder="TYpe your response as an operator..."
          />
          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputSubmit disabled status="ready" />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}

export {
  LoadingSkeleton,
  WidgetViewLoadingSkeleton,
  ConversationIdViewSkeleton,
};
