import { v } from "convex/values";
// yaha par actions use kar rahe hai instead of mutation kyuki actions mei ham third-party api ya fir SDK
// se fetch karwa sakte hai without any error. Mutation se error aata hai
import { action } from "../_generated/server";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || ""
});

export const validate = action({
    args: {
        organizationId: v.string()
    },
    handler: async (_,args) => {
        try {
            await clerkClient.organizations.getOrganization({
                organizationId: args.organizationId
            });
            return { valid: true }
        } catch {
            return { valid: false, reason: "Organizations not valid" }
        }
    }
})