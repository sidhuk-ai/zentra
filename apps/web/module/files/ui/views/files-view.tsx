"use client";
import { api } from "@workspace/backend/_generated/api";
import { Badge } from "@workspace/ui/components/badge";
import { InfinteScrollTrigger } from "@workspace/ui/components/infinte-scroll-trigger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { usePaginatedQuery } from "convex/react";
import type { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { FileIcon, MoreHorizontalIcon, Plus, Trash2Icon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { UploadDialog } from "../components/upload-dialog";
import { useState } from "react";
import { DeleteFileDialog } from "../components/delete-file-dialog";

export const FilesView = () => {
  const files = usePaginatedQuery(
    api.private.files.listFile,
    {},
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    isLoadingFirstPage,
    isLoadingMore,
    handleLoadMore,
    canLoadMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  });
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);

  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  }
  const fileDeleted = () => {
    setSelectedFile(null);
  }

  return (
    <>
    <DeleteFileDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onFileDeleted={fileDeleted} file={selectedFile} />
      <UploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
      <div className="flex min-h-screen flex-col p-8">
        <div className="mx-auto w-full max-w-screen-lg">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Knowledge Base</h1>
            <p className="text-muted-foreground">Upload files</p>
          </div>
          <div className="mt-8 rounded-lg border bg-background border-border">
            <div className="flex items-center justify-end border-b border-b-border px-6 py-4">
              <Button onClick={() => setUploadDialogOpen(true)} className="cursor-pointer">
                <Plus /> Add New
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-b-border">
                  <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                  <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                  <TableHead className="px-6 py-4 font-medium">Size</TableHead>
                  <TableHead className="px-6 py-4 font-medium">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  if (isLoadingFirstPage) {
                    return (
                      <TableRow className="hover:bg-background">
                        <TableCell className="h-24 text-center" colSpan={4}>
                          Loading files...
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (files.results.length === 0) {
                    return (
                      <TableRow className="hover:bg-background">
                        <TableCell className="h-24 text-center" colSpan={4}>
                          No files found
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return files.results.map((file) => (
                    <TableRow className="hover:bg-muted" key={file.id}>
                      <TableCell className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <FileIcon className="size-4" />
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                        <Badge className="uppercase" variant={"outline"}>
                          {file.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-muted-foreground">
                        {file.size}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size={"icon-sm"}
                              variant={"ghost"}
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="border-border" align="end">
                            <DropdownMenuItem
                              variant={"destructive"}
                              onClick={() => handleDeleteClick(file)}
                            >
                              <Trash2Icon className="size-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
            {!isLoadingFirstPage && files.results.length > 0 && (
              <div className="border-t border-t-border">
                <InfinteScrollTrigger
                  ref={topElementRef}
                  isLoadingMore={isLoadingMore}
                  canLoadMore={canLoadMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
