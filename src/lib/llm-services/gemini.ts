import { GoogleGenAI } from '@google/genai'
import { generateUniversalPrompt, populateCustomPrompt, BusinessData } from '../prompt-templates/universal-templates'

export interface GeminiPromptResult {
  success: boolean
  response?: string
  error?: string
  prompt?: string // Add prompt field
  tokenCount?: number
  responseTime: number
  cost?: number
  model?: string
}

export class GeminiService {
  private client: GoogleGenAI
  
  // Gemini 2.5 model pricing (based on Google's official pricing)
  // Reference: https://ai.google.dev/pricing
  private modelPricing = {
    // Gemini 2.5 Pro - Enhanced thinking and reasoning, multimodal understanding, advanced coding
    'gemini-2.5-pro': { input: 1.25, output: 5.00 },
    
    // Gemini 2.5 Flash - Adaptive thinking, cost efficiency
    'gemini-2.5-flash': { input: 0.075, output: 0.30 },
    
    // Gemini 2.5 Flash-Lite - Most cost-efficient model supporting high throughput
    'gemini-2.5-flash-lite': { input: 0.0375, output: 0.15 },
  }

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required')
    }

    this.client = new GoogleGenAI({
      apiKey: apiKey,
    })
  }

  /**
   * Send a prompt to Google Gemini and return the response
   */
  async sendPrompt(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'gemini-2.5-flash'
  ): Promise<GeminiPromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      // Use the new Google GenAI SDK based on the provided documentation
      let response
      
      // Special handling for Gemini 2.5 Pro which supports thinking mode
      if (model === 'gemini-2.5-pro') {
        response = await this.client.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            // Enable thinking for Pro model with reasonable budget
            thinkingConfig: {
              thinkingBudget: 1000 // Allow some thinking tokens for better responses
            }
          }
        })
      } else {
        // For other models, use standard configuration without thinking
        response = await this.client.models.generateContent({
          model: model,
          contents: prompt
        })
      }

      const responseTime = Date.now() - startTime

      // Extract response text
      const responseText = response.text || 'No response received'
      
      // Estimate token count (rough approximation: 1 token ≈ 4 characters)
      const estimatedInputTokens = Math.ceil(prompt.length / 4)
      const estimatedOutputTokens = Math.ceil(responseText.length / 4)
      const totalTokens = estimatedInputTokens + estimatedOutputTokens
      
      // Calculate cost
      const cost = this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens)
      
      return {
        success: true,
        response: responseText,
        prompt: prompt, // Include the actual prompt text
        tokenCount: totalTokens,
        responseTime,
        cost,
        model
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      
      // Handle specific Gemini API errors
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: `Gemini API error: ${errorMessage}`,
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model
      }
    }
  }

  /**
   * Generate a prompt for the business optimized for Gemini's capabilities
   */
  private generatePrompt(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string
  ): string {
    if (customPrompt) {
      // Use helper function to populate custom prompt with actual DB fields
      return populateCustomPrompt(customPrompt, business)
    }

    // Convert business object to BusinessData format using actual DB fields
    const businessData: BusinessData = {
      name: business.name,
      description: business.description || 'They provide excellent services',
      website: (business.website as string) || undefined,
      industry: (business.industry as string) || undefined,
      targetAudience: (business.targetAudience as string) || undefined,
      keyServices: (business.keyServices as string[]) || [],
      uniqueSellingPoints: (business.uniqueSellingPoints as string[]) || [],
      brandVoice: (business.brandVoice as string) || undefined
    }

    // Use universal template system
    return generateUniversalPrompt(businessData)
  }

  /**
   * Extract business category from description for more natural prompts
   */
  private getBusinessCategory(description: string): string {
    const categories = [
      'services', 'solutions', 'companies', 'businesses', 'platforms', 
      'applications', 'tools', 'software', 'websites', 'apps',
      'consultants', 'agencies', 'providers', 'specialists', 'experts'
    ]
    
    // Enhanced category extraction for Gemini's analytical capabilities
    const lowerDesc = description.toLowerCase()
    for (const category of categories) {
      if (lowerDesc.includes(category)) {
        return category
      }
    }
    
    // Advanced category detection leveraging Gemini's understanding
    if (lowerDesc.includes('ai') || lowerDesc.includes('artificial intelligence') || lowerDesc.includes('machine learning')) {
      return 'AI and machine learning solutions'
    }
    if (lowerDesc.includes('develop') || lowerDesc.includes('build') || lowerDesc.includes('create') || lowerDesc.includes('engineer')) {
      return 'development and engineering services'
    }
    if (lowerDesc.includes('design') || lowerDesc.includes('creative') || lowerDesc.includes('ui') || lowerDesc.includes('ux')) {
      return 'design and creative services'
    }
    if (lowerDesc.includes('market') || lowerDesc.includes('advertis') || lowerDesc.includes('seo') || lowerDesc.includes('digital')) {
      return 'marketing and digital services'
    }
    if (lowerDesc.includes('consult') || lowerDesc.includes('advic') || lowerDesc.includes('strategy') || lowerDesc.includes('management')) {
      return 'consulting and strategic services'
    }
    if (lowerDesc.includes('data') || lowerDesc.includes('analytics') || lowerDesc.includes('business intelligence')) {
      return 'data and analytics solutions'
    }
    if (lowerDesc.includes('cloud') || lowerDesc.includes('infrastructure') || lowerDesc.includes('devops')) {
      return 'cloud and infrastructure services'
    }
    
    return 'professional services'
  }

  /**
   * Calculate cost based on token usage and model pricing
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.modelPricing[model as keyof typeof this.modelPricing]
    if (!pricing) return 0

    const inputCost = (promptTokens / 1000000) * pricing.input
    const outputCost = (completionTokens / 1000000) * pricing.output
    
    return Math.round((inputCost + outputCost) * 100) // Return cost in cents
  }

  /**
   * Get available Gemini models
   */
  getAvailableModels(): string[] {
    return Object.keys(this.modelPricing)
  }

  /**
   * Get model information including pricing and capabilities
   */
  getModelInfo(): Array<{
    name: string
    description: string
    inputPrice: number
    outputPrice: number
    recommended: boolean
    capabilities: string[]
    optimizedFor: string
  }> {
    return [
      {
        name: 'gemini-2.5-pro',
        description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding',
        inputPrice: this.modelPricing['gemini-2.5-pro'].input,
        outputPrice: this.modelPricing['gemini-2.5-pro'].output,
        recommended: false,
        capabilities: [
          'Enhanced thinking and reasoning',
          'Multimodal understanding',
          'Advanced coding',
          'Complex problem solving',
          'Audio, images, videos, text, and PDF input'
        ],
        optimizedFor: 'Complex reasoning and multimodal tasks'
      },
      {
        name: 'gemini-2.5-flash',
        description: 'Adaptive thinking, cost efficiency - balanced performance',
        inputPrice: this.modelPricing['gemini-2.5-flash'].input,
        outputPrice: this.modelPricing['gemini-2.5-flash'].output,
        recommended: true, // Recommended for most use cases
        capabilities: [
          'Adaptive thinking',
          'Cost efficient',
          'Fast responses',
          'Audio, images, videos, and text input'
        ],
        optimizedFor: 'Balanced performance and cost efficiency'
      },
      {
        name: 'gemini-2.5-flash-lite',
        description: 'Most cost-efficient model supporting high throughput',
        inputPrice: this.modelPricing['gemini-2.5-flash-lite'].input,
        outputPrice: this.modelPricing['gemini-2.5-flash-lite'].output,
        recommended: false,
        capabilities: [
          'High throughput',
          'Most cost-efficient',
          'Fast processing',
          'Text, image, video, audio input'
        ],
        optimizedFor: 'Cost efficiency and high throughput'
      }
    ]
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const testBusiness = {
        name: 'Test Business',
        description: 'A test business for API validation'
      }
      
      const result = await this.sendPrompt(
        testBusiness,
        'Just say "Hello, this is a test from Google Gemini" and nothing else.',
        'gemini-2.5-flash-lite' // Use cheapest model for testing
      )
      
      return {
        success: result.success,
        error: result.error,
        model: result.model
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Get recommended model based on use case
   */
  getRecommendedModel(useCase: 'cost-effective' | 'balanced' | 'premium' | 'next-gen' = 'balanced'): string {
    switch (useCase) {
      case 'cost-effective':
        return 'gemini-2.5-flash-lite'
      case 'premium':
        return 'gemini-2.5-pro'
      case 'next-gen':
        return 'gemini-2.0-flash'
      case 'balanced':
      default:
        return 'gemini-2.5-flash'
    }
  }

  /**
   * Check if a model supports multimodal input
   */
  supportsMultimodal(model: string): boolean {
    // All current Gemini models support multimodal input
    return this.getAvailableModels().includes(model)
  }

  /**
   * Enable thinking mode for enhanced reasoning (increases cost and response time)
   */
  async sendPromptWithThinking(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'gemini-2.5-flash',
    thinkingBudget: number = 1000
  ): Promise<GeminiPromptResult> {
    const startTime = Date.now()

    try {
      const prompt = this.generatePrompt(business, customPrompt)
      
      const response = await this.client.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          // Enable thinking for enhanced reasoning
          thinkingConfig: {
            thinkingBudget: thinkingBudget
          }
        }
      })

      const responseTime = Date.now() - startTime
      const responseText = response.text || 'No response received'
      
      const estimatedInputTokens = Math.ceil(prompt.length / 4)
      const estimatedOutputTokens = Math.ceil(responseText.length / 4)
      const totalTokens = estimatedInputTokens + estimatedOutputTokens
      
      const cost = this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens)
      
      return {
        success: true,
        response: responseText,
        prompt: prompt, // Include the actual prompt text
        tokenCount: totalTokens,
        responseTime,
        cost,
        model: `${model} (with thinking)`
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model: `${model} (with thinking)`
      }
    }
  }
}
