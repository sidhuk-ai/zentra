import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip";

export const StatusGroupButton = ({
  children,
  content
}: {
  children: React.ReactNode;
  content: string;
}) => {
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};
