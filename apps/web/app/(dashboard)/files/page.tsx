import { PremiumFeatureOverlay } from "@/module/billing/ui/components/premium-feature-overlay";
import { FilesView } from "@/module/files/ui/views/files-view";
import { Protect } from "@clerk/nextjs";

export default function Page() {
    return (
        <Protect condition={(has) => has({ plan: "pro" })} fallback={<PremiumFeatureOverlay>
            <FilesView />
        </PremiumFeatureOverlay>}>
            <FilesView />
        </Protect>
    )
}