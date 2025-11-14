"use client";

import { GlobeIcon, PhoneCall, PhoneIcon, WorkflowIcon } from "lucide-react";
import { Feature, PluginCard } from "../components/plugin-card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { toast } from "sonner";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { VapiConnectedView } from "../components/vapi-connected-view";
import { ConvexError } from "convex/values";

const formSchema = z.object({
  publicApiKey: z.string().min(1, "Public API key is required"),
  privateApiKey: z.string().min(1, "Private API key is required"),
});

const vapiFeatures: Feature[] = [
  {
    icon: GlobeIcon,
    label: "Web voice calls",
    description: "Voice chat directly in your app",
  },
  {
    icon: PhoneIcon,
    label: "Phone numbers",
    description: "Get dedicated business lines",
  },
  {
    icon: PhoneCall,
    label: "Outbound calls",
    description: "Automated customer reach",
  },
  {
    icon: WorkflowIcon,
    label: "Workflows",
    description: "Custom conversation flows",
  },
];

const VapiPluginRemoveForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const removePlugin = useMutation(api.private.plugins.remove);

  const onSubmit = async () => {
    try {
      await removePlugin({
        service: "vapi",
      });
      setOpen(false);
      toast.success("Disconnected Vapi successfully.");
    } catch (error) {
      console.error(error);
      if(error instanceof ConvexError) {
        const errorData = error.data as { code: string; message: string; };
        toast.error(errorData.code, {
          description: errorData.message
        });
      }
      toast.error("Something went wrong while disconnecting Vapi. Try again after some time");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border">
        <DialogHeader>
          <DialogTitle>Disconnect vapi</DialogTitle>
        </DialogHeader>
        <DialogDescription>Wanna disconnect?</DialogDescription>
        <DialogFooter>
          <Button className="cursor-pointer" onClick={onSubmit} variant={"destructive"}>Disconnect</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const VapiPluginForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const upsertForm = useMutation(api.private.secrets.upsertSecret);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicApiKey: "",
      privateApiKey: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await upsertForm({
        service: "vapi",
        value: {
          publicApiKey: values.publicApiKey,
          privateApiKey: values.privateApiKey,
        },
      });
      setOpen(false);
      toast.success("Successfully integrated Vapi");
    } catch (error) {
      if(error instanceof ConvexError) {
        const errorData = error.data as { code: string; message: string; };
        toast.error(errorData.code, {
          description: errorData.message
        });
      }
      toast.error("Something went wrong after submitting secret key values.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border">
        <DialogHeader>
          <DialogTitle>Enable vapi</DialogTitle>
        </DialogHeader>
        <DialogDescription>Something useful</DialogDescription>
        <Form {...form}>
          <form
            className="flex flex-col gap-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="publicApiKey"
              render={({ field }) => (
                <FormItem>
                  <Label>Public API key</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your public API key"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="privateApiKey"
              render={({ field }) => (
                <FormItem>
                  <Label>Private API key</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Your private API key"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const VapiView = () => {
  const vapiPlugin = useQuery(api.private.plugins.getOne, {
    service: "vapi",
  });
  const [connectOpen, setConnectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const toggleDialog = () => {
    if (vapiPlugin) {
      setRemoveOpen(true);
    } else {
      setConnectOpen(true);
    }
  };
  return (
    <>
      <VapiPluginForm open={connectOpen} setOpen={setConnectOpen} />
      <VapiPluginRemoveForm open={removeOpen} setOpen={setRemoveOpen} />
      <div className="flex min-h-screen flex-col p-8">
        <div className="mx-auto w-full max-w-screen-md">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Vapi Plugin</h1>
            <p className="text-muted-foreground">
              Something information about Vapi plugin
            </p>
          </div>
          <div className="mt-8">
            {!!vapiPlugin ? (
              <VapiConnectedView onDisconnect={toggleDialog} />
            ) : (
              <PluginCard
                serviceImage="/vapi.svg"
                serviceName="Vapi"
                features={vapiFeatures}
                isDisabled={vapiPlugin === undefined}
                onSubmit={toggleDialog}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
