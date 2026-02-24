"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Building2, 
  Globe, 
  Users, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react'
import { AIModelLogo } from './ai-model-logo'

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required'),
  targetAudience: z.string().min(5, 'Target audience description required').max(300, 'Description too long'),
  keyServices: z.string().min(5, 'Key services description required').max(500, 'Description too long'),
  uniqueSellingPoints: z.string().min(5, 'Unique selling points required').max(500, 'Description too long'),
  competitorKeywords: z.string().max(300, 'Keywords too long').optional(),
  brandVoice: z.string().max(200, 'Brand voice description too long').optional(),
  targetLLMs: z.array(z.string()).min(1, 'Select at least one LLM provider'),
})

type BusinessFormData = z.infer<typeof businessSchema>

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Marketing & Advertising', 'Consulting', 'Legal Services',
  'Food & Beverage', 'Travel & Tourism', 'Entertainment', 'Non-profit', 'Other'
]

import { getOnboardingProviderConfigs } from '@/lib/utils/provider-config'

// Get live provider data with accurate model counts
const llmProviders = getOnboardingProviderConfigs()

const steps = [
  { id: 1, name: 'Business Info', description: 'Tell us about your business' },
  { id: 2, name: 'Target Audience', description: 'Who are your customers?' },
  { id: 3, name: 'AI Platforms', description: 'Choose your LLM targets' },
  { id: 4, name: 'Review & Launch', description: 'Confirm and get started' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      targetLLMs: ['GROK', 'OPENAI', 'GEMINI'], // Default recommended selection
    }
  })

  const watchedValues = watch()
  const watchedLLMs = watch('targetLLMs')

  const nextStep = async () => {
    let fieldsToValidate: (keyof BusinessFormData)[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'description', 'website', 'industry']
        break
      case 2:
        fieldsToValidate = ['targetAudience', 'keyServices', 'uniqueSellingPoints']
        break
      case 3:
        fieldsToValidate = ['targetLLMs']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Process the form data
      const formData = {
        ...data,
        keyServices: data.keyServices.split(',').map(s => s.trim()).filter(Boolean),
        uniqueSellingPoints: data.uniqueSellingPoints.split(',').map(s => s.trim()).filter(Boolean),
        competitorKeywords: data.competitorKeywords ? 
          data.competitorKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
        customPrompts: [], // Use AI-generated prompts for onboarding
      }

      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create business')
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?success=onboarding-complete&first-business=true')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLLMToggle = (llmId: string) => {
    const currentLLMs = watchedLLMs || []
    const newLLMs = currentLLMs.includes(llmId)
      ? currentLLMs.filter(id => id !== llmId)
      : [...currentLLMs, llmId]
    setValue('targetLLMs', newLLMs)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tell us about your business
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                We&apos;ll use this information to create targeted AI prompts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your business name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry *
                </label>
                <select
                  {...register('industry')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select an industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.industry.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL (Optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('website')}
                  type="url"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe what your business does, your main products/services, and what makes you unique..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will help us create better AI prompts for your business
                </p>
                <p className={`text-xs ${(watchedValues.description?.length || 0) > 500 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {watchedValues.description?.length || 0}/500
                  {(watchedValues.description?.length || 0) > 500 && ` (${(watchedValues.description?.length || 0) - 500} over)`}
                </p>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Who are your customers?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Help us understand your target audience and services
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience *
              </label>
              <textarea
                {...register('targetAudience')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe your ideal customers, their demographics, needs, and pain points..."
              />
              <p className={`mt-1 text-xs text-right ${(watchedValues.targetAudience?.length || 0) > 300 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                {watchedValues.targetAudience?.length || 0}/300
                {(watchedValues.targetAudience?.length || 0) > 300 && ` (${(watchedValues.targetAudience?.length || 0) - 300} over)`}
              </p>
              {errors.targetAudience && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.targetAudience.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Services *
              </label>
              <textarea
                {...register('keyServices')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="List your main services or products (separate with commas)..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Separate multiple services with commas
                </p>
                <p className={`text-xs ${(watchedValues.keyServices?.length || 0) > 500 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {watchedValues.keyServices?.length || 0}/500
                  {(watchedValues.keyServices?.length || 0) > 500 && ` (${(watchedValues.keyServices?.length || 0) - 500} over)`}
                </p>
              </div>
              {errors.keyServices && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.keyServices.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What makes you unique? *
              </label>
              <textarea
                {...register('uniqueSellingPoints')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="List your competitive advantages and unique selling points (separate with commas)..."
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Separate multiple points with commas
                </p>
                <p className={`text-xs ${(watchedValues.uniqueSellingPoints?.length || 0) > 500 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {watchedValues.uniqueSellingPoints?.length || 0}/500
                  {(watchedValues.uniqueSellingPoints?.length || 0) > 500 && ` (${(watchedValues.uniqueSellingPoints?.length || 0) - 500} over)`}
                </p>
              </div>
              {errors.uniqueSellingPoints && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.uniqueSellingPoints.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Competitor Keywords (Optional)
                </label>
                <input
                  {...register('competitorKeywords')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="competitor1, competitor2..."
                />
                <p className={`mt-1 text-xs text-right ${(watchedValues.competitorKeywords?.length || 0) > 300 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {watchedValues.competitorKeywords?.length || 0}/300
                  {(watchedValues.competitorKeywords?.length || 0) > 300 && ` (${(watchedValues.competitorKeywords?.length || 0) - 300} over)`}
                </p>
                {errors.competitorKeywords && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.competitorKeywords.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand Voice (Optional)
                </label>
                <input
                  {...register('brandVoice')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="professional, friendly, innovative..."
                />
                <p className={`mt-1 text-xs text-right ${(watchedValues.brandVoice?.length || 0) > 200 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                  {watchedValues.brandVoice?.length || 0}/200
                  {(watchedValues.brandVoice?.length || 0) > 200 && ` (${(watchedValues.brandVoice?.length || 0) - 200} over)`}
                </p>
                {errors.brandVoice && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brandVoice.message}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose your AI platforms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Select which AI platforms you want to target for recommendations
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Recommended Selection
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    We&apos;ve pre-selected the top 3 platforms for maximum coverage. You can adjust this selection.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {llmProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                    watchedLLMs?.includes(provider.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => handleLLMToggle(provider.id)}
                >
                  {provider.recommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={watchedLLMs?.includes(provider.id) || false}
                      onChange={() => handleLLMToggle(provider.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <AIModelLogo provider={provider.provider} size={48} />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {provider.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {errors.targetLLMs && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.targetLLMs.message}</p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Review & Launch
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Everything looks good! Let&apos;s get your AI SEO campaign started.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Business Information</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p><strong>Name:</strong> {watchedValues.name}</p>
                  <p><strong>Industry:</strong> {watchedValues.industry}</p>
                  {watchedValues.website && <p><strong>Website:</strong> {watchedValues.website}</p>}
                  <p><strong>Description:</strong> {watchedValues.description}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Target Audience</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {watchedValues.targetAudience}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Selected AI Platforms</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {watchedLLMs?.map(llmId => {
                    const provider = llmProviders.find(p => p.id === llmId)
                    return provider ? (
                      <span key={llmId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        <span className="mr-1">
                          <AIModelLogo provider={provider.provider} size={24} />
                        </span>
                        {provider.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <li>• Your business will be added to our AI prompt queue</li>
                    <li>• We&apos;ll start sending targeted prompts to your selected AI platforms</li>
                    <li>• You can track all activity in your dashboard</li>
                    <li>• Prompts are sent daily (or weekly for trial users)</li>
                  </ul>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{submitError}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep > step.id
                  ? 'bg-green-600 text-white'
                  : currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                  currentStep > step.id
                    ? 'bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Launch My Campaign!'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
