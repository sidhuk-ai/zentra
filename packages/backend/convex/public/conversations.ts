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

        // --- START OF FIX --- INFO: USE OF AI FOR THE "EMPTY MESSAGE" BUG
        const conversationWithLastMessage = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null; // 'MessageDoc' type from your agent

                // 1. Fetch the last 5 messages (or more, if needed)
                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    // Fetch a few, not just 1
                    paginationOpts: { numItems: 5, cursor: null }
                });

                // 2. Find the *first* (most recent) message that is 'user' or 'assistant'
                //    (Assuming MessageDoc has the shape from your logs)
                const lastVisibleMessage = messages.page.find(msg =>
                    msg.message?.role === "user" || msg.message?.role === "assistant"
                );

                // 3. Assign it, otherwise it stays null
                if (lastVisibleMessage) {
                    lastMessage = lastVisibleMessage;
                }

                return {
                    _id: conversation._id,
                    creationTime: conversation._creationTime,
                    status: conversation.status,
                    organizationId: conversation.threadId, // This might be a typo, maybe conversation.organizationId?
                    lastMessage: lastMessage
                };
            })
        );

        // --- END OF FIX ---

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