import { api } from "@workspace/backend/_generated/api";
import { useAction, useQuery } from "convex/react";
import { useAtomValue } from "jotai";
import {
  contactSessionIdAtomFamily,
  conversationIdAtom,
  organizationIdAtom,
} from "../atoms/widget-atoms";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai/conversations";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@workspace/ui/components/ai/prompt-input";
import { Message, MessageContent } from "@workspace/ui/components/ai/message";
import { Response } from "@workspace/ui/components/ai/response";
import {
  Suggestion,
  Suggestions,
} from "@workspace/ui/components/ai/suggestion";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField } from "@workspace/ui/components/form";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfinteScrollTrigger } from "@workspace/ui/components/infinte-scroll-trigger";
import { DiceBearAvatar } from "@workspace/ui/components/dicebear-avatar";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export function WidgetChatScreen() {
  const conversationId = useAtomValue(conversationIdAtom);
  const organizationId = useAtomValue(organizationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || "")
  );

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          conversationId,
          contactSessionId,
        }
      : "skip"
  );

  const threadId = conversation?.threadId;
  const messages = useThreadMessages(
    api.public.messages.getMany,
    threadId && contactSessionId ? { threadId, contactSessionId } : "skip",
    { initialNumItems: 10 }
  );

  const { topElementRef, isLoadingMore, canLoadMore, handleLoadMore } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  const createMessage = useAction(api.public.messages.create);
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) return;

    form.reset();

    await createMessage({
      threadId: conversation.threadId,
      prompt: values.message,
      contactSessionId,
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <ScrollArea className="flex-1 p-3">
        <Conversation>
          <ConversationContent>
            <InfinteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              ref={topElementRef}
            />
            {toUIMessages(messages.results ?? []).map((message) => (
              <Message
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <MessageContent>
                  <Response>{message.text}</Response>
                </MessageContent>
                {message.role === "assistant" && 
                  <DiceBearAvatar
                    imageUrl="/logo-light.svg"
                    className="p-0.5"
                    seed="assistant"
                    size={34}
                  />
                }
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
      </ScrollArea>
      <Form {...form}>
        <PromptInput
          onSubmit={form.handleSubmit(onSubmit)}
          className="border-x-0 border-b-0 sticky bottom-0"
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === "resolved"}
            name="message"
            render={({ field }) => (
              <PromptInputTextarea
                disabled={conversation?.status === "resolved"}
                onChange={field.onChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "This conversation has been resolved"
                    : "Type your message..."
                }
                value={field.value}
              />
            )}
          />
          <PromptInputToolbar>
            <PromptInputTools />
            <PromptInputSubmit
              disabled={
                conversation?.status === "resolved" || !form.formState.isValid
              }
              status="ready"
              type="submit"
            />
          </PromptInputToolbar>
        </PromptInput>
      </Form>
    </div>
  );
}
