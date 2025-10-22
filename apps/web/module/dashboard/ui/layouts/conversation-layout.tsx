import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@workspace/ui/components/resizable"
import ConversationPanel from "../components/conversation-panel"

export const ConversationLayout = ({ children }:{ children: React.ReactNode }) => {
    return (
        <ResizablePanelGroup className="h-full flex-1" direction="horizontal">
            <ResizablePanel className="w-full" defaultSize={30} maxSize={30} minSize={20}>
                <ConversationPanel />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="h-full" defaultSize={70}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}