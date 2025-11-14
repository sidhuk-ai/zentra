"use client";

import { useOrganization } from "@clerk/nextjs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { createScript } from "../../utils";

export const IntegrationsView = () => {
  const { organization } = useOrganization();
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");

  const handleIntegrationsClick = (integrationId: IntegrationId) => {
    if(!organization) {
      toast.error("Organization ID not found");
      return;
    }

    const snippet = createScript(integrationId, organization.id);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  }
  const handleCopy = async () => {
    if (!organization?.id) return;

    try {
      await navigator.clipboard.writeText(organization.id);
      setCopied(true);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <IntegrationsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
      <div className="flex min-h-screen flex-col p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Setup &amp; Integrations</h1>
            <p className="text-muted-foreground">
              Choose the integration that&apos;s right for you
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <Label className="w-34" htmlFor="organization-id">
                Organization Id
              </Label>
              <InputGroup>
                <InputGroupInput
                  className="flex-1 bg-background font-mono text-sm"
                  disabled
                  id="organization-id"
                  readOnly
                  value={organization?.id || ""}
                />
                <InputGroupAddon align={"inline-end"}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InputGroupButton
                        className="gap-2 cursor-pointer"
                        onClick={handleCopy}
                        size={"icon-sm"}
                      >
                        {copied ? (
                          <CheckIcon className="size-4" />
                        ) : (
                          <CopyIcon className="size-4" />
                        )}
                      </InputGroupButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copied ? "Copied" : "Copy"}
                    </TooltipContent>
                  </Tooltip>
                </InputGroupAddon>
              </InputGroup>
            </div>
            <Separator className="my-8" />
            <div className="space-y-6">
              <div className="space-y-1">
                <Label className="text-lg">Integrations</Label>
                <p className="text-muted-foreground text-sm">
                  Add the following code to your website to enable chatbox.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {INTEGRATIONS.map((integration) => (
                  <button
                    key={integration.id}
                    className="flex items-center gap-4 rounded-lg border border-border cursor-pointer bg-background p-4 hover:bg-accent"
                    type="button"
                    onClick={() => handleIntegrationsClick(integration.id)}
                  >
                    <Image
                      alt={integration.title}
                      src={integration.icon}
                      height={32}
                      width={32}
                    />
                    {integration.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!snippet) return;

    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border">
        <DialogHeader>
          <DialogTitle>Integrate with your website</DialogTitle>
          <DialogDescription>
            Follow these steps to add chatbox to your website.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-all rounded-md bg-foreground p-2 font-mono text-secondary text-sm">
                {snippet}
              </pre>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="absolute top-4 right-6 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={handleCopy}
                    size={"icon"}
                    variant={"secondary"}
                  >
                    {copied ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <CopyIcon className="size-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              2. Add the code in your page
            </div>
            <p className="text-muted-foreground text-sm">
              Paste the chatbox code above in your page. You can add it in the
              HTML head section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
