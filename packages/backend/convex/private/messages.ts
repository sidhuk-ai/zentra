import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../../constant";

export const create = mutation({
  args: {
    prompt: v.string(),
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
        message: "Conversations not found"
      });
    }
    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID"
      })
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved"
      });
    }

    if (conversation.status === "unresolved") {
      await ctx.db.patch(args.conversationId, {
        status: "escalated"
      });
    }

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: identity.familyName,
      message: {
        role: "assistant",
        content: args.prompt
      }
    })
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
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

    const conversation = await ctx.db.query("conversation").withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId)).unique();
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "No conversation found"
      });
    }

    if (conversation.organizationId !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid Organization ID"
      })
    }
    // --- START OF FIX --- INFO: USE OF AI FOR THE "EMPTY MESSAGE" BUG

    // 1. Get the paginated list, which includes 'tool' messages
    const paginatedMessages = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts
    });

    // 2. Filter the 'page' array to only include visible messages
    const visibleMessages = paginatedMessages.page.filter(msg =>
      msg.message?.role === "user" || msg.message?.role === "assistant"
    );

    // 3. Return the pagination object, but with the *filtered* page
    return {
      ...paginatedMessages, // This keeps 'isDone' and 'continueCursor'
      page: visibleMessages
    };

    // --- END OF FIX ---
  }
});

export const enhanceResponse = action({
  args: {
    prompt: v.string()
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

    const response = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "system",
          content: OPERATOR_MESSAGE_ENHANCEMENT_PROMPT
        },
        {
          role: "user",
          content: args.prompt
        }
      ],

    });

    return response.text;
  }
})