import { ConversationIdLayout } from "@/module/dashboard/ui/layouts/coversation-id-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ConversationIdLayout>
            {children}
        </ConversationIdLayout>
    )
}