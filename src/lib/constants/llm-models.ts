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
  GROK: [
    { name: 'grok-code-fast-1', description: 'Optimized for coding tasks', recommended: true },
    { name: 'grok-4-0709', description: 'Advanced reasoning model', recommended: true },
    { name: 'grok-4-fast-reasoning', description: 'Fast reasoning with high performance', recommended: false },
    { name: 'grok-4-fast-non-reasoning', description: 'Fast non-reasoning responses', recommended: false }
  ],
  OPENAI: [
    { name: 'gpt-5', description: 'Most advanced GPT model with superior reasoning', recommended: true },
    { name: 'gpt-5-mini', description: 'Faster, cost-effective GPT-5 variant', recommended: true },
    { name: 'gpt-5-nano', description: 'Ultra-fast GPT-5 for quick responses', recommended: false }
  ],
  CLAUDE: [
    { name: 'claude-opus-4-1-20250805', description: 'Claude Opus 4.1 - Most advanced model', recommended: true },
    { name: 'claude-opus-4-20250514', description: 'Claude Opus 4 - High performance model', recommended: true },
    { name: 'claude-sonnet-4-20250514', description: 'Claude Sonnet 4 - Balanced performance and speed', recommended: true }
  ],
  GEMINI: [
    { name: 'gemini-2.5-pro', description: 'Enhanced thinking and reasoning, multimodal understanding, advanced coding', recommended: true },
    { name: 'gemini-2.5-flash', description: 'Adaptive thinking, cost efficiency', recommended: true },
    { name: 'gemini-2.5-flash-lite', description: 'Most cost-efficient model supporting high throughput', recommended: true }
  ],
  PERPLEXITY: [
    { name: 'sonar', description: 'Real-time web search with grounding', recommended: true },
    { name: 'sonar-pro', description: 'Advanced search for complex queries', recommended: false }
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
