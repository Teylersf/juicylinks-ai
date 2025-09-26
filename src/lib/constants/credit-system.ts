import { LLM_MODELS, LLMModel } from './llm-models'

// Credit pricing and packages
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '100 Credits',
    credits: 100,
    price: 1000, // $10.00 in cents
    description: '50-200 individual model submissions',
    details: 'Perfect for testing different AI models',
    popular: false,
  },
  {
    id: 'credits_20',
    name: '220 Credits',
    credits: 220,
    price: 2000, // $20.00 in cents
    description: '110-440 individual model submissions',
    details: 'Most popular choice + 10% bonus credits',
    popular: true,
  },
  {
    id: 'credits_50',
    name: '600 Credits',
    credits: 600,
    price: 5000, // $50.00 in cents
    description: '300-1,200 individual model submissions',
    details: 'Great value with 20% bonus credits',
    popular: false,
  },
  {
    id: 'credits_100',
    name: '1,300 Credits',
    credits: 1300,
    price: 10000, // $100.00 in cents
    description: '650-2,600 individual model submissions',
    details: 'Maximum value with 30% bonus credits',
    popular: false,
  },
] as const

/**
 * Dynamically calculate credit cost based on model name and characteristics
 * This uses the unified LLM_MODELS system and applies intelligent pricing rules
 */
function calculateModelCreditCost(modelName: string): number {
  const name = modelName.toLowerCase()
  
  // Premium models (2.0 credits) - High-end, flagship models
  if (
    name.includes('opus') ||           // Claude Opus models
    name.includes('gpt-5') && !name.includes('mini') && !name.includes('nano') || // GPT-5 base
    name.includes('gemini-2.5-pro') || // Gemini Pro models
    name.includes('pro') && name.includes('gemini')
  ) {
    return 2.0
  }
  
  // Advanced models (1.5 credits) - High performance but not flagship
  if (
    name.includes('grok-4') ||         // Grok-4 series
    name.includes('sonar-pro') ||      // Perplexity Pro
    name.includes('thinking') ||       // Reasoning models
    name.includes('latest')            // Latest versions
  ) {
    return 1.5
  }
  
  // Economy models (0.5 credits) - Fast, cost-effective models
  if (
    name.includes('nano') ||           // Nano variants
    name.includes('mini') ||           // Mini variants  
    name.includes('lite') ||           // Lite variants
    name.includes('haiku') ||          // Claude Haiku
    name.includes('flash-lite') ||     // Gemini Flash Lite
    name.includes('8b')                // Smaller parameter models
  ) {
    return 0.5
  }
  
  // Standard models (1.0 credits) - Default for most models
  return 1.0
}

// Generate dynamic credit costs based on unified model system
function generateModelCreditCosts(): Record<string, number> {
  const costs: Record<string, number> = {}
  
  // Iterate through all models in the unified system
  Object.values(LLM_MODELS).forEach(models => {
    models.forEach((model: LLMModel) => {
      costs[model.name] = calculateModelCreditCost(model.name)
    })
  })
  
  return costs
}

// Dynamic model credit costs - automatically updates when LLM_MODELS changes
export const MODEL_CREDIT_COSTS = generateModelCreditCosts()

// Helper functions
export function getModelCreditCost(modelName: string): number {
  return MODEL_CREDIT_COSTS[modelName] || 1.0 // Default to 1 credit if not found
}

export function calculateTotalCredits(selectedModels: { provider: string; models: string[] }[]): number {
  let total = 0
  for (const selection of selectedModels) {
    for (const modelName of selection.models) {
      total += getModelCreditCost(modelName)
    }
  }
  return total
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Get all models with their credit costs for display
export function getModelsWithCosts() {
  const modelsWithCosts: Array<{
    provider: keyof typeof LLM_MODELS
    name: string
    description: string
    recommended: boolean
    creditCost: number
    tier: 'economy' | 'standard' | 'premium'
  }> = []

  for (const [provider, models] of Object.entries(LLM_MODELS)) {
    for (const model of models) {
      const creditCost = getModelCreditCost(model.name)
      let tier: 'economy' | 'standard' | 'premium' = 'standard'
      
      if (creditCost <= 0.5) tier = 'economy'
      else if (creditCost >= 2.0) tier = 'premium'
      
      modelsWithCosts.push({
        provider: provider as keyof typeof LLM_MODELS,
        name: model.name,
        description: model.description,
        recommended: model.recommended,
        creditCost,
        tier
      })
    }
  }

  return modelsWithCosts
}

// Calculate the equivalent monthly subscription value
export function getSubscriptionEquivalent(): {
  monthlyModels: number
  monthlyCredits: number
  subscriptionPrice: number
} {
  // Based on $49/month for daily submissions to all 22 models
  const monthlyModels = 22 * 30 // 22 models × 30 days
  const monthlyCredits = Object.values(MODEL_CREDIT_COSTS).reduce((sum, cost) => sum + cost, 0) * 30
  const subscriptionPrice = 4900 // $49 in cents
  
  return {
    monthlyModels,
    monthlyCredits,
    subscriptionPrice
  }
}

/**
 * Formats credit amounts for display
 */
export function formatCredits(amount: number): string {
  if (amount === 0) return '0'
  if (amount < 1) return amount.toFixed(1)
  if (amount % 1 === 0) return amount.toString()
  return amount.toFixed(1)
}

