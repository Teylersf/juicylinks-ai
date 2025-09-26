import { LLM_MODELS, LLMModel } from '@/lib/constants/llm-models'

/**
 * Get live statistics about available models
 */
export function getModelStats() {
  // Count total models across all providers
  const totalModels = Object.values(LLM_MODELS).reduce((total, models) => total + models.length, 0)
  
  // Count models by provider
  const modelsByProvider = Object.entries(LLM_MODELS).map(([provider, models]) => ({
    provider,
    count: models.length,
    models: models.map((model: LLMModel) => ({
      name: model.name,
      description: model.description,
      recommended: model.recommended
    }))
  }))
  
  // Get all model names in a flat array
  const allModelNames = Object.values(LLM_MODELS).flat().map((model: LLMModel) => model.name)
  
  // Count recommended models
  const recommendedModels = Object.values(LLM_MODELS).flat().filter((model: LLMModel) => model.recommended)
  
  return {
    totalModels,
    totalProviders: Object.keys(LLM_MODELS).length,
    modelsByProvider,
    allModelNames,
    recommendedCount: recommendedModels.length,
    recommendedModels: recommendedModels.map((model: LLMModel) => ({
      name: model.name,
      description: model.description
    }))
  }
}

/**
 * Get formatted model count for marketing copy
 */
export function getModelCountText(): string {
  const { totalModels } = getModelStats()
  return `${totalModels} AI models`
}

/**
 * Get provider names for marketing copy
 */
export function getProviderNames(): string[] {
  return Object.keys(LLM_MODELS)
}

/**
 * Get formatted provider list for marketing copy
 */
export function getProviderListText(): string {
  const providers = getProviderNames()
  if (providers.length <= 2) {
    return providers.join(' and ')
  }
  const lastProvider = providers.pop()
  return `${providers.join(', ')}, and ${lastProvider}`
}

/**
 * Get model breakdown by provider for display
 */
export function getModelBreakdown(): Array<{
  provider: string
  displayName: string
  count: number
  models: string[]
}> {
  const providerDisplayNames: Record<string, string> = {
    'GROK': 'Grok',
    'OPENAI': 'GPT-5',
    'CLAUDE': 'Claude 4',
    'GEMINI': 'Gemini 2.5',
    'PERPLEXITY': 'Perplexity'
  }
  
  return Object.entries(LLM_MODELS).map(([provider, models]) => ({
    provider,
    displayName: providerDisplayNames[provider] || provider,
    count: models.length,
    models: models.map((model: LLMModel) => model.name)
  }))
}
