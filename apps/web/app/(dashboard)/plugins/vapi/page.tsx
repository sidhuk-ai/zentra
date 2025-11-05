import { PremiumFeatureOverlay } from "@/module/billing/ui/components/premium-feature-overlay";
import { VapiView } from "@/module/plugins/ui/views/vapi-view";
import { Protect } from "@clerk/nextjs";

export default function Page() {
    return (
        <Protect condition={(has) => has({ plan: "pro" })} fallback={
            <PremiumFeatureOverlay>
                <VapiView />
            </PremiumFeatureOverlay>
        }>
            <VapiView />
        </Protect>
    )
}