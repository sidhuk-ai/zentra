import { useSetAtom } from "jotai";
import { screenAtom } from "../atoms/widget-atoms";
import { useVapi } from "../hooks/use-vapi";
import { MicIcon, MicOffIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Conversation, ConversationContent, ConversationScrollButton } from "@workspace/ui/components/ai/conversations";
import { Message, MessageContent } from "@workspace/ui/components/ai/message";

export const WidgetVoiceScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const {
    isConnected,
    isSpeaking,
    transcript,
    startCall,
    endCall,
    isConnecting,
  } = useVapi();
  return (
    <div
      className="flex flex-col h-full w-full justify-between"
      // style={{ height: "-webkit-fill-available" }}
    >
      {transcript.length > 0 ? (
        <Conversation className="h-full">
          <ConversationContent>
            {transcript.map((message, index) =>(
              <Message key={index} from={message.role}>
                <MessageContent>{message.text}</MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <div className="flex flex-1 h-full flex-col items-center justify-center gap-y-4">
          <div className="flex items-center justify-center rounded-full border bg-white p-3">
            <MicIcon className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Transcript will appear here</p>
        </div>
      )}
      <div className="border-t border-t-border bg-background p-4">
        <div className="flex flex-col items-center gap-y-4">
          {isConnected && (
            <div className="flex items-center gap-x-2">
              <div
                className={cn(
                  "size-3 rounded-full",
                  isSpeaking ? "animate-pulse bg-rose-500" : "bg-green-500"
                )}
              />
              <span className="text-muted-foreground text-sm">
                {isSpeaking ? "Assistant Speaking..." : "Listening..."}
              </span>
            </div>
          )}
          <div className="flex w-full justify-center">
            {isConnected ? (
              <Button
                className="w-full"
                disabled={isConnecting}
                size={"lg"}
                variant={"destructive"}
                onClick={() => endCall()}
              >
                <MicOffIcon />
                End Call
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={isConnecting}
                size={"lg"}
                onClick={() => startCall()}
              >
                <MicIcon />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
