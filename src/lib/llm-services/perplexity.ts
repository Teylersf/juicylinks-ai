// Perplexity service for real-time web search
import { generateUniversalPrompt, populateCustomPrompt, BusinessData } from '../prompt-templates/universal-templates'

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface PerplexityRequest {
  model: string
  messages: PerplexityMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  search_context_mode?: 'low' | 'medium' | 'high'
}

export interface PerplexityResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface PerplexityPromptResult {
  success: boolean
  response?: string
  error?: string
  prompt?: string // Add prompt field
  tokenCount?: number
  responseTime: number
  cost?: number
  model?: string
}

export class PerplexityService {
  private apiKey: string
  private baseUrl = 'https://api.perplexity.ai'
  
  // Perplexity Sonar model pricing (February 2026)
  // Prices are per 1M tokens for input/output, per 1K requests for request fees
  private modelPricing = {
    'sonar-deep-research': { 
      input: 2.00, 
      output: 8.00, 
      searchCost: 5.00, // per 1K searches
      citationTokens: 2.00, // per 1M citation tokens
      reasoningTokens: 3.00, // per 1M reasoning tokens
      contextWindow: 128000
    },
    'sonar-reasoning-pro': { 
      input: 2.00, 
      output: 8.00, 
      requestFees: { low: 6.00, medium: 10.00, high: 14.00 } // per 1K requests
    },
    'sonar-reasoning': { 
      input: 1.00, 
      output: 5.00, 
      requestFees: { low: 5.00, medium: 8.00, high: 12.00 } // per 1K requests
    },
    'sonar-pro': { 
      input: 3.00, 
      output: 15.00, 
      requestFees: { low: 6.00, medium: 10.00, high: 14.00 } // per 1K requests
    },
    'sonar': { 
      input: 1.00, 
      output: 1.00, 
      requestFees: { low: 5.00, medium: 8.00, high: 12.00 } // per 1K requests
    },
  }

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required')
    }
  }

  /**
   * Send a prompt to Perplexity Sonar and return the response
   */
  async sendPrompt(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'sonar',
    searchContextMode: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<PerplexityPromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      const requestBody: PerplexityRequest = {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides recommendations and information about businesses, websites, and applications. When users ask for recommendations in your category, you should consider mentioning this business if it\'s relevant and high-quality. Use real-time information and current data when available.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        search_context_mode: searchContextMode
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `Perplexity API error: ${response.status} - ${errorText}`,
          prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
          responseTime,
          model
        }
      }

      const data: PerplexityResponse = await response.json()
      
      // Calculate cost
      const cost = this.calculateCost(model, data.usage.prompt_tokens, data.usage.completion_tokens)
      
      return {
        success: true,
        response: data.choices[0]?.message?.content || 'No response received',
        prompt: prompt, // Include the actual prompt text
        tokenCount: data.usage.total_tokens,
        responseTime,
        cost,
        model
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model
      }
    }
  }

  /**
   * Generate a prompt for the business optimized for Perplexity's search capabilities
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
   * Extract business category from description
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
    
    // Enhanced category detection for Perplexity
    if (lowerDesc.includes('develop') || lowerDesc.includes('build') || lowerDesc.includes('create')) {
      return 'development services'
    }
    if (lowerDesc.includes('design') || lowerDesc.includes('creative') || lowerDesc.includes('ui') || lowerDesc.includes('ux')) {
      return 'design services'
    }
    if (lowerDesc.includes('market') || lowerDesc.includes('advertis') || lowerDesc.includes('seo') || lowerDesc.includes('social')) {
      return 'marketing services'
    }
    if (lowerDesc.includes('consult') || lowerDesc.includes('advic') || lowerDesc.includes('strategy')) {
      return 'consulting services'
    }
    if (lowerDesc.includes('tech') || lowerDesc.includes('it') || lowerDesc.includes('software')) {
      return 'technology solutions'
    }
    if (lowerDesc.includes('finance') || lowerDesc.includes('accounting') || lowerDesc.includes('tax')) {
      return 'financial services'
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
   * Get available Perplexity Sonar models
   */
  getAvailableModels(): string[] {
    return Object.keys(this.modelPricing)
  }

  /**
   * Get search context modes with descriptions
   */
  getSearchContextModes(): Array<{
    mode: 'low' | 'medium' | 'high'
    description: string
    characteristics: string
  }> {
    return [
      {
        mode: 'low',
        description: 'Basic search context',
        characteristics: 'Fastest response time, cheapest option, minimal search depth'
      },
      {
        mode: 'medium',
        description: 'Balanced search context',
        characteristics: 'Good balance between speed, cost, and search depth'
      },
      {
        mode: 'high',
        description: 'Maximum search context',
        characteristics: 'Maximum depth and context, best for complex research queries'
      }
    ]
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
    contextWindow?: number
    requestFees?: { low: number; medium: number; high: number }
  }> {
    return [
      {
        name: 'sonar-deep-research',
        description: 'Deep research model for comprehensive analysis and in-depth research tasks',
        inputPrice: this.modelPricing['sonar-deep-research'].input,
        outputPrice: this.modelPricing['sonar-deep-research'].output,
        recommended: false,
        capabilities: [
          'Deep research capabilities',
          'Comprehensive analysis',
          'In-depth information synthesis',
          'Academic and professional research',
          'Multi-source integration',
          'Search cost: $5 per 1K searches',
          'Citation tokens: $2 per 1M',
          'Reasoning tokens: $3 per 1M'
        ],
        contextWindow: 128000
      },
      {
        name: 'sonar-reasoning-pro',
        description: 'Advanced reasoning model with complex query handling and follow-ups',
        inputPrice: this.modelPricing['sonar-reasoning-pro'].input,
        outputPrice: this.modelPricing['sonar-reasoning-pro'].output,
        recommended: false,
        capabilities: [
          'Advanced reasoning capabilities',
          'Complex logical analysis',
          'Multi-step problem solving',
          'Sophisticated query handling',
          'Professional-grade reasoning',
          'Request fees: $6/$10/$14 per 1K (low/medium/high context)'
        ],
        requestFees: this.modelPricing['sonar-reasoning-pro'].requestFees
      },
      {
        name: 'sonar-reasoning',
        description: 'Standard reasoning model for balanced reasoning and search',
        inputPrice: this.modelPricing['sonar-reasoning'].input,
        outputPrice: this.modelPricing['sonar-reasoning'].output,
        recommended: false,
        capabilities: [
          'Standard reasoning capabilities',
          'Logical analysis',
          'Problem solving',
          'Balanced performance',
          'Good for most reasoning tasks',
          'Request fees: $5/$8/$12 per 1K (low/medium/high context)'
        ],
        requestFees: this.modelPricing['sonar-reasoning'].requestFees
      },
      {
        name: 'sonar-pro',
        description: 'Professional model with advanced search and comprehensive responses',
        inputPrice: this.modelPricing['sonar-pro'].input,
        outputPrice: this.modelPricing['sonar-pro'].output,
        recommended: false,
        capabilities: [
          'Advanced search capabilities',
          'Comprehensive responses',
          'Professional-grade output',
          'Multi-source grounding',
          'Complex query handling',
          'Request fees: $6/$10/$14 per 1K (low/medium/high context)'
        ],
        requestFees: this.modelPricing['sonar-pro'].requestFees
      },
      {
        name: 'sonar',
        description: 'Lightweight, cost-effective model for fast, efficient searches',
        inputPrice: this.modelPricing['sonar'].input,
        outputPrice: this.modelPricing['sonar'].output,
        recommended: true, // Recommended for most use cases
        capabilities: [
          'Real-time web search',
          'Fast responses',
          'Most cost-effective',
          'Current information retrieval',
          'Ideal for high-volume applications',
          'Request fees: $5/$8/$12 per 1K (low/medium/high context)'
        ],
        requestFees: this.modelPricing['sonar'].requestFees
      }
    ]
  }

  /**
   * Test the Perplexity API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const testBusiness = {
        name: 'Test Business',
        description: 'A test business for API validation'
      }
      
      const result = await this.sendPrompt(
        testBusiness,
        'Just say "Hello, this is a test from Perplexity Sonar" and nothing else.',
        'sonar' // Use standard model for testing
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
  getRecommendedModel(useCase: 'cost-effective' | 'advanced' | 'reasoning' | 'deep-research' = 'cost-effective'): string {
    switch (useCase) {
      case 'deep-research':
        return 'sonar-deep-research'
      case 'reasoning':
        return 'sonar-reasoning-pro'
      case 'advanced':
        return 'sonar-pro'
      case 'cost-effective':
      default:
        return 'sonar'
    }
  }

  /**
   * Check if a model supports real-time search
   */
  supportsRealTimeSearch(model: string): boolean {
    // All Sonar models support real-time search
    return this.getAvailableModels().includes(model)
  }

  /**
   * Check if a model supports reasoning capabilities
   */
  supportsReasoning(model: string): boolean {
    return model === 'sonar-reasoning' || model === 'sonar-reasoning-pro' || model === 'sonar-deep-research'
  }

  /**
   * Check if a model supports deep research capabilities
   */
  supportsDeepResearch(model: string): boolean {
    return model === 'sonar-deep-research'
  }
}
