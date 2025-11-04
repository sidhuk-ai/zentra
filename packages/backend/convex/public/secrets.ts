import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecret } from "../lib/secrets";

export const getVapiSecrets = action({
    args: {
        organizationId: v.string()
    },
    handler: async (ctx,args): Promise<{publicApiKey: string;} | null | undefined> => {
        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: args.organizationId,
                service: "vapi"
            }
        );

        if(!plugin) return;

        const secrectName = plugin.secretName;
        const secret = await getSecret<{
            privateApiKey: string;
            publicApiKey: string;
        }>(secrectName);
        if(!secret) return null;
        if(!secret.publicApiKey) return null;
        if(!secret.privateApiKey) return null;

        return {
            publicApiKey: secret.publicApiKey
        }
    }
})