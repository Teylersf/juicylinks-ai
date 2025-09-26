"use client"

import { 
  Bot, 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3, 
  Target, 
  Sparkles,
  CheckCircle
} from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "22 AI Models Integration",
    description: "Train all major AI models including Grok, GPT-5, Claude 4, Gemini 2.5, and Perplexity with targeted prompts daily.",
    benefits: ["22 models across 5 platforms", "Latest AI technology", "Comprehensive coverage"]
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics Dashboard",
    description: "Real-time monitoring with detailed logs, filtering, CSV export, and performance tracking across all AI platforms.",
    benefits: ["Live queue status", "Comprehensive logging", "Export functionality"]
  },
  {
    icon: BarChart3,
    title: "Business Management Suite",
    description: "Complete business profile management with guided onboarding, editing tools, and multi-business support.",
    benefits: ["Guided 4-step wizard", "Full CRUD operations", "Multi-business plans"]
  },
  {
    icon: Target,
    title: "Smart Prompt Configuration",
    description: "AI-generated prompts or custom templates with variable substitution and live preview functionality.",
    benefits: ["AI-generated prompts", "Custom templates", "Live preview system"]
  },
  {
    icon: Zap,
    title: "Automated Processing",
    description: "Vercel cron jobs with rate limiting, queue management, and 24/7 automated prompt submission.",
    benefits: ["Daily automation", "Rate limiting", "Queue management"]
  },
  {
    icon: Shield,
    title: "Enterprise Features",
    description: "Professional UI/UX, dark/light themes, form validation, error handling, and production-ready architecture.",
    benefits: ["Enterprise security", "Professional design", "Scalable architecture"]
  }
]

const processSteps = [
  {
    step: "01",
    title: "Guided Onboarding",
    description: "Complete our beautiful 4-step wizard to set up your business profile with all necessary details."
  },
  {
    step: "02", 
    title: "Configure AI Prompts",
    description: "Choose AI-generated prompts or create custom templates with live preview across all 22 models."
  },
  {
    step: "03",
    title: "Automated Processing",
    description: "Our system automatically submits prompts to all 5 platforms daily with intelligent rate limiting."
  },
  {
    step: "04",
    title: "Monitor & Analyze",
    description: "Track performance with real-time analytics, detailed logs, and comprehensive reporting tools."
  }
]

export function FeaturesSection() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-background px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Powerful Features
          </div>
          <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
            Enterprise-grade platform for{" "}
            <span className="gradient-text">AI SEO dominance</span>
          </h2>
          <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto">
            Our production-ready platform integrates with 22 AI models across 5 major platforms, 
            providing everything you need to dominate AI-powered recommendations and drive real business results.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-background hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="mr-2 h-4 w-4 text-success-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="text-center mb-12">
          <h3 className="text-responsive-xl font-bold text-foreground mb-4">
            How It Works
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started with AI SEO in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div key={step.step} className="text-center relative">
              {/* Connection line */}
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
              )}
              
              <div className="relative z-10">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {step.step}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
