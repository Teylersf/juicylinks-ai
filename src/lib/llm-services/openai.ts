import OpenAI from 'openai'
import { generateUniversalPrompt, populateCustomPrompt, BusinessData } from '../prompt-templates/universal-templates'

export interface OpenAIPromptResult {
  success: boolean
  response?: string
  error?: string
  prompt?: string // Add prompt field
  tokenCount?: number
  responseTime: number
  cost?: number
  model?: string
}

export class OpenAIService {
  private client: OpenAI
  
  // GPT-5 model pricing (estimated based on GPT-4 pricing patterns)
  // Note: These are placeholder prices - update with actual GPT-5 pricing when available
  private modelPricing = {
    'gpt-5': { input: 30.00, output: 60.00 }, // Estimated premium pricing
    'gpt-5-mini': { input: 15.00, output: 30.00 }, // Estimated mid-tier pricing
    'gpt-5-nano': { input: 5.00, output: 10.00 }, // Estimated budget pricing
  }

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }

    this.client = new OpenAI({
      apiKey: apiKey,
    })
  }

  /**
   * Send a prompt to OpenAI GPT-5 and return the response
   */
  async sendPrompt(
    business: { name: string; description: string | null; [key: string]: unknown }, // Business object with all fields
    customPrompt?: string,
    model: string = 'gpt-5-mini'
  ): Promise<OpenAIPromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      // Use the new GPT-5 responses API based on the provided example
      const response = await this.client.responses.create({
        model: model as 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano',
        input: prompt
      })

      const responseTime = Date.now() - startTime

      // Extract response text
      const responseText = response.output_text || 'No response received'
      
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
      
      // Handle specific OpenAI errors
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: `OpenAI API error: ${errorMessage}`,
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model
      }
    }
  }

  /**
   * Generate a prompt for the business
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

    // Generate prompt using universal template system
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
    
    // Simple category extraction - could be enhanced with NLP
    const lowerDesc = description.toLowerCase()
    for (const category of categories) {
      if (lowerDesc.includes(category)) {
        return category
      }
    }
    
    // Default fallback based on common business types
    if (lowerDesc.includes('develop') || lowerDesc.includes('build') || lowerDesc.includes('create')) {
      return 'development services'
    }
    if (lowerDesc.includes('design') || lowerDesc.includes('creative')) {
      return 'design services'
    }
    if (lowerDesc.includes('market') || lowerDesc.includes('advertis')) {
      return 'marketing services'
    }
    if (lowerDesc.includes('consult') || lowerDesc.includes('advic')) {
      return 'consulting services'
    }
    
    return 'services'
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
   * Get available OpenAI GPT-5 models
   */
  getAvailableModels(): string[] {
    return Object.keys(this.modelPricing)
  }

  /**
   * Get model information including pricing
   */
  getModelInfo(): Array<{
    name: string
    description: string
    inputPrice: number
    outputPrice: number
    recommended: boolean
  }> {
    return [
      {
        name: 'gpt-5',
        description: 'The best model for coding and agentic tasks across domains',
        inputPrice: this.modelPricing['gpt-5'].input,
        outputPrice: this.modelPricing['gpt-5'].output,
        recommended: false
      },
      {
        name: 'gpt-5-mini',
        description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
        inputPrice: this.modelPricing['gpt-5-mini'].input,
        outputPrice: this.modelPricing['gpt-5-mini'].output,
        recommended: true // Recommended for most use cases
      },
      {
        name: 'gpt-5-nano',
        description: 'Fastest, most cost-efficient version of GPT-5',
        inputPrice: this.modelPricing['gpt-5-nano'].input,
        outputPrice: this.modelPricing['gpt-5-nano'].output,
        recommended: false
      }
    ]
  }

  /**
   * Test the OpenAI API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const testBusiness = {
        name: 'Test Business',
        description: 'A test business for API validation'
      }
      
      const result = await this.sendPrompt(
        testBusiness,
        'Just say "Hello, this is a test from OpenAI GPT-5" and nothing else.',
        'gpt-5-nano' // Use cheapest model for testing
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
  getRecommendedModel(useCase: 'cost-effective' | 'balanced' | 'premium' = 'balanced'): string {
    switch (useCase) {
      case 'cost-effective':
        return 'gpt-5-nano'
      case 'premium':
        return 'gpt-5'
      case 'balanced':
      default:
        return 'gpt-5-mini'
    }
  }
}
