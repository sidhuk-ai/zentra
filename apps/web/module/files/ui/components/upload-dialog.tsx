"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@workspace/backend/_generated/api";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { useAction } from "convex/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;
}

const formSchema = z.object({
  files: z.array(z.instanceof(File)),
  category: z.string(),
  filename: z.optional(z.string()),
});

export const UploadDialog = ({
  open,
  onOpenChange,
  onFileUploaded,
}: UploadDialogProps) => {
  const addFile = useAction(api.private.files.addFile);
  const [fileDetails, setFileDetails] = useState({
    filename: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      category: "",
      filename: "",
    },
  });

  const handleFileDrop = (files: File[]) => {
    const file = files[0];
    if (file) {
      form.setValue("filename",file.name)
    }
    form.setValue("files", files);
  };
  const handleUpload = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true);
    try {
      const blob = values.files[0];
      if (!blob) return;

      const filename = values.filename || blob.name;

      await addFile({
        bytes: await blob.arrayBuffer(),
        filename,
        mimeType: blob.type || "text/plain",
        category: values.category,
      });
      // console.log({values,filename});

      onFileUploaded?.();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
    // console.log(form.getValues("files"),form.getValues("filename"),form.getValues("category"));
  };
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg border-border">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload documents to your knowledge base for an AI-powered search and
            retrieval
          </DialogDescription>
        </DialogHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpload)}
              className="space-y-4"
            >
              <FieldGroup >
                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="gap-0.5">Category<span className="text-destructive">*</span></FormLabel>
                      <Input
                        {...field}
                        placeholder="e.g., Documentation, Support, Product"
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="filename"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="gap-0.5">
                        Filename{" "}
                        <span className="text-muted-foreground text-xs">
                          (optional)
                        </span>
                      </FormLabel>
                      <Input
                        {...field}
                        placeholder="Override default filename"
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="gap-0.5">Upload Files <span className="text-destructive">*</span></FormLabel>
                      <FormDescription>
                        Drag and drop your files here.
                      </FormDescription>
                      <FormControl>
                        <Dropzone
                          maxFiles={1}
                          onDrop={handleFileDrop}
                          src={field.value}
                        >
                          <DropzoneEmptyState />
                          <DropzoneContent />
                        </Dropzone>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldGroup>
              <DialogFooter>
                <Button
                  disabled={isUploading}
                  variant={"outline"}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  disabled={
                    isUploading ||
                    !form.watch("category") ||
                    form.watch("files").length === 0
                  }
                  variant={"outline"}
                  type="submit"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
