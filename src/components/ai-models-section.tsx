"use client"

import { Brain, Zap, Eye, Search, Sparkles } from "lucide-react"
import { AIModelLogo } from "./ai-model-logo"
import { getModelStats } from "@/lib/utils/model-stats"

// Get live model data
const modelStats = getModelStats()

const aiPlatforms = modelStats.modelsByProvider.map(({ provider, count, models }) => {
  const platformConfigs: Record<string, {
    name: string
    description: string
    features: string[]
    color: string
  }> = {
    'GROK': {
      name: "Grok (X.AI)",
      description: "X.AI's powerful language models with advanced reasoning capabilities",
      features: ["Advanced reasoning", "Code generation", "Vision capabilities", "Real-time processing"],
      color: "from-blue-500 to-cyan-500"
    },
    'OPENAI': {
      name: "OpenAI GPT-5",
      description: "The most advanced language models from OpenAI with cutting-edge capabilities",
      features: ["Agentic capabilities", "Advanced coding", "Superior reasoning", "Multi-domain expertise"],
      color: "from-green-500 to-emerald-500"
    },
    'CLAUDE': {
      name: "Anthropic Claude",
      description: "Constitutional AI with exceptional reasoning and safety features",
      features: ["Constitutional AI", "Extended thinking", "Vision support", "Ethical reasoning"],
      color: "from-purple-500 to-indigo-500"
    },
    'GEMINI': {
      name: "Google Gemini",
      description: "Google's multimodal AI with advanced understanding across text, images, and video",
      features: ["Multimodal support", "Thinking mode", "Audio/video processing", "Real-time streaming"],
      color: "from-orange-500 to-red-500"
    },
    'PERPLEXITY': {
      name: "Perplexity Sonar",
      description: "Real-time search-powered AI with access to current information",
      features: ["Real-time web search", "Current information", "Grounded responses", "Search optimization"],
      color: "from-teal-500 to-cyan-500"
    }
  }
  
  const config = platformConfigs[provider] || {
    name: provider,
    description: `Advanced AI models from ${provider}`,
    features: ["Advanced AI", "High performance", "Latest technology", "Reliable results"],
    color: "from-gray-500 to-gray-600"
  }
  
  return {
    provider: provider as "GROK" | "OPENAI" | "CLAUDE" | "GEMINI" | "PERPLEXITY",
    ...config,
    models: models.map((model: { name: string; description: string; recommended: boolean }) => ({
      name: model.name,
      description: model.description
    }))
  }
})

export function AIModelsSection() {
  return (
    <section id="ai-models" className="section-padding bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-6 py-2 text-sm font-medium mb-6">
            <Brain className="mr-2 h-4 w-4 text-blue-600" />
            {modelStats.totalModels} AI Models Integrated
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Every Major{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              AI Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8">
            We&apos;ve integrated with every major AI platform and their latest models to ensure 
            comprehensive coverage when customers ask for recommendations.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Daily Training</span>
            </div>
            <div className="flex items-center">
              <Eye className="mr-2 h-4 w-4 text-green-500" />
              <span>Real-time Monitoring</span>
            </div>
            <div className="flex items-center">
              <Search className="mr-2 h-4 w-4 text-blue-500" />
              <span>Intelligent Targeting</span>
            </div>
          </div>
        </div>

        {/* AI Platforms Grid */}
        <div className="space-y-12">
          {aiPlatforms.map((platform, index) => (
            <div
              key={platform.name}
              className={`relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:flex ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Platform Info */}
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <AIModelLogo provider={platform.provider} size={80} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {platform.name}
                      </h3>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${platform.color} mt-2`}>
                        {platform.models.length} Models Integrated
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    {platform.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Capabilities:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {platform.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Sparkles className="mr-2 h-3 w-3 text-blue-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Models List */}
                <div className="lg:w-1/2 p-8 lg:p-12 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-6 text-lg">
                    Integrated Models:
                  </h4>
                  <div className="space-y-4">
                    {platform.models.map((model: { name: string; description: string }) => (
                      <div
                        key={model.name}
                        className="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                      >
                        <div>
                          <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                            {model.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {model.description}
                          </div>
                        </div>
                        <div className="flex items-center text-green-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="ml-2 text-xs font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 mb-2">{modelStats.totalModels}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total AI Models</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600 mb-2">{modelStats.totalProviders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">AI Platforms</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Automated Training</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Coverage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
