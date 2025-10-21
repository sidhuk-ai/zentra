import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { saveMessage, MessageDoc } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";

export const getOne = query({
    args: {
        conversationId: v.id("conversation"),
        contactSessionId: v.id("contactSession")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session"
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) return null;
        if (conversation.contactSessionId !== args.contactSessionId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Access denied"
            })
        }

        return {
            _id: conversation._id,
            status: conversation.status,
            threadId: conversation.threadId
        }
    }
})

export const getMany = query({
    args: {
        contactSessionId: v.id("contactSession"),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session"
            });
        }

        // Needs optimization
        const conversations = await ctx.db.query("conversation")
        .withIndex("by_contact_session_id", (q) => q.eq("contactSessionId", args.contactSessionId))
        .order("desc").paginate(args.paginationOpts);

        const conversationWithLastMessage = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage:MessageDoc | null = null;

                const message = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null }
                });

                if(message.page.length > 0) {
                    lastMessage = message.page[0] ?? null;
                }

                return {
                    _id: conversation._id,
                    creationTime: conversation._creationTime,
                    status: conversation.status,
                    organizationId: conversation.threadId,
                    lastMessage: lastMessage
                };
            })
        );

        return {
            ...conversations,
            page: conversationWithLastMessage
        };
    }
})

export const create = mutation({
    args: {
        organizationId: v.string(),
        contactSessionId: v.id("contactSession")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if (!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session"
            })
        }

        const { threadId } = await supportAgent.createThread(ctx, {
            userId: args.organizationId
        });

        await saveMessage(ctx, components.agent, {
            threadId,
            message: {
                role: "assistant",
                content: "Hello, how can I help you today?"
            }
        })
        const conversationId = await ctx.db.insert("conversation", {
            contactSessionId: session._id,
            organizationId: args.organizationId,
            status: "unresolved",
            threadId
        })

        return conversationId;
    }
})