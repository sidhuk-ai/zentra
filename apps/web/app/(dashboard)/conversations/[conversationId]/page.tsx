import { ConversationIdView } from "@/module/dashboard/ui/views/conversation-id-view";
import { Id } from "@workspace/backend/_generated/dataModel";

export default async function Page({ params }:{ params: Promise<{ conversationId: string }>}) {
    const { conversationId } = await params;
    return (
        <ConversationIdView conversationId={conversationId as Id<"conversation">} />
    )
}