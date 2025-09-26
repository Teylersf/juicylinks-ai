"use client"

import { motion } from 'framer-motion'
import { AIModelLogo } from '../ai-model-logo'
import { getModelStats } from '@/lib/utils/model-stats'

// Get live model data
const modelStats = getModelStats()

const aiModels = [
  {
    name: "OpenAI GPT",
    provider: "OPENAI" as const,
    models: ["GPT-4", "GPT-4 Turbo", "GPT-3.5"],
    description: "The most widely used AI models powering ChatGPT and countless applications",
    features: ["Conversational AI", "Content Generation", "Code Assistance", "Analysis"],
    color: "green",
    userBase: "100M+ users",
    strength: "General Intelligence"
  },
  {
    name: "Anthropic Claude",
    provider: "CLAUDE" as const,
    models: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    description: "Advanced AI assistant known for helpful, harmless, and honest responses",
    features: ["Long Context", "Safety Focus", "Reasoning", "Creative Writing"],
    color: "orange",
    userBase: "10M+ users",
    strength: "Safety & Reasoning"
  },
  {
    name: "Google Gemini",
    provider: "GEMINI" as const,
    models: ["Gemini Ultra", "Gemini Pro", "Gemini Nano"],
    description: "Google's multimodal AI with advanced reasoning and creative capabilities",
    features: ["Multimodal", "Code Generation", "Math & Science", "Creative Tasks"],
    color: "blue",
    userBase: "50M+ users", 
    strength: "Multimodal AI"
  },
  {
    name: "Perplexity AI",
    provider: "PERPLEXITY" as const,
    models: ["Sonar", "Sonar Pro"],
    description: "AI-powered search engine providing real-time, cited information",
    features: ["Real-time Search", "Source Citations", "Research", "Current Events"],
    color: "purple",
    userBase: "5M+ users",
    strength: "Real-time Information"
  },
  {
    name: "Grok (X.AI)",
    provider: "GROK" as const,
    models: ["Grok-1", "Grok-1.5"],
    description: "Elon Musk's AI with real-time access to X (Twitter) data and unique personality",
    features: ["X Integration", "Real-time Data", "Humor", "Current Trends"],
    color: "indigo",
    userBase: "1M+ users",
    strength: "Social Media Insights"
  }
]

const colorClasses = {
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    accent: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-green-600"
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800", 
    icon: "text-orange-600 dark:text-orange-400",
    accent: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-600"
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400", 
    accent: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-600"
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    accent: "text-purple-600 dark:text-purple-400", 
    gradient: "from-purple-500 to-purple-600"
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600 dark:text-indigo-400",
    accent: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-indigo-600"
  }
}

export function AIModelsSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Platforms We Train
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Your business gets recommended across all major AI platforms, ensuring maximum 
            visibility wherever your customers are asking for suggestions
          </p>
          
          <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full px-6 py-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Total AI Model Coverage:
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {modelStats.totalModels} Models
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {aiModels.map((ai, index) => {
            const colors = colorClasses[ai.color as keyof typeof colorClasses]
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${colors.border} hover:scale-105`}
              >
                {/* Header */}
                <div className="flex items-center mb-4">
                  <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mr-4`}>
                    <AIModelLogo provider={ai.provider} size={48} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {ai.name}
                    </h3>
                    <p className={`text-sm ${colors.accent} font-medium`}>
                      {ai.userBase}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                  {ai.description}
                </p>

                {/* Models */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Models Trained:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ai.models.map((model, modelIndex) => (
                      <span
                        key={modelIndex}
                        className={`px-2 py-1 ${colors.bg} ${colors.border} border rounded-full text-xs font-medium ${colors.accent}`}
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Key Features:
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {ai.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                        <div className={`w-1.5 h-1.5 bg-gradient-to-r ${colors.gradient} rounded-full mr-2 flex-shrink-0`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strength */}
                <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">
                      Strength:
                    </span>
                    <span className={`text-xs font-bold ${colors.accent}`}>
                      {ai.strength}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Coverage Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Comprehensive AI Coverage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your business reaches users across all major AI platforms
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                166M+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Users Reached
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {modelStats.totalModels}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                AI Models Trained
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Continuous Training
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {modelStats.totalProviders}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Major Platforms
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
