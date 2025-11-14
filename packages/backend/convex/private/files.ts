import { ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import { contentHashFromArrayBuffer, Entry, EntryId, guessMimeTypeFromContents, guessMimeTypeFromExtension, vEntryId } from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";

function guessMimeType(filename: string, bytes: ArrayBuffer): string {
    return (
        guessMimeTypeFromExtension(filename) ||
        guessMimeTypeFromContents(bytes) ||
        "application/octet-stream"
    );
}

export const addFile = action({
    args: {
        filename: v.string(),
        mimeType: v.string(),
        bytes: v.bytes(),
        category: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found"
            });
        }

        const orgId = identity.orgId as string;
        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found"
            });
        }

        const subscriptions = await ctx.runQuery(internal.system.subscriptions.getByOrganizationId, {
            organizationId: orgId
        });
        if (subscriptions?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing Subscription"
            });
        }

        const { bytes, filename, category } = args;
        const mimeType = args.mimeType || guessMimeType(filename, bytes);
        const blob = new Blob([bytes], { type: mimeType });

        const storageId = await ctx.storage.store(blob);
        const text = await extractTextContent(ctx, { filename, storageId, bytes, mimeType });

        const { entryId, created } = await rag.add(ctx, {
            namespace: orgId, // SUPER IMPORTANT
            text,
            key: filename,
            title: filename,
            metadata: {
                storageId,
                uploadedBy: orgId,
                filename,
                category: category ?? null
            } as EntryMetadata,
            contentHash: await contentHashFromArrayBuffer(bytes) // TODO: learn about this
        });

        if (!created) {
            console.debug("Entry already exists, skipping upload metadata");
            await ctx.storage.delete(storageId);
        }

        return {
            url: await ctx.storage.getUrl(storageId),
            entryId
        }
    }
});

export const deleteFile = mutation({
    args: {
        entryId: vEntryId
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            });
        }

        const orgId = identity.orgId as string;
        if (!orgId) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Organization not found"
            });
        }

        const namespace = await rag.getNamespace(ctx, { namespace: orgId });
        if (!namespace) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid namespace"
            });
        }

        const entry = await rag.getEntry(ctx, { entryId: args.entryId });
        if (!entry) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Entry not found"
            });
        };

        if (entry.metadata?.uploadedBy !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            });
        }

        if (entry.metadata?.storageId) {
            await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
        }

        await rag.deleteAsync(ctx, {
            entryId: args.entryId
        });
    }
})

export const listFile = query({
    args: {
        category: v.optional(v.string()),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            });
        }

        const orgId = identity.orgId as string;
        if (!orgId) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Organization not found"
            });
        }

        const namespace = await rag.getNamespace(ctx, {
            namespace: orgId
        });
        if (!namespace) {
            return { page: [], isDone: true, continueCursor: "" };
        }

        const results = await rag.list(ctx, {
            namespaceId: namespace.namespaceId,
            paginationOpts: args.paginationOpts
        });

        const files = await Promise.all(
            results.page.map((entry) => convertEntryToPublicFile(ctx, entry))
        );
        const filteredFile = args.category ? files.filter((file) => file.category === args.category) : files;

        return {
            page: filteredFile,
            continueCursor: results.continueCursor,
            isDone: results.isDone
        }
    }
});

export type PublicFile = {
    id: EntryId;
    name: string;
    type: string;
    size: string;
    status: "ready" | "processing" | "error";
    url: string | null;
    category?: string
}
type EntryMetadata = {
    storageId: Id<"_storage">;
    uploadedBy: string;
    filename: string;
    category?: string | null;
}

async function convertEntryToPublicFile(ctx: QueryCtx, entry: Entry): Promise<PublicFile> {
    const metadata = entry.metadata as EntryMetadata || undefined;
    const storageId = metadata?.storageId;
    let fileSize = "unknown";

    if (storageId) {
        try {
            const storageMetadata = await ctx.db.system.get(storageId);
            if (storageMetadata) {
                fileSize = fileSizeFormatter(storageMetadata.size);
            }
        } catch (error) {
            console.error("Failed to get storage metadata", error);
        }
    }

    const filename = entry.key || "Unknown";
    const extension = filename.split(".").pop()?.toLowerCase() || "txt"

    let status: "ready" | "processing" | "error" = "error";
    if (entry.status === "ready") {
        status = "ready";
    } else if (entry.status === "pending") {
        status = "processing"
    }

    const url = storageId ? await ctx.storage.getUrl(storageId) : null;

    return {
        id: entry.entryId,
        name: filename,
        type: extension,
        size: fileSize,
        status,
        url,
        category: metadata?.category || undefined
    }
};

function fileSizeFormatter(byteSize: number): string {
    if (byteSize === 0) {
        return "0 B";
    }
    const kB = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(byteSize) / Math.log(kB));

    return `${Number.parseFloat((byteSize / kB ** i).toFixed(1))} ${sizes[i]}`;
}