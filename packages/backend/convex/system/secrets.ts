import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { createOrUpdateSecret } from "../lib/secrets";
import { internal } from "../_generated/api";

export const upsert = internalAction({
    args: {
        organizationId: v.string(),
        service: v.union(v.literal("vapi")),
        value: v.any()
    },
    handler: async (ctx,args) => {
        const secretName = `tenant-${args.organizationId}-${args.service}`;

        await createOrUpdateSecret(secretName, args.value);

        await ctx.runMutation(internal.system.plugins.upsert, {
            organizationId: args.organizationId,
            secretName,
            service: args.service
        });

        return { status: "success" }
    }
})