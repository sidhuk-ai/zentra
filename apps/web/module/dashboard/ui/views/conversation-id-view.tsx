"use client";
import { api } from "@workspace/backend/_generated/api";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@workspace/ui/components/ai/conversations";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@workspace/ui/components/ai/prompt-input";
import { Message, MessageContent } from "@workspace/ui/components/ai/message";
import { Response } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { MoreVerticalIcon, Wand2Icon } from "lucide-react";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { DiceBearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { useState } from "react";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfinteScrollTrigger } from "@workspace/ui/components/infinte-scroll-trigger";
import { ConversationIdViewSkeleton } from "@workspace/ui/components/loading-skeleton";
import { cn } from "@workspace/ui/lib/utils";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversation">;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });
  const [isPendingStatusChange, setIsPendingStatusChange] = useState(false);

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?._id ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 10 }
  );
  const createMessage = useMutation(api.private.messages.create);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus
  );

  const handleToggleStatusChange = async () => {
    if (!conversation) return;
    setIsPendingStatusChange(true);

    let newStatus: Doc<"conversation">["status"];

    if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else if (conversation.status === "escalated") {
      newStatus = "resolved";
    } else {
      newStatus = "unresolved";
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPendingStatusChange(false);
    }
  };

  const {
    topElementRef,
    handleLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
    canLoadMore,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const enhanceResponse = useAction(api.private.messages.enhanceResponse);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const handleTextEnhancing = async () => {
    setIsEnhancing(true);
    const currentMessageValue = form.getValues("message");

    try {
      const enhancedText = await enhanceResponse({
        prompt: currentMessageValue,
      });
      form.setValue("message", enhancedText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  if(isLoadingFirstPage) {
    return (
      <ConversationIdViewSkeleton />
    )
  }
  return (
    <div className="flex flex-col w-full h-screen text-sidebar-foreground bg-background justify-start">
      <header className="border-b border-b-border flex justify-between p-2.5">
        <Button size={"icon-sm"} variant={"ghost"}>
          <MoreVerticalIcon />
        </Button>
        {!!conversation && (
          <ConversationStatusButton
            status={conversation.status}
            handleToggleStatusChange={handleToggleStatusChange}
            isDisabled={isPendingStatusChange}
          />
        )}
      </header>
      <Conversation className="max-h-[calc(100vh-180px)]">
        <ConversationContent>
          <InfinteScrollTrigger
            ref={topElementRef}
            canLoadMore={canLoadMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
          {toUIMessages(messages.results ?? [])
          //.filter((m) => m.text && m.text.trim() !== "")
          .map((message) => (
            <Message
              from={message.role === "user" ? "assistant" : "user"}
              key={message.id}
            >
              <MessageContent className={cn(message.role === "assistant" && "!bg-secondary !text-foreground")}>
                <Response>{message.text}</Response>
              </MessageContent>
              {message.role === "user" && (
                <DiceBearAvatar
                  seed={conversation?.contactSessionId ?? "user"}
                  size={34}
                />
              )}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-2">
        <Form {...form}>
          <PromptInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              disabled={conversation?.status === "resolved"}
              name="message"
              render={({ field }) => (
                <PromptInputTextarea
                  disabled={
                    conversation?.status === "resolved" ||
                    form.formState.isSubmitting ||
                    isEnhancing
                  }
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
                      : "Type your response..."
                  }
                  value={field.value}
                />
              )}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton
                  onClick={handleTextEnhancing}
                  disabled={
                    isEnhancing ||
                    !form.formState.isValid ||
                    conversation?.status === "resolved"
                  }
                >
                  <Wand2Icon />
                  {isEnhancing ? "Enhancing..." : "Enhance"}
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                status="ready"
                type="submit"
              />
            </PromptInputToolbar>
          </PromptInput>
        </Form>
      </div>
    </div>
  );
};
