import { getModelStats } from './model-stats'

export interface ProviderConfig {
  id: string
  name: string
  description: string
  provider: 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'
  color: string
}

export interface OnboardingProviderConfig {
  id: string
  name: string
  description: string
  provider: 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'
  recommended: boolean
}

/**
 * Get unified provider configurations that automatically update with model counts
 */
export function getProviderConfigs(): ProviderConfig[] {
  const modelStats = getModelStats()
  
  // Create a map of provider to model count for dynamic descriptions
  const providerCounts = modelStats.modelsByProvider.reduce((acc, { provider, count }) => {
    acc[provider] = count
    return acc
  }, {} as Record<string, number>)

  const providerConfigs: ProviderConfig[] = [
    {
      id: 'GROK',
      name: 'Grok (X.AI)',
      description: `${providerCounts.GROK || 0} models including grok-4-latest`,
      provider: 'GROK',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    },
    {
      id: 'OPENAI',
      name: 'OpenAI GPT-5',
      description: `${providerCounts.OPENAI || 0} models including gpt-5 and gpt-5-mini`,
      provider: 'OPENAI',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    },
    {
      id: 'GEMINI',
      name: 'Google Gemini',
      description: `${providerCounts.GEMINI || 0} models with multimodal support`,
      provider: 'GEMINI',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    },
    {
      id: 'CLAUDE',
      name: 'Anthropic Claude',
      description: `${providerCounts.CLAUDE || 0} models including Claude 4 Opus`,
      provider: 'CLAUDE',
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    },
    {
      id: 'PERPLEXITY',
      name: 'Perplexity Sonar',
      description: `${providerCounts.PERPLEXITY || 0} models with real-time search`,
      provider: 'PERPLEXITY',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    }
  ]

  return providerConfigs
}

/**
 * Get simplified provider configs for basic forms (without colors)
 */
export function getSimpleProviderConfigs() {
  const modelStats = getModelStats()
  
  // Create a map of provider to model count for dynamic descriptions
  const providerCounts = modelStats.modelsByProvider.reduce((acc, { provider, count }) => {
    acc[provider] = count
    return acc
  }, {} as Record<string, number>)

  return [
    { id: 'GROK', name: 'Grok (X.AI)', description: `${providerCounts.GROK || 0} models including grok-4-latest` },
    { id: 'OPENAI', name: 'OpenAI GPT-5', description: `${providerCounts.OPENAI || 0} models including gpt-5 and gpt-5-mini` },
    { id: 'GEMINI', name: 'Google Gemini', description: `${providerCounts.GEMINI || 0} models with multimodal support` },
    { id: 'CLAUDE', name: 'Anthropic Claude', description: `${providerCounts.CLAUDE || 0} models including Claude 4 Opus` },
    { id: 'PERPLEXITY', name: 'Perplexity Sonar', description: `${providerCounts.PERPLEXITY || 0} models with real-time search` }
  ]
}

/**
 * Get provider configs for onboarding with recommendation flags
 */
export function getOnboardingProviderConfigs(): OnboardingProviderConfig[] {
  const modelStats = getModelStats()
  
  // Create a map of provider to model count for dynamic descriptions
  const providerCounts = modelStats.modelsByProvider.reduce((acc, { provider, count }) => {
    acc[provider] = count
    return acc
  }, {} as Record<string, number>)

  return [
    { 
      id: 'GROK', 
      name: 'Grok (X.AI)', 
      description: `${providerCounts.GROK || 0} models including grok-4-latest`,
      provider: 'GROK',
      recommended: true
    },
    { 
      id: 'OPENAI', 
      name: 'OpenAI GPT-5', 
      description: `${providerCounts.OPENAI || 0} models including gpt-5 and gpt-5-mini`,
      provider: 'OPENAI',
      recommended: true
    },
    { 
      id: 'GEMINI', 
      name: 'Google Gemini', 
      description: `${providerCounts.GEMINI || 0} models with multimodal support`,
      provider: 'GEMINI',
      recommended: true
    },
    { 
      id: 'CLAUDE', 
      name: 'Anthropic Claude', 
      description: `${providerCounts.CLAUDE || 0} models including Claude 4 Opus`,
      provider: 'CLAUDE',
      recommended: false
    },
    { 
      id: 'PERPLEXITY', 
      name: 'Perplexity Sonar', 
      description: `${providerCounts.PERPLEXITY || 0} models with real-time search`,
      provider: 'PERPLEXITY',
      recommended: false
    }
  ]
}
