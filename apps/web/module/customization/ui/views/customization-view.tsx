"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { CustomizationForm } from "../components/customization-form";

export const CustomizationView = () => {
  const widgetSetting = useQuery(api.private.widgetSettings.getOne);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });
  const isLoading = widgetSetting === undefined || vapiPlugin === undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full h-full items-center justify-center flex-col gap-y-2">
        <Loader2Icon className="animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Loading widget settings...
        </p>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col p-8">
      <div className="max-w-screen-md mx-auto w-full">
        <div className="space-y-2">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Widget Customization</h1>
            <p className="text-muted-foreground">
              Customize how your chat widget looks and behaves for your customers
            </p>
          </div>
          <div className="mt-8">
            <CustomizationForm initialData={widgetSetting} hasVapiPlugin={!!vapiPlugin} />
          </div>
        </div>
      </div>
    </div>
  );
};
