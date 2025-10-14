import { Button } from "@workspace/ui/components/button";
import { useSetAtom } from "jotai";
import { ArrowLeft } from "lucide-react";
import { conversationIdAtom, screenAtom } from "@/modules/widgets/atoms/widget-atoms";

export function NavigationHeader() {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  }
  return (
    <Button className="cursor-pointer" variant={"outline"} size={"icon-lg"} onClick={onBack}>
      <ArrowLeft />
    </Button>
  );
}
