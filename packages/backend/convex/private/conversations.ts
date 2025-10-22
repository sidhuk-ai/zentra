import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../_generated/dataModel";


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
                if(!contactSession) return null;

                const messages = await supportAgent.listMessages(ctx,{
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null }
                });
                if(messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }

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
