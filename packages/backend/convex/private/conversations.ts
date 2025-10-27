import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../_generated/dataModel";

export const getOne = query({
    args: {
        conversationId: v.id("conversation")
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

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid organization ID"
            })
        }

        const contactSession = await ctx.db.get(conversation.contactSessionId);
        if (!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Contact Sesion not found"
            })
        }

        return {
            ...conversation,
            contactSession
        }
    }
})

export const updateStatus = mutation({
    args: {
        conversationId: v.id("conversation"),
        status: v.union(
            v.literal("resolved"),
            v.literal("unresolved"),
            v.literal("escalated")
        )
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

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found"
            })
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid organization ID"
            })
        }

        await ctx.db.patch(args.conversationId, {
            status: args.status
        });
    }
})

export const getMany = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(
            v.union(
                v.literal("resolved"),
                v.literal("unresolved"),
                v.literal("escalated")
            )
        )
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

        let conversations: PaginationResult<Doc<"conversation">>;

        if (args.status) {
            conversations = await ctx.db.query("conversation")
                .withIndex(
                    "by_status_and_organization_id",
                    (q) => q.eq("status", args.status as Doc<"conversation">["status"]).eq("organizationId", orgId)
                ).order("desc").paginate(args.paginationOpts);
        } else {
            conversations = await ctx.db.query("conversation")
                .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
                .order("desc").paginate(args.paginationOpts);
        }

        const conversationWithAdditionalData = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null;

                const contactSession = await ctx.db.get(conversation.contactSessionId);
                if (!contactSession) return null;
                // --- START OF FIX --- INFO: USE OF AI FOR THE "EMPTY MESSAGE" BUG

                // 1. Fetch the last 5 messages (or more)
                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 5, cursor: null }
                });

                // 2. Find the *first* (most recent) message that is 'user' or 'assistant'
                const lastVisibleMessage = messages.page.find(msg =>
                    msg.message?.role === "user" || msg.message?.role === "assistant"
                );

                // 3. Assign it, otherwise it stays null
                if (lastVisibleMessage) {
                    lastMessage = lastVisibleMessage;
                }

                // --- END OF FIX ---
                return {
                    ...conversation,
                    lastMessage,
                    contactSession
                };
            })
        );

        const validConversations = conversationWithAdditionalData.filter(
            (conv): conv is NonNullable<typeof conv> => conv !== null
        );

        return {
            ...conversations,
            page: validConversations
        }
    }
})
