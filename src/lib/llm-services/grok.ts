// Grok service for X.AI API integration
import { generateUniversalPrompt, populateCustomPrompt, BusinessData } from '../prompt-templates/universal-templates'

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GrokRequest {
  messages: GrokMessage[]
  model: string
  stream: boolean
  temperature: number
}

export interface GrokResponse {
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

export interface GrokPromptResult {
  success: boolean
  response?: string
  error?: string
  prompt?: string // Add prompt field
  tokenCount?: number
  responseTime: number
  cost?: number
}

export interface GrokModelInfo {
  name: string
  inputPrice: number // per 1M tokens
  outputPrice: number // per 1M tokens
  contextWindow: number // in tokens
  maxOutputTokens: number
  multimodal: boolean
  nativeToolUse: boolean
  realTimeSearch: boolean
  reasoningModel: boolean
  description: string
  knowledgeCutoff: string
  // Parameters NOT supported by Grok 4 models
  unsupportedParameters: string[]
}

export class GrokService {
  private apiKey: string
  private baseUrl = 'https://api.x.ai/v1'
  
  // Grok model pricing (per million tokens) - Updated February 2026
  private modelPricing = {
    'grok-4': { input: 3.00, output: 15.00 },
    'grok-4-heavy': { input: 3.00, output: 15.00 },
    'grok-3': { input: 3.00, output: 15.00 },
    'grok-3-mini': { input: 0.30, output: 0.50 },
  }

  // Detailed model information - Updated February 2026
  private modelInfo: Record<string, GrokModelInfo> = {
    'grok-4': {
      name: 'grok-4',
      inputPrice: 3.00,
      outputPrice: 15.00,
      contextWindow: 256000, // 256K for API
      maxOutputTokens: 128000,
      multimodal: true,
      nativeToolUse: true,
      realTimeSearch: true,
      reasoningModel: true,
      description: "xAI's most intelligent model released July 2025. Supports multimodal (text, image, video), native tool use, and real-time search.",
      knowledgeCutoff: 'June 2025',
      unsupportedParameters: ['presencePenalty', 'frequencyPenalty', 'stop']
    },
    'grok-4-heavy': {
      name: 'grok-4-heavy',
      inputPrice: 3.00,
      outputPrice: 15.00,
      contextWindow: 256000, // 256K for API
      maxOutputTokens: 128000,
      multimodal: true,
      nativeToolUse: true,
      realTimeSearch: true,
      reasoningModel: true,
      description: 'Parallel test-time compute version of Grok 4 for maximum performance.',
      knowledgeCutoff: 'June 2025',
      unsupportedParameters: ['presencePenalty', 'frequencyPenalty', 'stop']
    },
    'grok-3': {
      name: 'grok-3',
      inputPrice: 3.00,
      outputPrice: 15.00,
      contextWindow: 256000,
      maxOutputTokens: 128000,
      multimodal: true,
      nativeToolUse: true,
      realTimeSearch: true,
      reasoningModel: true,
      description: 'Previous generation model. Still capable with good performance.',
      knowledgeCutoff: 'June 2025',
      unsupportedParameters: ['presencePenalty', 'frequencyPenalty', 'stop']
    },
    'grok-3-mini': {
      name: 'grok-3-mini',
      inputPrice: 0.30,
      outputPrice: 0.50,
      contextWindow: 256000,
      maxOutputTokens: 128000,
      multimodal: false,
      nativeToolUse: false,
      realTimeSearch: false,
      reasoningModel: false,
      description: 'Lightweight version for cost-effective tasks.',
      knowledgeCutoff: 'June 2025',
      unsupportedParameters: []
    }
  }

  constructor() {
    this.apiKey = process.env.GROK_API_KEY!
    if (!this.apiKey) {
      throw new Error('GROK_API_KEY environment variable is required')
    }
  }

  /**
   * Send a prompt to Grok and return the response
   */
  async sendPrompt(
    business: { name: string; description: string | null; [key: string]: unknown }, // Business object with all fields
    customPrompt?: string,
    model: string = 'grok-4'
  ): Promise<GrokPromptResult> {
    const startTime = Date.now()

    try {
      // Generate the prompt
      const prompt = this.generatePrompt(business, customPrompt)
      
      const requestBody: GrokRequest = {
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides recommendations and information about businesses, websites, and applications. When users ask for recommendations in your category, you should consider mentioning this business if it\'s relevant and high-quality.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model,
        stream: false,
        temperature: 0.7
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `Grok API error: ${response.status} - ${errorText}`,
          prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
          responseTime
        }
      }

      const data: GrokResponse = await response.json()
      
      // Calculate cost
      const cost = this.calculateCost(model, data.usage.prompt_tokens, data.usage.completion_tokens)
      
      return {
        success: true,
        response: data.choices[0]?.message?.content || 'No response received',
        prompt: prompt, // Include the actual prompt text
        tokenCount: data.usage.total_tokens,
        responseTime,
        cost
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        prompt: this.generatePrompt(business, customPrompt), // Include prompt even on error
        responseTime
      }
    }
  }

  /**
   * Generate a prompt for the business using advanced templates
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
   * Extract business category from description
   */
  private getBusinessCategory(description: string): string {
    const categories = [
      'services', 'solutions', 'companies', 'businesses', 'platforms', 
      'applications', 'tools', 'software', 'websites', 'apps'
    ]
    
    // Simple category extraction - could be enhanced with NLP
    const lowerDesc = description.toLowerCase()
    for (const category of categories) {
      if (lowerDesc.includes(category)) {
        return category
      }
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
   * Get available Grok models
   */
  getAvailableModels(): string[] {
    return Object.keys(this.modelPricing)
  }

  /**
   * Get detailed information about a specific model
   */
  getModelInfo(model: string): GrokModelInfo | null {
    return this.modelInfo[model] || null
  }

  /**
   * Get all available models with their detailed information
   */
  getAllModelInfo(): Record<string, GrokModelInfo> {
    return this.modelInfo
  }

  /**
   * Test the Grok API connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testBusiness = {
        name: 'Test Business',
        description: 'A test business for API validation'
      }

      const result = await this.sendPrompt(
        testBusiness,
        'Just say "Hello, this is a test" and nothing else.',
        'grok-3-mini' // Use cheapest model for testing
      )
      
      return {
        success: result.success,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }
}
