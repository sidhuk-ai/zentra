"use client";

import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

export const PricingTable = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-y-4">
            <ClerkPricingTable forOrganizations 
                appearance={{
                    elements: {
                        pricingTableCard: "shadow-none! border! border-boreder! rounded-lg!"
                    }
                }}
            />
        </div>
    )
}