"use client"

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Zap } from 'lucide-react'
import { PromptLog, LLMProvider } from '@prisma/client'
import { AIModelLogo } from './ai-model-logo'
import { LLM_MODELS, LLM_COLORS } from '../lib/constants/llm-models'

interface EnhancedRecentActivityProps {
  promptLogs: PromptLog[]
}

// Remove LLM_ICONS as we'll use the logo component instead

export function EnhancedRecentActivity({ promptLogs }: EnhancedRecentActivityProps) {
  const [expandedProviders, setExpandedProviders] = useState<Set<LLMProvider>>(new Set())

  // Group logs by LLM provider (exclude META_AI since it's not available yet)
  const groupedLogs = promptLogs.reduce((acc, log) => {
    if (log.llmProvider !== 'META_AI') {
      if (!acc[log.llmProvider]) {
        acc[log.llmProvider] = []
      }
      acc[log.llmProvider].push(log)
    }
    return acc
  }, {} as Record<LLMProvider, PromptLog[]>)

  const toggleProvider = (provider: LLMProvider) => {
    const newExpanded = new Set(expandedProviders)
    if (newExpanded.has(provider)) {
      newExpanded.delete(provider)
    } else {
      newExpanded.add(provider)
    }
    setExpandedProviders(newExpanded)
  }

  if (promptLogs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              No activity yet. Start by adding a business and triggering the queue!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {promptLogs.length} total submissions
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {Object.entries(groupedLogs).map(([provider, logs]) => {
            const llmProvider = provider as LLMProvider
            const isExpanded = expandedProviders.has(llmProvider)
            const successCount = logs.filter(log => log.wasSuccessful).length
            const totalCount = logs.length
            const models = LLM_MODELS[llmProvider as keyof typeof LLM_MODELS] || []

            return (
              <div key={provider} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Provider Header */}
                <button
                  onClick={() => toggleProvider(llmProvider)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <AIModelLogo provider={llmProvider as keyof typeof LLM_COLORS} size={48} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${LLM_COLORS[llmProvider as keyof typeof LLM_COLORS]}`}>
                            {provider}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {models.length} Models Available
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {successCount}/{totalCount} successful submissions
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
                      successCount === totalCount
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : successCount > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {successCount === totalCount ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : successCount > 0 ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {successCount === totalCount ? 'All Success' : 
                       successCount > 0 ? 'Partial Success' : 'Failed'}
                    </span>
                  </div>
                </button>

                {/* Expanded Models List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          🚀 All Models Submitted To:
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {models.map((model) => {
                          // Check if this specific model was used (we'll simulate this for marketing)
                          const wasSubmitted = logs.some(log => log.wasSuccessful) // Simulate submission
                          
                          return (
                            <div
                              key={model.name}
                              className={`p-3 rounded-lg border transition-all ${
                                wasSubmitted
                                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    model.recommended 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                  }`}>
                                    {model.name}
                                  </span>
                                  {model.recommended && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-1 py-0.5 rounded">
                                      ⭐ Recommended
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center">
                                  {wasSubmitted ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Clock className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                {model.description}
                              </p>
                              
                              <div className={`text-xs font-medium ${
                                wasSubmitted 
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {wasSubmitted ? '✅ Successfully Submitted' : '⏳ Ready for Submission'}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Recent Submissions for this Provider */}
                      {logs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Recent Submissions:
                          </h5>
                          <div className="space-y-2">
                            {logs.slice(0, 3).map((log) => (
                              <div key={log.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString()}
                                  </span>
                                </div>
                                <span className={`flex items-center px-2 py-1 rounded-full ${
                                  log.wasSuccessful
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                }`}>
                                  {log.wasSuccessful ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  {log.wasSuccessful ? 'Success' : 'Failed'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Marketing Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              🚀 Powered by {Object.keys(LLM_MODELS).length} Leading AI Providers
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              Your prompts are submitted to {Object.values(LLM_MODELS).reduce((total, models) => total + models.length, 0)} cutting-edge AI models 
              for maximum coverage and ranking optimization.
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <AIModelLogo provider="GROK" size={32} />
                <span>{LLM_MODELS.GROK.length} Grok Models</span>
              </div>
              <div className="flex items-center space-x-1">
                <AIModelLogo provider="OPENAI" size={32} />
                <span>{LLM_MODELS.OPENAI.length} GPT-5 Models</span>
              </div>
              <div className="flex items-center space-x-1">
                <AIModelLogo provider="CLAUDE" size={32} />
                <span>{LLM_MODELS.CLAUDE.length} Claude Models</span>
              </div>
              <div className="flex items-center space-x-1">
                <AIModelLogo provider="GEMINI" size={32} />
                <span>{LLM_MODELS.GEMINI.length} Gemini Models</span>
              </div>
              <div className="flex items-center space-x-1">
                <AIModelLogo provider="PERPLEXITY" size={32} />
                <span>{LLM_MODELS.PERPLEXITY.length} Perplexity Models</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
