"use client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { BotIcon, PhoneIcon, SettingsIcon, UnplugIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { useState } from "react";
import { VapiPhoneNumbersContent } from "./vapi-phone-numbers-content";
import { VapiAssistantsContent } from "./vapi-assistants-content";

interface VapiConnectedViewProps {
  onDisconnect: () => void;
}

export const VapiConnectedView = ({ onDisconnect }: VapiConnectedViewProps) => {
  const [activeTab, setActiveTab] = useState("phone-numbers");

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                alt="Vapi"
                className="rounded-lg object-contain"
                height={48}
                width={48}
                src={"/vapi.svg"}
              />
              <div className="">
                <CardTitle>Vapi Integrations</CardTitle>
                <CardDescription>
                  Manage your phone numbers and AI assistants
                </CardDescription>
              </div>
            </div>
            <Button
              variant={"destructive"}
              size={"sm"}
              onClick={onDisconnect}
              className="cursor-pointer"
            >
              <UnplugIcon />
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-muted">
                <SettingsIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="">
                <CardTitle>Widget configuration</CardTitle>
                <CardDescription>
                  Setup voice call for you chat widget
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href={"/customization"}>
                <SettingsIcon />
                Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Tabs
          className="gap-0"
          defaultValue="phone-numbers"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid h-12 w-full grid-cols-2 p-0">
            <TabsTrigger value="phone-numbers" className="h-full rounded-none cursor-pointer">
              <PhoneIcon />
              Phone
            </TabsTrigger>
            <TabsTrigger value="assistants" className="h-full rounded-none cursor-pointer">
              <BotIcon />
              AI assistants
            </TabsTrigger>
          </TabsList>
          <TabsContent value="phone-numbers">
            <VapiPhoneNumbersContent />
          </TabsContent>
          <TabsContent value="assistants">
            <VapiAssistantsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
