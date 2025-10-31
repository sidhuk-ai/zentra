import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const upsert = internalMutation({
    args: {
        service: v.union(v.literal("vapi")),
        secretName: v.string(),
        organizationId: v.string()
    },
    handler: async (ctx,args) => {
        const existingPlugin = await ctx.db.query("plugins").withIndex("by_organization_id_and_service", (q) => q.eq("organizationId", args.organizationId).eq("service",args.service)).unique();

        if(existingPlugin) {
            await ctx.db.patch(existingPlugin._id, {
                service: args.service,
                secretName: args.secretName
            });
        } else {
            await ctx.db.insert("plugins", {
                organizationId: args.organizationId,
                service: args.service,
                secretName: args.secretName
            });
        };
    }
});

export const getByOrganizationIdAndService = internalQuery({
    args: {
        orgainzationId: v.string(),
        service: v.union(v.literal("vapi"))
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("plugins").withIndex("by_organization_id_and_service", (q) => q.eq("organizationId",args.orgainzationId).eq("service",args.service)).unique();
    }
})