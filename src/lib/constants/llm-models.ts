export interface LLMModel {
  name: string
  description: string
  recommended: boolean
}

export interface LLMProviderModels {
  GROK: LLMModel[]
  OPENAI: LLMModel[]
  CLAUDE: LLMModel[]
  GEMINI: LLMModel[]
  PERPLEXITY: LLMModel[]
}

// Define all models for each LLM provider
export const LLM_MODELS: LLMProviderModels = {
  OPENAI: [
    { name: 'gpt-5.2', description: 'Most advanced flagship for complex tasks', recommended: true },
    { name: 'gpt-5.2-pro', description: 'Maximum compute for hardest problems', recommended: true },
    { name: 'gpt-5.2-codex', description: 'Optimized for coding', recommended: true },
    { name: 'gpt-5-mini', description: 'Cost-effective', recommended: true },
    { name: 'gpt-5-nano', description: 'High throughput', recommended: false }
  ],
  CLAUDE: [
    { name: 'claude-opus-4-6', description: 'Latest flagship with 1M context', recommended: true },
    { name: 'claude-sonnet-4-6', description: 'Best balance performance/cost', recommended: true }
  ],
  GEMINI: [
    { name: 'gemini-3.1-pro-preview', description: 'Latest with enhanced reasoning', recommended: true },
    { name: 'gemini-3-pro-preview', description: 'Standard Pro', recommended: true },
    { name: 'gemini-3-flash-preview', description: 'Fast and cost-effective', recommended: true }
  ],
  GROK: [
    { name: 'grok-4', description: 'Most intelligent xAI model (July 2025)', recommended: true },
    { name: 'grok-4-heavy', description: 'Maximum performance', recommended: true },
    { name: 'grok-3-mini', description: 'Lightweight', recommended: false }
  ],
  PERPLEXITY: [
    { name: 'sonar-deep-research', description: 'Deep multi-step research', recommended: true },
    { name: 'sonar-reasoning-pro', description: 'Advanced reasoning', recommended: true },
    { name: 'sonar-pro', description: 'Professional', recommended: true },
    { name: 'sonar', description: 'Lightweight', recommended: false }
  ]
} as const

export const LLM_COLORS = {
  GROK: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  OPENAI: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  CLAUDE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  GEMINI: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  PERPLEXITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
} as const

export type LLMProvider = keyof typeof LLM_MODELS
