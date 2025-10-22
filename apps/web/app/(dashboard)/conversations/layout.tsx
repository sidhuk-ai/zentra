import { ConversationLayout } from "@/module/dashboard/ui/layouts/conversation-layout";

export default function Layout({ children }:{ children: React.ReactNode }) {
    return (
        <ConversationLayout>
            {children}
        </ConversationLayout>
    )
}