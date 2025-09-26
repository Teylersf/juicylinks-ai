"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Bot } from "lucide-react"
import { AIModelLogo } from "./ai-model-logo"
import { getModelStats, getModelCountText, getProviderListText } from "@/lib/utils/model-stats"

// Get live model data
const modelStats = getModelStats()

const llmLogos = modelStats.modelsByProvider.map(({ provider, count }) => {
  const providerDisplayNames: Record<string, string> = {
    'GROK': 'Grok (X.AI)',
    'OPENAI': 'GPT-5',
    'CLAUDE': 'Claude 4',
    'GEMINI': 'Gemini 2.5',
    'PERPLEXITY': 'Perplexity'
  }
  
  return {
    name: providerDisplayNames[provider] || provider,
    provider: provider as "GROK" | "OPENAI" | "CLAUDE" | "GEMINI" | "PERPLEXITY",
    models: `${count} Model${count !== 1 ? 's' : ''}`
  }
})

const stats = [
  { label: "AI Models Integrated", value: modelStats.totalModels.toString() },
  { label: "LLM Platforms", value: modelStats.totalProviders.toString() },
  { label: "Daily Automation", value: "24/7" },
  { label: "Setup Time", value: "2 Min" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-white dark:from-blue-900/20 dark:via-green-900/20 dark:to-gray-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-blue-200/30 dark:bg-blue-800/30 blur-3xl animate-bounce-gentle" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-green-200/30 dark:bg-green-800/30 blur-3xl animate-bounce-gentle" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-padding">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 px-6 py-2 text-sm font-medium backdrop-blur-sm mb-8 animate-fade-in">
              <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
              AI Will Replace Traditional Search Engines
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>

            {/* Main heading */}
            <h1 className="text-responsive-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 animate-slide-up">
              <span className="gradient-text">AI SEO</span> - Rank Higher -{" "}
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl">Get Recommended by AI</span>
            </h1>

            {/* Subheading */}
            <p className="text-responsive-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              The future of search is AI, and it&apos;s happening now. Ensure your business gets recommended by tomorrow&apos;s dominant platforms—<strong>{getProviderListText()}</strong>. Our platform automatically feeds your business information to all {getModelCountText()} daily, so when customers ask AI for recommendations, you&apos;re the answer they get.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link
                href="/handler/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-8 py-3 text-base font-medium text-gray-900 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Bot className="mr-2 h-5 w-5" />
                See How It Works
              </Link>
            </div>

            {/* LLM Logos */}
            <div className="mb-12 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Integrated with every major AI platform and their latest models
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
                {llmLogos.map((llm) => (
                  <div
                    key={llm.name}
                    className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:scale-105"
                  >
                    <AIModelLogo provider={llm.provider} size={64} />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {llm.name}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {llm.models}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}