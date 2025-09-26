import { Metadata } from 'next'
import { HowItWorksHero } from '@/components/how-it-works/hero'
import { CoreMechanism } from '@/components/how-it-works/core-mechanism'
import { ProcessSteps } from '@/components/how-it-works/process-steps'
import { AIModelsSection } from '@/components/how-it-works/ai-models-section'
import { BenefitsGrid } from '@/components/how-it-works/benefits-grid'
import { TechnicalDetails } from '@/components/how-it-works/technical-details'
import { FAQSection } from '@/components/how-it-works/faq-section'
import { CTASection } from '@/components/how-it-works/cta-section'

export const metadata: Metadata = {
  title: 'How It Works - Juicy Links',
  description: 'Discover how Juicy Links gets your business into AI model training data so you get recommended when users ask for suggestions. Advanced AI-powered SEO for the future.',
  keywords: 'AI SEO, machine learning, business recommendations, AI model inclusion, LLM optimization',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HowItWorksHero />
      <CoreMechanism />
      <ProcessSteps />
      <AIModelsSection />
      <BenefitsGrid />
      <TechnicalDetails />
      <FAQSection />
      <CTASection />
    </div>
  )
}
