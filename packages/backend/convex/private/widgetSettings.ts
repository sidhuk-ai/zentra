import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getOne = query({
    args: {},
    handler: async (ctx) => {
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

        const widgetSetting = await ctx.db.query("widgetSettings").withIndex("by_organization_id", (q) => q.eq("organizationId", orgId)).unique();

        return widgetSetting;
    }
})

export const upsert = mutation({
    args: {
        greetMessage: v.string(),
        defaultSuggestions: v.object({
            suggestion1: v.optional(v.string()),
            suggestion2: v.optional(v.string()),
            suggestion3: v.optional(v.string()),
        }),
        vapiSettings: v.object({
            assistantId: v.optional(v.string()),
            phoneNumber: v.optional(v.string())
        })
    },
    handler: async (ctx,args) => {
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

        const existingWidgetSetting = await ctx.db.query("widgetSettings").withIndex("by_organization_id", (q) => q.eq("organizationId", orgId)).unique();
        if(existingWidgetSetting) {
            await ctx.db.patch(existingWidgetSetting._id,{
                greetMessage: args.greetMessage,
                vapiSettings: args.vapiSettings,
                defaultSuggestions: args.defaultSuggestions
            });
        } else {
            await ctx.db.insert("widgetSettings",{
                organizationId: orgId,
                greetMessage: args.greetMessage,
                vapiSettings: args.vapiSettings,
                defaultSuggestions: args.defaultSuggestions
            })
        }
    }
})