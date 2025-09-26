import { HeroSection } from "@/components/hero-section";
import { SuccessStorySection } from "@/components/success-story-section";
import { AIModelsSection } from "@/components/ai-models-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SuccessStorySection />
      <AIModelsSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </>
  );
}