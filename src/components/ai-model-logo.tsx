import Image from 'next/image'

interface AIModelLogoProps {
  provider: 'GROK' | 'OPENAI' | 'CLAUDE' | 'GEMINI' | 'PERPLEXITY'
  size?: number
  className?: string
}

const LOGO_MAPPING = {
  GROK: '/Grok-Logo-2025.png',
  OPENAI: '/OpenAI-Logo-2022.png',
  CLAUDE: '/Claude_AI_logo.svg.png',
  GEMINI: '/Google-Gemini-Logo-PNG-Photos-thumb.png',
  PERPLEXITY: '/Perplexity_AI_logo.svg.png'
} as const

const ALT_TEXT = {
  GROK: 'Grok AI Logo',
  OPENAI: 'OpenAI Logo',
  CLAUDE: 'Claude AI Logo',
  GEMINI: 'Google Gemini Logo',
  PERPLEXITY: 'Perplexity AI Logo'
} as const

export function AIModelLogo({ provider, size = 24, className = '' }: AIModelLogoProps) {
  return (
    <div 
      className={`flex items-center justify-center bg-white/80 dark:bg-white/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm ${className}`}
      style={{ 
        width: size + 8, 
        height: size + 8,
        padding: '4px'
      }}
    >
      <Image
        src={LOGO_MAPPING[provider]}
        alt={ALT_TEXT[provider]}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
