import { ConvexError, v } from "convex/values";
import { action, query } from "../_generated/server";
import { components, internal } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation";
import { saveMessage } from "@convex-dev/agent";

export const create = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    contactSessionId: v.id("contactSession"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.runQuery(
      internal.system.contactSession.getOne,
      { contactSessionId: args.contactSessionId }
    );

    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session"
      });
    }

    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      {
        threadId: args.threadId
      }
    );
    if (!conversation) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversations not found"
      });
    }
    if (conversation.status === "resolved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Conversation resolved"
      });
    }

    const shouldTriggerAgent = conversation.status === "unresolved";

    if (shouldTriggerAgent) {
      // console.log("AI Trigger Attempt", {
      //   threadId: args.threadId,
      //   prompt: args.prompt,
      //   status: conversation.status,
      //   time: Date.now()
      // });
      await supportAgent.generateText(ctx,
        {
          threadId: args.threadId
        },
        {
          prompt: args.prompt,
          tools: {
            resolveConversation,
            escalateConversation
          }
        }
      );
      // console.log("AI Trigger Attempt", {
      //   threadId: args.threadId,
      //   prompt: args.prompt,
      //   status: conversation.status,
      //   time: Date.now(),
      //   response: response.text
      // });
    } else {
      // console.log("Shouldn't reach here");
      await saveMessage(ctx, components.agent, {
        threadId: args.threadId,
        prompt: args.prompt
      });
    }
  },
});

export const getMany = query({
  args: {
    threadId: v.string(),
    contactSessionId: v.id("contactSession"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);
    if (!contactSession || contactSession.expiresAt < Date.now()) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Invalid session"
      });
    }

    const paginated = await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts
    });
    return paginated;
  }
})