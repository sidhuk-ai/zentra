import { PremiumFeatureOverlay } from "@/module/billing/ui/components/premium-feature-overlay";
import { CustomizationView } from "@/module/customization/ui/views/customization-view";
import { Protect } from "@clerk/nextjs";

export default function Page() {
  return (
    <Protect
      condition={(has) => has({ plan: "pro" })}
      fallback={
        <PremiumFeatureOverlay>
          <CustomizationView />
        </PremiumFeatureOverlay>
      }
    >
      <CustomizationView />
    </Protect>
  );
}
