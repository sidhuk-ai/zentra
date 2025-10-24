import { Doc } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { StatusGroupButton } from "@workspace/ui/components/status-group-button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import React from "react";

export const ConversationStatusButton = ({
  status,
  handleToggleStatusChange,
  isDisabled
}: {
  status: Doc<"conversation">["status"];
  handleToggleStatusChange: () => void;
  isDisabled: boolean;
}) => {
  if (status === "unresolved") {
    return (
      <StatusGroupButton content="Mark it as Escalated">
        <Button
          size={"sm"}
          className="cursor-pointer"
          variant={"destructive"}
          onClick={handleToggleStatusChange}
          disabled={isDisabled}
        >
          <ArrowRightIcon />
          <span>Unresolved</span>
        </Button>
      </StatusGroupButton>
    );
  }
  if (status === "resolved") {
    return (
      <StatusGroupButton content="Mark it as Unresolved">
        <Button
          size={"sm"}
          className="cursor-pointer"
          variant={"resolved"}
          onClick={handleToggleStatusChange}
          disabled={isDisabled}
        >
          <CheckIcon />
          <span>Resolved</span>
        </Button>
      </StatusGroupButton>
    );
  }
  if (status === "escalated") {
    return (
      <StatusGroupButton content="Mark it as Resolved">
        <Button
          size={"sm"}
          className="cursor-pointer"
          variant={"escalated"}
          onClick={handleToggleStatusChange}
          disabled={isDisabled}
        >
          <ArrowUpIcon />
          <span>Escalated</span>
        </Button>
      </StatusGroupButton>
    );
  }
};
