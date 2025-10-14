import { api } from "@workspace/backend/_generated/api"
import { useQuery } from "convex/react"
import { useAtomValue } from "jotai"
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom } from "../atoms/widget-atoms"

export function WidgetChatScreen() {
    const conversationId = useAtomValue(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(
        contactSessionIdAtomFamily(organizationId || "")
    );
    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId ? {
            conversationId,
            contactSessionId
        } : "skip"
    )
    return (
        <p>
        {JSON.stringify(conversation)}
        </p>
    )
}