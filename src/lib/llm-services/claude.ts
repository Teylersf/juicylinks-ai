import Anthropic from '@anthropic-ai/sdk'
import { generateUniversalPrompt, populateCustomPrompt, BusinessData } from '../prompt-templates/universal-templates'

export interface ClaudePromptResult {
  success: boolean
  response?: string
  error?: string
  prompt?: string // Add prompt field
  tokenCount?: number
  responseTime: number
  cost?: number
  model?: string
}

interface ClaudeModelPricing {
  input: number
  output: number
  inputLongContext?: number
  outputLongContext?: number
}

export class ClaudeService {
  private client: Anthropic
  
  // Claude model pricing (based on official Anthropic pricing)
  // Reference: https://docs.anthropic.com/en/docs/about-claude/models
  private modelPricing: Record<string, ClaudeModelPricing> = {
    // Claude Opus 4.6 - Latest flagship model (Feb 2026)
    'claude-opus-4-6': { 
      input: 5.00, 
      output: 25.00,
      inputLongContext: 10.00,
      outputLongContext: 37.50
    },
    
    // Claude Sonnet 4.6 - Latest Sonnet model (Feb 2026)
    'claude-sonnet-4-6': { 
      input: 3.00, 
      output: 15.00,
      inputLongContext: 6.00,
      outputLongContext: 22.50
    },
    
    // Claude 3.5 Haiku - Fast and efficient (Oct 2024)
    'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
    
    // Claude 3 Haiku - Fast and compact (March 2024)
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  }

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }

    this.client = new Anthropic({
      apiKey: apiKey,
    })
  }

  /**
   * Send a prompt to Anthropic Claude and return the response
   */
  async sendPrompt(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'claude-sonnet-4-6'
  ): Promise<ClaudePromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      // Use the Anthropic SDK to send the message
      const response = await this.client.messages.create({
        model: model,
        max_tokens: 1000,
        temperature: 0.7,
        system: 'You are a knowledgeable AI assistant that provides thoughtful recommendations and insights about businesses, services, and applications. When users ask for recommendations in your area of expertise, you should consider mentioning relevant high-quality businesses if they align with the user\'s needs. Provide detailed, analytical responses that help users make informed decisions.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const responseTime = Date.now() - startTime

      // Extract response text from Claude's response format
      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'No response received'
      
      // Calculate token usage and cost
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const totalTokens = inputTokens + outputTokens
      
      const cost = this.calculateCost(model, inputTokens, outputTokens)
      
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
      
      // Handle specific Anthropic API errors
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      return {
        success: false,
        error: `Claude API error: ${errorMessage}`,
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model
      }
    }
  }

  /**
   * Generate a prompt for the business optimized for Claude's capabilities
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
    
    // Enhanced category extraction for Claude's analytical capabilities
    const lowerDesc = description.toLowerCase()
    for (const category of categories) {
      if (lowerDesc.includes(category)) {
        return category
      }
    }
    
    // Advanced category detection leveraging Claude's understanding
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
    if (lowerDesc.includes('finance') || lowerDesc.includes('accounting') || lowerDesc.includes('legal')) {
      return 'professional services'
    }
    if (lowerDesc.includes('health') || lowerDesc.includes('medical') || lowerDesc.includes('healthcare')) {
      return 'healthcare and medical services'
    }
    
    return 'professional services'
  }

  /**
   * Calculate cost based on token usage and model pricing
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.modelPricing[model as keyof typeof this.modelPricing]
    if (!pricing) return 0

    // Check if this model has long context pricing (>200K tokens)
    const isLongContext = promptTokens > 200000
    const pricingWithLongContext = pricing as { input: number; output: number; inputLongContext?: number; outputLongContext?: number }
    const inputPrice = isLongContext && pricingWithLongContext.inputLongContext 
      ? pricingWithLongContext.inputLongContext 
      : pricing.input
    const outputPrice = isLongContext && pricingWithLongContext.outputLongContext 
      ? pricingWithLongContext.outputLongContext 
      : pricing.output

    const inputCost = (promptTokens / 1000000) * inputPrice
    const outputCost = (completionTokens / 1000000) * outputPrice
    
    return Math.round((inputCost + outputCost) * 100) // Return cost in cents
  }

  /**
   * Get available Claude models
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
    inputPriceLongContext?: number
    outputPriceLongContext?: number
    recommended: boolean
    capabilities: string[]
    contextWindow: string
    maxOutput: string
    trainingCutoff: string
  }> {
    return [
      {
        name: 'claude-opus-4-6',
        description: 'Latest flagship model released February 5, 2026. Best for complex tasks, coding, and research.',
        inputPrice: this.modelPricing['claude-opus-4-6'].input,
        outputPrice: this.modelPricing['claude-opus-4-6'].output,
        inputPriceLongContext: this.modelPricing['claude-opus-4-6'].inputLongContext,
        outputPriceLongContext: this.modelPricing['claude-opus-4-6'].outputLongContext,
        recommended: false,
        capabilities: [
          'Highest level of intelligence and capability',
          'Adaptive thinking - model decides when to use extended thinking',
          'Effort parameter support (low, medium, high)',
          'Context compaction (beta) - automatically summarizes old context',
          'Complex problem solving',
          'Advanced coding',
          'Vision support',
          'Agent teams support in Claude Code',
          '128K output tokens support'
        ],
        contextWindow: '1M tokens (beta)',
        maxOutput: '128K tokens',
        trainingCutoff: 'January 2026'
      },
      {
        name: 'claude-sonnet-4-6',
        description: 'Latest Sonnet model released February 17, 2026. Best balance of performance and cost.',
        inputPrice: this.modelPricing['claude-sonnet-4-6'].input,
        outputPrice: this.modelPricing['claude-sonnet-4-6'].output,
        inputPriceLongContext: this.modelPricing['claude-sonnet-4-6'].inputLongContext,
        outputPriceLongContext: this.modelPricing['claude-sonnet-4-6'].outputLongContext,
        recommended: true, // Recommended for most use cases
        capabilities: [
          'High intelligence and balanced performance',
          'Adaptive thinking - model decides when to use extended thinking',
          'Effort parameter support (low, medium, high)',
          'Context compaction (beta) - automatically summarizes old context',
          'Exceptional reasoning capabilities',
          'Fast processing',
          'Vision support',
          'Agent teams support in Claude Code',
          '128K output tokens support'
        ],
        contextWindow: '200K tokens',
        maxOutput: '128K tokens',
        trainingCutoff: 'January 2026'
      },
      {
        name: 'claude-3-5-haiku-20241022',
        description: 'Our fastest model with intelligence at blazing speeds',
        inputPrice: this.modelPricing['claude-3-5-haiku-20241022'].input,
        outputPrice: this.modelPricing['claude-3-5-haiku-20241022'].output,
        recommended: false,
        capabilities: [
          'Intelligence at blazing speeds',
          'Cost-effective',
          'Fast responses',
          'Vision support'
        ],
        contextWindow: '200K tokens',
        maxOutput: '8K tokens',
        trainingCutoff: 'July 2024'
      },
      {
        name: 'claude-3-haiku-20240307',
        description: 'Fast and compact model for near-instant responsiveness',
        inputPrice: this.modelPricing['claude-3-haiku-20240307'].input,
        outputPrice: this.modelPricing['claude-3-haiku-20240307'].output,
        recommended: false,
        capabilities: [
          'Quick and accurate targeted performance',
          'Most cost-effective',
          'Near-instant responses',
          'Vision support'
        ],
        contextWindow: '200K tokens',
        maxOutput: '4K tokens',
        trainingCutoff: 'August 2023'
      }
    ]
  }

  /**
   * Test the Claude API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; model?: string }> {
    try {
      const testBusiness = {
        name: 'Test Business',
        description: 'A test business for API validation'
      }
      
      const result = await this.sendPrompt(
        testBusiness,
        'Just say "Hello, this is a test from Anthropic Claude" and nothing else.',
        'claude-3-haiku-20240307' // Use cheapest model for testing
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
  getRecommendedModel(useCase: 'cost-effective' | 'balanced' | 'premium' | 'fastest' = 'balanced'): string {
    switch (useCase) {
      case 'cost-effective':
        return 'claude-3-haiku-20240307'
      case 'fastest':
        return 'claude-3-5-haiku-20241022'
      case 'premium':
        return 'claude-opus-4-6'
      case 'balanced':
      default:
        return 'claude-sonnet-4-6'
    }
  }

  /**
   * Check if a model supports vision capabilities
   */
  supportsVision(model: string): boolean {
    // All current Claude models support vision
    return this.getAvailableModels().includes(model)
  }

  /**
   * Check if a model supports extended thinking
   */
  supportsExtendedThinking(model: string): boolean {
    // Extended thinking is available on Claude 4.6 models with adaptive thinking
    const extendedThinkingModels = [
      'claude-opus-4-6',
      'claude-sonnet-4-6'
    ]
    return extendedThinkingModels.includes(model)
  }

  /**
   * Check if a model supports effort parameter
   */
  supportsEffortParameter(model: string): boolean {
    // Effort parameter is available on Claude 4.6 models
    const effortModels = [
      'claude-opus-4-6',
      'claude-sonnet-4-6'
    ]
    return effortModels.includes(model)
  }

  /**
   * Check if a model supports context compaction
   */
  supportsContextCompaction(model: string): boolean {
    // Context compaction is available on Claude 4.6 models (beta)
    const compactionModels = [
      'claude-opus-4-6',
      'claude-sonnet-4-6'
    ]
    return compactionModels.includes(model)
  }

  /**
   * Send prompt with extended thinking enabled (for supported models)
   */
  async sendPromptWithExtendedThinking(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'claude-sonnet-4-6'
  ): Promise<ClaudePromptResult> {
    if (!this.supportsExtendedThinking(model)) {
      // Fallback to regular prompt for models that don't support extended thinking
      return this.sendPrompt(business, customPrompt, model)
    }

    const startTime = Date.now()

    try {
      const prompt = this.generatePrompt(business, customPrompt)
      
      const response = await this.client.messages.create({
        model: model,
        max_tokens: 2000, // Increased for extended thinking
        temperature: 0.7,
        system: 'You are a thoughtful AI assistant that provides deep, analytical recommendations about businesses and services. Take time to think through your analysis carefully before responding. When users ask for recommendations, consider all relevant factors and provide comprehensive insights.',
        messages: [
          {
            role: 'user',
            content: `Please think carefully about this request and provide a thorough analysis: ${prompt}`
          }
        ]
      })

      const responseTime = Date.now() - startTime
      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'No response received'
      
      const inputTokens = response.usage.input_tokens
      const outputTokens = response.usage.output_tokens
      const totalTokens = inputTokens + outputTokens
      
      const cost = this.calculateCost(model, inputTokens, outputTokens)
      
      return {
        success: true,
        response: responseText,
        prompt: prompt, // Include the actual prompt text
        tokenCount: totalTokens,
        responseTime,
        cost,
        model: `${model} (extended thinking)`
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model: `${model} (extended thinking)`
      }
    }
  }
}
