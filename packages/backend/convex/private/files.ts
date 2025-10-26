import { ConvexError, v } from "convex/values";
import { action, mutation } from "../_generated/server";
import { contentHashFromArrayBuffer, guessMimeTypeFromContents, guessMimeTypeFromExtension, vEntryId } from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/ai/rag";
import { Id } from "../_generated/dataModel";

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

        const { bytes, filename, category } = args;
        const mimeType = args.mimeType || guessMimeType(filename,bytes);
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
            },
            contentHash: await contentHashFromArrayBuffer(bytes) // TODO: learn about this
        });

        if(!created) {
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
    handler: async (ctx,args) => {
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

        const namespace = await rag.getNamespace(ctx,{ namespace: orgId });
        if(!namespace) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Inavlid namesapce"
            });
        }

        const entry = await rag.getEntry(ctx, { entryId: args.entryId });
        if(!entry){
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Entry not found"
            });
        };

        if(entry.metadata?.uploadedBy !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Organization ID"
            });
        }

        if(entry.metadata?.storageId) {
            await ctx.storage.delete(entry.metadata.storageId as Id<"_storage">);
        }

        await rag.deleteAsync(ctx, {
            entryId: args.entryId
        });
    }
})