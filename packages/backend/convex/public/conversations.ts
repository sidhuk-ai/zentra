import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { saveMessage } from "@convex-dev/agent";
import { components } from "../_generated/api";

export const getOne = query({
    args: {
        conversationId: v.id("conversation"),
        contactSessionId: v.id("contactSession")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if(!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session"
            })
        }

        const conversation = await ctx.db.get(args.conversationId);

        if(!conversation) return null;
        if(conversation.contactSessionId !== args.contactSessionId) {
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

export const create = mutation({
    args: {
        organizationId: v.string(),
        contactSessionId: v.id("contactSession")
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.contactSessionId);

        if(!session || session.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid Session"
            })
        }

        const { threadId } = await supportAgent.createThread(ctx,{
            userId: args.organizationId
        });

        await saveMessage(ctx,components.agent,{
            threadId,
            message: {
                role: "assistant",
                content: "Hello, how can I help you today?"
            }
        })
        const conversationId = await ctx.db.insert("conversation",{
            contactSessionId: session._id,
            organizationId: args.organizationId,
            status: "unresolved",
            threadId
        })

        return conversationId;
    }
})