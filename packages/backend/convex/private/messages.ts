import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { components } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { paginationOptsValidator } from "convex/server";
import { saveMessage } from "@convex-dev/agent";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { OPERATOR_MESSAGE_ENHANCEMENT_PROMPT } from "../../constant";
import { secreTs } from "../lib/secrets";

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
    // --- START OF FIX ---
    // The upstream listMessages returns pages that may include non-visible roles (e.g. "tool").
    // Filtering after fetching a single page breaks pagination because continueCursor/isDone
    // then refer to the unfiltered page. Implement looped pagination to accumulate only
    // visible messages (user/assistant) until we fill the requested numItems or exhaust upstream.

    const requested = args.paginationOpts.numItems;
    let nextCursor: string | undefined | null = args.paginationOpts.cursor as
      | string
      | undefined
      | null;

    // Cursor corresponding to the last fully consumed upstream page.
    // If we stop in the middle of a page, we return the cursor up to the last
    // fully consumed page to avoid skipping messages on the next request.
    let lastFullyConsumedCursor: string | undefined | null = undefined;

    // Collected visible messages to return (use loose typing to avoid depending on upstream types)
    const collected: any[] = [];

    let upstreamIsDone = false;
    // Safety cap to avoid infinite loops if upstream keeps returning empty pages
    // of only filtered-out roles while not marking isDone. We will iterate up to
    // a reasonable number of pages (e.g., 20) which should far exceed realistic needs
    // for a single client page.
    const MAX_PAGES = 20;
    let pagesFetched = 0;

    while (collected.length < requested && pagesFetched < MAX_PAGES) {
      pagesFetched++;
      const res = await supportAgent.listMessages(ctx, {
        threadId: args.threadId,
        paginationOpts: {
          cursor: nextCursor as any,
          numItems: args.paginationOpts.numItems,
        },
      });

      const filtered = res.page.filter(
        (msg) => msg.message?.role === "user" || msg.message?.role === "assistant"
      );

      const remaining = requested - collected.length;
      if (filtered.length <= remaining) {
        // We fully consume this upstream page of visible messages
        collected.push(...filtered);
        lastFullyConsumedCursor = res.continueCursor ?? null;
      } else {
        // We only need part of this upstream page; do NOT advance the fully-consumed cursor
        collected.push(...filtered.slice(0, remaining));
        // Keep lastFullyConsumedCursor as-is so we don't skip the remaining items next time
      }

      upstreamIsDone = res.isDone;
      nextCursor = res.continueCursor ?? null;

      if (upstreamIsDone) break;
      if (!nextCursor) break; // No cursor to continue with
    }

    const isDone = upstreamIsDone && collected.length < requested;

    // Determine the continue cursor to return to the client.
    // - If we exhausted upstream and still didn't fill requested => done, return undefined cursor.
    // - If we stopped mid-page, return the cursor for the last fully consumed upstream page
    //   to avoid skipping items. Otherwise, return the upstream cursor for the next page.
    const continueCursor = isDone
      ? undefined
      : (lastFullyConsumedCursor ?? nextCursor ?? undefined);

    return {
      page: collected,
      isDone,
      continueCursor: continueCursor ?? "",
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
          content: `Please enhance the following operator message: "${args.prompt}"`
        }
      ],

    });

    return response.text;
  }
})