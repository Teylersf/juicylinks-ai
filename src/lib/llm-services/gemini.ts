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

export type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high'
export type MediaResolution = 'low' | 'medium' | 'high' | 'ultra_high'

export class GeminiService {
  private client: GoogleGenAI
  
  // Gemini 3 model pricing (as of February 2026)
  // Reference: https://ai.google.dev/pricing
  private modelPricing = {
    // Gemini 3.1 Pro Preview - Latest Pro model released Feb 20, 2026
    // 1M token context window, 64K output
    // Standard: $2.00 input / $12.00 output; Long context (>200K): $4.00 input / $18.00 output
    'gemini-3.1-pro-preview': { input: 2.00, output: 12.00, inputLongContext: 4.00, outputLongContext: 18.00 },
    
    // Gemini 3 Pro Preview - Pro model
    // 1M token context window
    // Standard: $2.00 input / $12.00 output; Long context: $4.00 input / $18.00 output
    'gemini-3-pro-preview': { input: 2.00, output: 12.00, inputLongContext: 4.00, outputLongContext: 18.00 },
    
    // Gemini 3 Flash Preview - Fast, cost-effective model
    // 1M token context window
    // $0.50 input / $3.00 output
    'gemini-3-flash-preview': { input: 0.50, output: 3.00 },
    
    // Gemini 3 Pro Image Preview - Image generation model
    // 65K context, 32K output
    // $2.00 text input / $0.134 per image output
    'gemini-3-pro-image-preview': { input: 2.00, output: 0.134 },
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
    model: string = 'gemini-3-flash-preview',
    thinkingLevel?: ThinkingLevel,
    mediaResolution?: MediaResolution
  ): Promise<GeminiPromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      // Build configuration for Gemini 3 models
      const config: Record<string, unknown> = {}
      
      // Add thinking level configuration for supported models (Gemini 3 Pro variants)
      if (model.includes('pro') && !model.includes('image') && thinkingLevel) {
        config.thinkingLevel = thinkingLevel
      }
      
      // Add media resolution for image quality control
      if (mediaResolution) {
        config.mediaResolution = mediaResolution
      }
      
      // Use the Google GenAI SDK
      const response = await this.client.models.generateContent({
        model: model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined
      })

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

    // Check if this is a long context scenario (>200K tokens for pro models)
    const isLongContext = promptTokens > 200000
    const inputPrice = isLongContext && 'inputLongContext' in pricing 
      ? pricing.inputLongContext 
      : pricing.input
    const outputPrice = isLongContext && 'outputLongContext' in pricing 
      ? pricing.outputLongContext 
      : pricing.output

    const inputCost = (promptTokens / 1000000) * inputPrice
    const outputCost = (completionTokens / 1000000) * outputPrice
    
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
        name: 'gemini-3.1-pro-preview',
        description: 'Latest Pro model released Feb 20, 2026 with enhanced reasoning and 1M context window',
        inputPrice: this.modelPricing['gemini-3.1-pro-preview'].input,
        outputPrice: this.modelPricing['gemini-3.1-pro-preview'].output,
        recommended: false,
        capabilities: [
          'Enhanced thinking and reasoning',
          '1M token context window',
          '64K output tokens',
          'Thinking level control (minimal, low, medium, high)',
          'Multimodal understanding',
          'Advanced coding',
          'Audio, images, videos, text, and PDF input'
        ],
        optimizedFor: 'Complex reasoning and multimodal tasks requiring latest capabilities'
      },
      {
        name: 'gemini-3-pro-preview',
        description: 'Pro model with 1M context window and advanced reasoning',
        inputPrice: this.modelPricing['gemini-3-pro-preview'].input,
        outputPrice: this.modelPricing['gemini-3-pro-preview'].output,
        recommended: false,
        capabilities: [
          'Advanced reasoning',
          '1M token context window',
          'Thinking level control',
          'Multimodal understanding',
          'Complex problem solving',
          'Audio, images, videos, text, and PDF input'
        ],
        optimizedFor: 'Complex reasoning and multimodal tasks'
      },
      {
        name: 'gemini-3-flash-preview',
        description: 'Fast, cost-effective model with 1M context window',
        inputPrice: this.modelPricing['gemini-3-flash-preview'].input,
        outputPrice: this.modelPricing['gemini-3-flash-preview'].output,
        recommended: true, // Recommended for most use cases
        capabilities: [
          'Fast responses',
          '1M token context window',
          'Cost efficient',
          'Media resolution control',
          'Audio, images, videos, and text input'
        ],
        optimizedFor: 'Balanced performance and cost efficiency'
      },
      {
        name: 'gemini-3-pro-image-preview',
        description: 'Image generation model with 65K context and 32K output',
        inputPrice: this.modelPricing['gemini-3-pro-image-preview'].input,
        outputPrice: this.modelPricing['gemini-3-pro-image-preview'].output,
        recommended: false,
        capabilities: [
          'Image generation',
          '65K token context window',
          '32K output tokens',
          'Text-to-image',
          'Vision-based tasks'
        ],
        optimizedFor: 'Image generation and vision tasks'
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
        'gemini-3-flash-preview' // Use cheapest model for testing
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
  getRecommendedModel(useCase: 'cost-effective' | 'balanced' | 'premium' | 'latest' | 'image' = 'balanced'): string {
    switch (useCase) {
      case 'cost-effective':
        return 'gemini-3-flash-preview'
      case 'premium':
        return 'gemini-3-pro-preview'
      case 'latest':
        return 'gemini-3.1-pro-preview'
      case 'image':
        return 'gemini-3-pro-image-preview'
      case 'balanced':
      default:
        return 'gemini-3-flash-preview'
    }
  }

  /**
   * Check if a model supports multimodal input
   */
  supportsMultimodal(model: string): boolean {
    // All Gemini 3 models support multimodal input
    return this.getAvailableModels().includes(model)
  }

  /**
   * Check if a model supports image generation
   */
  supportsImageGeneration(model: string): boolean {
    return model === 'gemini-3-pro-image-preview'
  }

  /**
   * Check if a model supports thinking level control
   */
  supportsThinkingLevel(model: string): boolean {
    return model.includes('pro') && !model.includes('image')
  }

  /**
   * Enable thinking mode for enhanced reasoning (increases cost and response time)
   * Supports thinking levels: minimal, low, medium, high (default)
   */
  async sendPromptWithThinking(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'gemini-3-flash-preview',
    thinkingLevel: ThinkingLevel = 'high'
  ): Promise<GeminiPromptResult> {
    const startTime = Date.now()

    try {
      const prompt = this.generatePrompt(business, customPrompt)
      
      // Build configuration with thinking level
      const config: Record<string, unknown> = {
        thinkingLevel: thinkingLevel
      }
      
      const response = await this.client.models.generateContent({
        model: model,
        contents: prompt,
        config
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
        model: `${model} (thinking: ${thinkingLevel})`
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime,
        model: `${model} (thinking: ${thinkingLevel})`
      }
    }
  }

  /**
   * Send a prompt with media resolution control for image quality
   * Supports: low, medium, high, ultra_high
   */
  async sendPromptWithMediaResolution(
    business: { name: string; description: string | null; [key: string]: unknown },
    customPrompt?: string,
    model: string = 'gemini-3-flash-preview',
    mediaResolution: MediaResolution = 'high'
  ): Promise<GeminiPromptResult> {
    return this.sendPrompt(business, customPrompt, model, undefined, mediaResolution)
  }
}
