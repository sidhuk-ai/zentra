"use client";

import { api } from "@workspace/backend/_generated/api";
import type { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { useMutation } from "convex/react";
import { useState } from "react";

interface DeleteFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileDeleted?: () => void;
  file: PublicFile | null;
}

export const DeleteFileDialog = ({
  open,
  onOpenChange,
  onFileDeleted,
  file,
}: DeleteFileDialogProps) => {
  const deleteFile = useMutation(api.private.files.deleteFile);
  const [isDeleteing, setIsDeleteing] = useState(false);

  const handleDelete = async () => {
    if(!file) return;

    setIsDeleteing(true);
    try {
      await deleteFile({ entryId: file.id });
      onFileDeleted?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleteing(false);
    }
  }
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md border-border">
        <DialogHeader>
          <DialogTitle>
            Delete File
          </DialogTitle>
          <DialogDescription>description</DialogDescription>
        </DialogHeader>
        {file && (
          <div className="py-4">
            <div className="border border-border rounded-lg bg-muted p-4">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground text-sm">
                Type: {file.type.toUpperCase()} | Size: {file.size}
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} disabled={isDeleteing} variant={"outline"}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isDeleteing || !file} variant={"destructive"}>
            {isDeleteing ? "Deleteing..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
