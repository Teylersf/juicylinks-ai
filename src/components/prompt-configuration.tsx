"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Lightbulb,
  Mic, 
  Save, 
  ArrowLeft, 
  Eye, 
  Wand2, 
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { Business, PromptLog } from '@prisma/client'
import { UNIVERSAL_PROMPT_TEMPLATES, populateTemplate, BusinessData } from '../lib/prompt-templates/universal-templates'
import { getProviderConfigs } from '@/lib/utils/provider-config'

const promptConfigSchema = z.object({
  customPrompts: z.array(z.string()).optional(),
  useAIGeneratedPrompts: z.boolean(),
  promptFrequency: z.enum(['daily', 'weekly']),
  isActive: z.boolean(),
})

type PromptConfigData = z.infer<typeof promptConfigSchema>


interface PromptConfigurationProps {
  business: Business & {
    promptLogs: PromptLog[]
  }
}

export function PromptConfiguration({ business }: PromptConfigurationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [previewPrompts, setPreviewPrompts] = useState<string[]>([])
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [shouldWiggle, setShouldWiggle] = useState(false)
  
  // Get live provider data with accurate model counts
  const llmProviders = getProviderConfigs()
  
  // Check for wiggle parameter and trigger animation
  useEffect(() => {
    const wiggleParam = searchParams.get('wiggle')
    if (wiggleParam === 'preview') {
      setShouldWiggle(true)
      // Remove the parameter from URL after triggering animation
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      // Stop wiggling after animation duration
      setTimeout(() => setShouldWiggle(false), 2000)
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<PromptConfigData>({
    resolver: zodResolver(promptConfigSchema),
    defaultValues: {
      customPrompts: business.customPrompts,
      useAIGeneratedPrompts: business.useAIGeneratedPrompts,
      promptFrequency: 'daily', // Default frequency
      isActive: business.isActive,
    }
  })

  const watchedUseAI = watch('useAIGeneratedPrompts')
  const watchedCustomPrompts = watch('customPrompts')
  const watchedIsActive = watch('isActive')

  const onSubmit = async (data: PromptConfigData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Automatically include all LLM providers for subscription users
      const allProviders = llmProviders.map(provider => provider.id)
      const dataWithAllProviders = {
        ...data,
        targetLLMs: allProviders
      }

      const response = await fetch(`/api/businesses/${business.id}/prompts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataWithAllProviders),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update prompt configuration')
      }

      // Redirect back to business edit page
      router.push(`/dashboard/businesses/${business.id}/edit?success=prompts-updated`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }


  const generatePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      // Create business data object for template population
      const businessData: BusinessData = {
        name: business.name,
        description: business.description || undefined,
        website: business.website || undefined,
        industry: business.industry || undefined,
        targetAudience: business.targetAudience || undefined,
        keyServices: business.keyServices || ['their services'],
        uniqueSellingPoints: business.uniqueSellingPoints || ['their unique approach and commitment to excellence'],
        brandVoice: business.brandVoice || undefined
      }

      // Generate all 20 templates with business data populated
      const populatedTemplates = UNIVERSAL_PROMPT_TEMPLATES.map((template) => 
        populateTemplate(template, businessData)
      )

      setPreviewPrompts(populatedTemplates)
      setShowPreview(true)
    } catch (error) {
      console.error('Preview generation failed:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const addCustomPrompt = () => {
    const current = watchedCustomPrompts || []
    setValue('customPrompts', [...current, ''])
  }

  const removeCustomPrompt = (index: number) => {
    const current = watchedCustomPrompts || []
    setValue('customPrompts', current.filter((_, i) => i !== index))
  }

  const updateCustomPrompt = (index: number, value: string) => {
    const current = watchedCustomPrompts || []
    const updated = [...current]
    updated[index] = value
    setValue('customPrompts', updated)
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Current Status
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto ${
            business.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
          }`}>
            {business.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {business.totalPromptsSent}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Total Prompts Sent
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {business.targetLLMs.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Active Platforms
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {business.lastPromptSentAt ? 
                business.lastPromptSentAt.toLocaleDateString() : 
                'Never'
              }
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Last Prompt Sent
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {business.promptLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {business.promptLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    llmProviders.find(p => p.id === log.llmProvider)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {log.llmProvider}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {log.promptType}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {log.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <span className={`flex items-center px-2 py-1 rounded-full text-xs ${
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

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
        {/* Business Status Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Campaign Status
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                {watchedIsActive ? 'This business is included in prompt processing' : 'This business is excluded from prompt processing'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>


        {/* Prompt Strategy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center space-x-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Prompt Strategy</span>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* AI Generated vs Custom */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('useAIGeneratedPrompts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Use AI-Generated Prompts
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Let our AI create optimized prompts based on your business information
                  </p>
                </div>
              </label>
            </div>

            {/* Custom Prompts Section */}
            {!watchedUseAI && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Custom Prompt Templates
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomPrompt}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    + Add Prompt
                  </button>
                </div>

                {/* Instructions and Examples */}
                <div className="mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
                      <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 sm:mb-3">
                        📝 How to Create Effective Custom Prompts
                      </h4>
                      
                      <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                        <div>
                          <p className="font-medium mb-2">🏷️ Available Database Fields:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{businessName}'}</code> - Business name</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{businessDescription}'}</code> - Description</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{website}'}</code> - Website URL</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{industry}'}</code> - Industry type</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{targetAudience}'}</code> - Target audience</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{keyServices}'}</code> - Key services (list)</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{uniqueSellingPoints}'}</code> - USPs (list)</div>
                            <div className="break-all"><code className="bg-blue-100 dark:bg-blue-800 px-1 sm:px-2 py-1 rounded text-xs">{'{brandVoice}'}</code> - Brand voice/tone</div>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2">✨ Example Custom Prompts:</p>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                              <p className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">🎯 Marketing Focus:</p>
                              <code className="text-xs text-gray-700 dark:text-gray-300 break-words block overflow-hidden">
                                &quot;Write a compelling marketing description for {'{businessName}'}, a {'{industry}'} company that specializes in {'{keyServices}'}. 
                                Highlight their unique advantages: {'{uniqueSellingPoints}'}. Target this towards {'{targetAudience}'} using a {'{brandVoice}'} tone. 
                                Include their website {'{website}'} naturally in the content.&quot;
                              </code>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                              <p className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">🏆 Authority Building:</p>
                              <code className="text-xs text-gray-700 dark:text-gray-300 break-words block overflow-hidden">
                                &quot;Position {'{businessName}'} as the leading expert in {'{industry}'}. Explain why {'{targetAudience}'} should choose them over competitors. 
                                Focus on their expertise in {'{keyServices}'} and emphasize what makes them unique: {'{uniqueSellingPoints}'}. 
                                Write in a {'{brandVoice}'} style that builds trust and authority.&quot;
                              </code>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border">
                              <p className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">🔍 SEO Optimized:</p>
                              <code className="text-xs text-gray-700 dark:text-gray-300 break-words block overflow-hidden">
                                &quot;Create SEO-friendly content about {'{businessName}'} that naturally incorporates {'{industry}'} keywords. 
                                Describe their {'{keyServices}'} in detail and explain how they serve {'{targetAudience}'}. 
                                Mention their competitive advantages: {'{uniqueSellingPoints}'}. Include a call-to-action directing to {'{website}'}.&quot;
                              </code>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2">💡 Pro Tips:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs break-words">
                            <li>Use multiple database fields for richer, more detailed prompts</li>
                            <li className="break-words">Array fields like <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">{'{keyServices}'}</code> and <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">{'{uniqueSellingPoints}'}</code> are automatically formatted with commas and &quot;and&quot;</li>
                            <li>Create different prompt styles (marketing, technical, casual) for variety</li>
                            <li>Test prompts with your actual business data before going live</li>
                            <li>Each prompt should be unique to avoid repetitive AI responses</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(watchedCustomPrompts || []).map((prompt, index) => (
                    <div key={index} className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => updateCustomPrompt(index, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your custom prompt template. Use placeholders like {businessName}, {businessDescription}, {website}, {industry}, {targetAudience}, {keyServices}, {uniqueSellingPoints}, {brandVoice}..."
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomPrompt(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {(!watchedCustomPrompts || watchedCustomPrompts.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        No custom prompts yet. Click &quot;Add Prompt&quot; to create one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Prompt Preview
                </h3>
                <button
                  type="button"
                  onClick={generatePreview}
                  disabled={isGeneratingPreview}
                  className={`flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    shouldWiggle ? 'animate-wiggle' : ''
                  }`}
                >
                  {isGeneratingPreview ? (
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {isGeneratingPreview ? 'Generating...' : 'Preview Prompts'}
                </button>
              </div>

              {showPreview && previewPrompts.length > 0 && (
                <div className="space-y-4">
                  {/* Explanation Header */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
                        <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          🎯 Universal Prompt Templates ({previewPrompts.length} Total)
                        </h4>
                        <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-2">
                          <p>
                            <strong>How it works:</strong> Our AI system randomly selects from these {previewPrompts.length} professionally crafted templates for each submission, ensuring variety and preventing repetitive content.
                          </p>
                          <p>
                            <strong>Your Business Data:</strong> Each template is automatically populated with your specific business information (name, description, services, etc.) to create personalized promotional content.
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>More templates coming soon!</strong> We&apos;re continuously expanding our template library for even greater variety.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Template Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
                    {previewPrompts.map((prompt, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                            Template #{index + 1}
                          </span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Populated</span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                          {prompt}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{submitError}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/logs?business=${business.id}`)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Zap className="h-4 w-4 mr-2" />
              View Logs
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
