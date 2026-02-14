import FeaturesSection from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import HeroSection from "@/components/landing/hero-section";
import IntegrationsSection from "@/components/landing/integrations";
import Pricing from "@/components/landing/pricing";

export default function Page() {
    return (
        <>
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <Pricing />
        <Footer />
        </>
    )
}