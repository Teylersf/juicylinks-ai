"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Globe, Users, Lightbulb, Target, Mic, Save, ArrowLeft, Trash2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react'
import { Business } from '@prisma/client'

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
  isActive: z.boolean(),
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

interface EditBusinessFormProps {
  business: Business
}

export function EditBusinessForm({ business }: EditBusinessFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name,
      description: business.description || '',
      website: business.website || '',
      industry: business.industry || '',
      targetAudience: business.targetAudience || '',
      keyServices: business.keyServices.join(', '),
      uniqueSellingPoints: business.uniqueSellingPoints.join(', '),
      competitorKeywords: business.competitorKeywords.join(', '),
      brandVoice: business.brandVoice || '',
      isActive: business.isActive,
    }
  })

  const watchedIsActive = watch('isActive')

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
        customPrompts: business.customPrompts, // Keep existing custom prompts
      }

      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update business')
      }

      // Redirect to dashboard on success
      router.push('/dashboard?success=business-updated')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setSubmitError(null)

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete business')
      }

      // Redirect to dashboard on success
      router.push('/dashboard?success=business-deleted')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
      setIsDeleting(false)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Business Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Business Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {watchedIsActive ? 'Active - included in prompt processing' : 'Inactive - excluded from prompt processing'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setValue('isActive', !watchedIsActive)}
          className="flex items-center"
        >
          {watchedIsActive ? (
            <ToggleRight className="h-8 w-8 text-green-500" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-gray-400" />
          )}
        </button>
      </div>

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
                Your business automatically targets all {llmProviders.length} AI platforms for maximum coverage and recommendations.
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

      {/* Custom Prompts - Link to dedicated page */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Custom Prompts & AI Configuration
              </h3>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Configure custom prompts, AI-generated prompts, and advanced targeting settings 
              in the dedicated Prompt Configuration section.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.location.href = `/dashboard/businesses/${business.id}/prompts`}
            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors"
          >
            Configure Prompts
          </button>
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
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Business
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/businesses/${business.id}/prompts`)}
            className="flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Mic className="h-4 w-4 mr-2" />
            Configure Prompts
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Updating...' : 'Update Business'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Business
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete &quot;{business.name}&quot;? This action cannot be undone and will remove all associated prompt logs.
            </p>
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
