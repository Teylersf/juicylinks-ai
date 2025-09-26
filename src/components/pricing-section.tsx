"use client"

import Link from "next/link"
import { Check, Zap, Crown, Building2, ArrowRight, X, CreditCard, Target, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@stackframe/stack"
import { useState, useEffect } from "react"
import { PLAN_INFO } from "@/lib/upgrade-utils"
import { CREDIT_PACKAGES } from "@/lib/constants/credit-system"
import { getModelStats } from "@/lib/utils/model-stats"

// Get dynamic model stats
const modelStats = getModelStats()

const plans = [
  {
    name: "Free Trial",
    description: "Perfect for testing our platform",
    price: 0,
    period: "2 weeks",
    icon: Zap,
    popular: false,
    features: [
      "1 business/website/app",
      "1 submission per week",
      `All ${modelStats.totalProviders} AI platforms`,
      "Basic analytics",
      "Email support",
    ],
    limitations: [
      "Limited to 2 weeks",
      "Basic reporting only",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up?plan=trial"
  },
  {
    name: "Starter",
    description: PLAN_INFO.STARTER.description,
    price: PLAN_INFO.STARTER.price,
    period: "month",
    icon: Building2,
    popular: true,
    features: PLAN_INFO.STARTER.features,
    addOns: [
      `Additional businesses: $${PLAN_INFO.STARTER.additionalBusinessPrice}/month each`
    ],
    cta: "Get Started",
    href: "/auth/sign-up?plan=starter"
  },
  {
    name: "Growth",
    description: PLAN_INFO.GROWTH.description,
    price: PLAN_INFO.GROWTH.price,
    period: "month",
    icon: Crown,
    popular: false,
    features: PLAN_INFO.GROWTH.features,
    addOns: [
      `Additional businesses: $${PLAN_INFO.GROWTH.additionalBusinessPrice}/month each`
    ],
    cta: "Scale Up",
    href: "/auth/sign-up?plan=growth"
  }
]

const faqs = [
  {
    question: "How quickly will I see results?",
    answer: "Most customers see initial improvements in AI recommendations within 2-4 weeks of consistent daily prompts. Full optimization typically takes 2-3 months."
  },
  {
    question: "Which AI platforms do you support?",
    answer: "We currently support ChatGPT, Claude (Anthropic), Google Gemini, and Meta AI. We&apos;re constantly adding new platforms as they become available."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your service will continue until the end of your current billing period."
  },
  {
    question: "Do you offer custom enterprise plans?",
    answer: "Yes, we offer custom enterprise solutions for large organizations with specific needs. Contact our sales team for a personalized quote."
  }
]

export function PricingSection() {
  const user = useUser()
  const [loading, setLoading] = useState<string | null>(null)
  const [showCancelMessage, setShowCancelMessage] = useState(false)

  // Check for canceled parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('canceled') === 'true') {
      setShowCancelMessage(true)
      // Remove the parameter from URL without refreshing
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  const handleCheckout = async (plan: 'STARTER' | 'GROWTH') => {
    if (!user) {
      // Redirect to sign up
      window.location.href = '/handler/sign-up'
      return
    }

    setLoading(plan)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancellation Message */}
        {showCancelMessage && (
          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Payment Cancelled
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    No worries! Your payment was cancelled and no charges were made. 
                    You can choose a plan below when you&apos;re ready.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCancelMessage(false)}
                className="text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your business. Start with our free trial 
            and upgrade as you grow.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg",
                plan.popular
                  ? "border-primary bg-primary/5 shadow-primary/10"
                  : "border-gray-200 dark:border-gray-800 bg-background"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <plan.icon className="h-6 w-6 text-primary mr-2" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {plan.name === "Free Trial" ? (
                <Link
                  href="/handler/sign-up"
                  className={cn(
                    "w-full inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors mb-6",
                    "bg-gray-600 text-white hover:bg-gray-700"
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.name.toUpperCase() as 'STARTER' | 'GROWTH')}
                  disabled={loading === plan.name.toUpperCase()}
                  className={cn(
                    "w-full inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors mb-6",
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      : "bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
                  )}
                >
                  {loading === plan.name.toUpperCase() ? 'Processing...' : plan.cta}
                  {loading !== plan.name.toUpperCase() && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              )}

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-success-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.addOns && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">Add-ons:</p>
                  <ul className="space-y-1">
                    {plan.addOns.map((addOn) => (
                      <li key={addOn} className="text-sm text-muted-foreground">
                        • {addOn}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.limitations && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <ul className="space-y-1">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="text-xs text-muted-foreground">
                        * {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Credits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h2 className="text-responsive-2xl font-bold text-foreground mb-4">
              Flexible <span className="gradient-text">Credit System</span>
            </h2>
            <p className="text-responsive-base text-muted-foreground max-w-3xl mx-auto mb-8">
              Need more control over your <strong>LLMBO (Large Language Model Business Optimization)</strong> campaigns? 
              Our credit system lets you target specific AI platforms, boost visibility during peak seasons, 
              and scale your <strong>AI SEO</strong> efforts on-demand.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-600" />
                <span>Strategic Targeting</span>
              </div>
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                <span>Seasonal Boosts</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-green-600" />
                <span>Instant Activation</span>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-lg",
                  pkg.popular
                    ? "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10 ring-2 ring-purple-200 dark:ring-purple-800"
                    : "border-gray-200 dark:border-gray-800 bg-background hover:border-purple-200 dark:hover:border-purple-800"
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-foreground">
                        ${(pkg.price / 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {pkg.credits.toLocaleString()} Credits
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {pkg.details}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    className={cn(
                      "w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      pkg.popular
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    Purchase Credits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Credit System Benefits */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-800/50 rounded-full">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Strategic Targeting</h4>
                <p className="text-sm text-muted-foreground">
                  Choose specific AI platforms and models for maximum impact. Perfect for testing new markets or focusing on high-converting platforms.
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Seasonal Campaigns</h4>
                <p className="text-sm text-muted-foreground">
                  Boost your LLMBO visibility during peak seasons, holidays, or special events. Scale up when demand is highest.
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-full">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Instant Results</h4>
                <p className="text-sm text-muted-foreground">
                  Credits activate immediately. Launch campaigns, test strategies, and see results without monthly commitments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mb-16">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-muted/30 p-8">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Need something custom?
            </h3>
            <p className="text-muted-foreground mb-6">
              We offer enterprise solutions with custom pricing, dedicated support, 
              and advanced features for large organizations.
            </p>
            <Link
              href="/contact?type=enterprise"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contact Sales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center mb-12">
          <h3 className="text-responsive-xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">
                {faq.question}
              </h4>
              <p className="text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
