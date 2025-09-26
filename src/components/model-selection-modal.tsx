"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, CreditCard, Zap, AlertCircle, CheckCircle, Settings, Bot, Loader2, Eye } from 'lucide-react'
import { AIModelLogo } from './ai-model-logo'
import { LLM_MODELS, LLMModel } from '../lib/constants/llm-models'
import { getModelCreditCost, formatCredits, calculateTotalCredits } from '../lib/constants/credit-system'

interface ModelSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (selectedModels: { provider: string; models: string[] }[]) => Promise<void>
  userCredits: number
  businessName: string
  businessId: string
}

interface ModelSelection {
  [provider: string]: {
    [modelName: string]: boolean
  }
}

export function ModelSelectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userCredits, 
  businessName,
  businessId
}: ModelSelectionModalProps) {
  const router = useRouter()
  const [selectedModels, setSelectedModels] = useState<ModelSelection>({})
  const [totalCost, setTotalCost] = useState(0)
  const [promptType, setPromptType] = useState<'loading' | 'system' | 'custom' | 'error'>('loading')
  const [customPromptCount, setCustomPromptCount] = useState(0)

  // Fetch business prompt configuration
  useEffect(() => {
    if (isOpen && businessId) {
      const fetchBusinessConfig = async () => {
        try {
          setPromptType('loading')
          const response = await fetch(`/api/businesses/${businessId}`)
          
          if (response.ok) {
            const data = await response.json()
            const business = data.business
            
            // Check if business has custom prompts configured
            const hasCustomPrompts = business.customPrompts && 
              business.customPrompts.length > 0 && 
              business.customPrompts.some((prompt: string) => prompt.trim().length > 0)
            
            if (hasCustomPrompts && !business.useAIGeneratedPrompts) {
              setPromptType('custom')
              setCustomPromptCount(business.customPrompts.filter((p: string) => p.trim().length > 0).length)
            } else {
              setPromptType('system')
            }
          } else {
            setPromptType('error')
          }
        } catch (error) {
          console.error('Failed to fetch business config:', error)
          setPromptType('error')
        }
      }
      
      fetchBusinessConfig()
    }
  }, [isOpen, businessId])

  // Initialize with all recommended models selected
  useEffect(() => {
    if (isOpen) {
      const initialSelection: ModelSelection = {}
      
      Object.entries(LLM_MODELS).forEach(([provider, models]) => {
        initialSelection[provider] = {}
        models.forEach((model: LLMModel) => {
          // Select recommended models by default
          initialSelection[provider][model.name] = model.recommended
        })
      })
      
      setSelectedModels(initialSelection)
    }
  }, [isOpen])

  // Calculate total cost whenever selection changes
  useEffect(() => {
    const selections = Object.entries(selectedModels).map(([provider, models]) => ({
      provider,
      models: Object.entries(models).filter(([, selected]) => selected).map(([modelName]) => modelName)
    })).filter(selection => selection.models.length > 0)

    const cost = calculateTotalCredits(selections)
    setTotalCost(cost)
  }, [selectedModels])

  const toggleModel = (provider: string, modelName: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [modelName]: !prev[provider]?.[modelName]
      }
    }))
  }

  const toggleProvider = (provider: string, selectAll: boolean) => {
    setSelectedModels(prev => {
      const providerModels = LLM_MODELS[provider as keyof typeof LLM_MODELS]
      const newProviderSelection: { [key: string]: boolean } = {}
      
      providerModels.forEach(model => {
        newProviderSelection[model.name] = selectAll
      })

      return {
        ...prev,
        [provider]: newProviderSelection
      }
    })
  }

  const handleSubmit = () => {
    const selections = Object.entries(selectedModels).map(([provider, models]) => ({
      provider,
      models: Object.entries(models).filter(([, selected]) => selected).map(([modelName]) => modelName)
    })).filter(selection => selection.models.length > 0)

    if (selections.length === 0) {
      alert('Please select at least one model')
      return
    }

    if (totalCost > userCredits) {
      alert('Insufficient credits. Please purchase more credits or select fewer models.')
      return
    }

    onSubmit(selections)
  }

  const canAfford = totalCost <= userCredits
  const selectedCount = Object.values(selectedModels).reduce((total, providerModels) => {
    return total + Object.values(providerModels).filter(Boolean).length
  }, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Select AI Models
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
              Choose which models to submit prompts for <strong>{businessName}</strong>
            </p>
            
            {/* Prompt Type Indicator */}
            <div className="mt-3 flex items-center space-x-2">
              {promptType === 'loading' && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Checking prompt configuration...</span>
                </div>
              )}
              
              {promptType === 'system' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <Bot className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      Using System Prompts
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      (20 universal templates)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // Navigate to prompt configuration page with wiggle parameter using Next.js router
                      router.push(`/dashboard/businesses/${businessId}/prompts?wiggle=preview`)
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview Prompts</span>
                  </button>
                </div>
              )}
              
              {promptType === 'custom' && (
                <div className="flex items-center space-x-2 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
                  <Settings className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                    Using Custom Prompts
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    ({customPromptCount} configured)
                  </span>
                </div>
              )}
              
              {promptType === 'error' && (
                <div className="flex items-center space-x-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                  <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                    Error loading prompt config
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(LLM_MODELS).map(([provider, models]) => {
              const providerSelected = selectedModels[provider] || {}
              const selectedInProvider = Object.values(providerSelected).filter(Boolean).length
              const totalInProvider = models.length

              return (
                <div key={provider} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                  {/* Provider Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <AIModelLogo provider={provider as 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'} size={24} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {provider}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {selectedInProvider} of {totalInProvider} models selected
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleProvider(provider, true)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => toggleProvider(provider, false)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Models Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {models.map((model: LLMModel) => {
                      const isSelected = providerSelected[model.name] || false
                      const creditCost = getModelCreditCost(model.name)
                      const tier = creditCost <= 0.5 ? 'economy' : creditCost >= 2.0 ? 'premium' : 'standard'
                      
                      return (
                        <div
                          key={model.name}
                          className={`p-2 sm:p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleModel(provider, model.name)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                                />
                                <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                  {model.name}
                                </span>
                                {model.recommended && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-1 py-0.5 rounded">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                {model.description}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  tier === 'economy' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                    : tier === 'premium'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                }`}>
                                  {formatCredits(creditCost)} credits
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  tier === 'economy' 
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400'
                                    : tier === 'premium'
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/10 dark:text-purple-400'
                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400'
                                }`}>
                                  {tier}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Your Balance: <strong>{formatCredits(userCredits)} credits</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Selected: <strong>{selectedCount} models</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {canAfford ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-semibold">
                Total Cost: {formatCredits(totalCost)} credits
              </span>
              {!canAfford && (
                <span className="text-sm">
                  (Need {formatCredits(totalCost - userCredits)} more)
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canAfford || selectedCount === 0}
                className={`px-6 py-2 rounded-lg font-medium ${
                  canAfford && selectedCount > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Prompts ({formatCredits(totalCost)} credits)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
