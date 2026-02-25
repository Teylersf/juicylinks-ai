"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Globe, Users, Lightbulb, Target, Mic, Save, ArrowLeft, CheckCircle, Sparkles, Loader2 } from 'lucide-react'

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
})

type BusinessFormData = z.infer<typeof businessSchema>

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing',
  'Real Estate', 'Marketing & Advertising', 'Consulting', 'Legal Services',
  'Food & Beverage', 'Travel & Tourism', 'Entertainment', 'Non-profit', 'Other'
]

import { getSimpleProviderConfigs } from '@/lib/utils/provider-config'

// Get live provider data with accurate model counts
const llmProviders = getSimpleProviderConfigs()

export function AddBusinessForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // URL scraping state
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
  })

  // Watch website field to sync with scrapeUrl
  // Watch form values for potential future use
  // const formValues = watch()

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      setScrapeError('Please enter a website URL')
      return
    }

    setIsScraping(true)
    setScrapeError(null)

    try {
      const response = await fetch('/api/scrape-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze website')
      }

      const data = result.data

      // Autofill form fields
      if (data.name) setValue('name', data.name)
      if (data.description) setValue('description', data.description)
      if (data.website) setValue('website', data.website)
      if (data.industry && industries.includes(data.industry)) {
        setValue('industry', data.industry)
      } else if (data.industry) {
        setValue('industry', 'Other')
      }
      if (data.targetAudience) setValue('targetAudience', data.targetAudience)
      if (data.keyServices && data.keyServices.length > 0) {
        setValue('keyServices', data.keyServices.join(', '))
      }
      if (data.uniqueSellingPoints && data.uniqueSellingPoints.length > 0) {
        setValue('uniqueSellingPoints', data.uniqueSellingPoints.join(', '))
      }
      if (data.brandVoice) setValue('brandVoice', data.brandVoice)
      if (data.competitorKeywords && data.competitorKeywords.length > 0) {
        setValue('competitorKeywords', data.competitorKeywords.join(', '))
      }

    } catch (error) {
      setScrapeError(error instanceof Error ? error.message : 'Failed to analyze website')
    } finally {
      setIsScraping(false)
    }
  }

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Automatically include all LLM providers
      const allProviders = llmProviders.map(provider => provider.id)
      
      // Process the form data
      const formData = {
        ...data,
        targetLLMs: allProviders,
        keyServices: data.keyServices.split(',').map(s => s.trim()).filter(Boolean),
        uniqueSellingPoints: data.uniqueSellingPoints.split(',').map(s => s.trim()).filter(Boolean),
        competitorKeywords: data.competitorKeywords ? 
          data.competitorKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
        customPrompts: [],
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

      // Redirect to dashboard on success
      router.push('/dashboard?success=business-added')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* URL Autofill Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span>Auto-fill from Website</span>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
            Enter your business website URL and we&apos;ll use AI to automatically fill in your business details.
          </p>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleScrape}
              disabled={isScraping}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto-fill
                </>
              )}
            </button>
          </div>
          
          {scrapeError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{scrapeError}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6" />

      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Building2 className="h-5 w-5" />
          <span>Basic Information</span>
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
            Website URL
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
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe what your business does, your main products/services, and what makes you unique..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Target Audience & Services */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Users className="h-5 w-5" />
          <span>Target Audience & Services</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Audience *
          </label>
          <textarea
            {...register('targetAudience')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe your ideal customers, their demographics, needs, and pain points..."
          />
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
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="List your main services or products (separate with commas)..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Separate multiple services with commas
          </p>
          {errors.keyServices && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.keyServices.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unique Selling Points *
          </label>
          <textarea
            {...register('uniqueSellingPoints')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="What makes your business unique? List your competitive advantages (separate with commas)..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Separate multiple points with commas
          </p>
          {errors.uniqueSellingPoints && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.uniqueSellingPoints.message}</p>
          )}
        </div>
      </div>

      {/* SEO & Branding */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Target className="h-5 w-5" />
          <span>SEO & Branding</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Competitor Keywords
          </label>
          <input
            {...register('competitorKeywords')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="competitor1, competitor2, industry leader..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional: List competitor names or industry keywords (separate with commas)
          </p>
          {errors.competitorKeywords && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.competitorKeywords.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brand Voice
          </label>
          <div className="relative">
            <Mic className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              {...register('brandVoice')}
              rows={2}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Describe your brand's tone and personality (e.g., professional, friendly, innovative)..."
            />
          </div>
          {errors.brandVoice && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brandVoice.message}</p>
          )}
        </div>
      </div>

      {/* AI Platform Coverage */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Lightbulb className="h-5 w-5" />
          <span>AI Platform Coverage</span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                All AI Platforms Included
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your business will automatically target all {llmProviders.length} AI platforms for maximum coverage and recommendations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {llmProviders.map((provider) => (
            <div
              key={provider.id}
              className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20"
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {provider.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {provider.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note about custom prompts */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Custom Prompts Available
          </h3>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          After creating your business, you can configure custom prompts and advanced AI settings 
          in the dedicated Prompt Configuration section.
        </p>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Business'}
        </button>
      </div>
    </form>
  )
}
