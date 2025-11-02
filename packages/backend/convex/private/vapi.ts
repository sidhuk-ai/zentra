import { ConvexError } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecret } from "../lib/secrets";
import { VapiClient, Vapi } from "@vapi-ai/server-sdk"

export const getAssistants = action({
    args: {},
    handler: async (ctx) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if(!userIdentity) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            })
        }

        const orgId = userIdentity.orgId as string;
        if(!orgId) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            })
        }

        const plugins = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: orgId,
                service: "vapi"
            }
        );
        if(!plugins) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "No plugins found"
            });
        }

        const secretData = await getSecret<{ publicApiKey: string; privateApiKey: string; }>(plugins.secretName);
        if(!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Can't able to get the credentials"
            });
        }
        if(!secretData.publicApiKey || !secretData.privateApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials missing"
            });
        }

        const vapiClient = new VapiClient({
            token: secretData.privateApiKey
        });

        const assistants: Vapi.Assistant[] = await vapiClient.assistants.list();
        
        return assistants;
    }
})

export const getPhoneNumbers = action({
    args: {},
    handler: async (ctx) => {
        const userIdentity = await ctx.auth.getUserIdentity();
        if(!userIdentity) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            })
        }

        const orgId = userIdentity.orgId as string;
        if(!orgId) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Identity not found"
            })
        }

        const plugins = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: orgId,
                service: "vapi"
            }
        );
        if(!plugins) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "No plugins found"
            });
        }

        const secretData = await getSecret<{ publicApiKey: string; privateApiKey: string; }>(plugins.secretName);
        if(!secretData) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Can't able to get the credentials"
            });
        }
        if(!secretData.publicApiKey || !secretData.privateApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials missing"
            });
        }

        const vapiClient = new VapiClient({
            token: secretData.privateApiKey
        });

        const phoneNumbers: Vapi.PhoneNumbersListResponseItem[] = await vapiClient.phoneNumbers.list();
        
        return phoneNumbers;
    }
})