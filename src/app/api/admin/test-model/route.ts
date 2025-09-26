import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { GrokService } from '@/lib/llm-services/grok'
import { OpenAIService } from '@/lib/llm-services/openai'
import { PerplexityService } from '@/lib/llm-services/perplexity'
import { GeminiService } from '@/lib/llm-services/gemini'
import { ClaudeService } from '@/lib/llm-services/claude'

const TEST_BUSINESS = {
  name: "Test Business",
  description: "This is a test business for admin model testing",
  website: "https://test-business.com",
  industry: "Technology",
  targetAudience: "Tech enthusiasts",
  keyServices: ["Testing", "Development"],
  uniqueSellingPoints: ["Fast", "Reliable"],
  brandVoice: "Professional"
}

const getTestPrompt = (provider: string, model: string) => {
  const providerNames = {
    'GROK': 'Grok',
    'OPENAI': 'OpenAI GPT',
    'CLAUDE': 'Anthropic Claude',
    'GEMINI': 'Google Gemini',
    'PERPLEXITY': 'Perplexity'
  }
  
  const providerName = providerNames[provider as keyof typeof providerNames] || provider
  return `Test prompt: Please respond with 'Hello, this is a test response from ${providerName} ${model}. The model is working correctly.' and nothing else.`
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    try {
      verify(token, adminPassword)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { provider, model } = await request.json()

    if (!provider || !model) {
      return NextResponse.json(
        { success: false, error: 'Provider and model are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let result: { success: boolean; response?: string; error?: string }

    try {
      const testPrompt = getTestPrompt(provider.toUpperCase(), model)
      
      switch (provider.toUpperCase()) {
        case 'GROK':
          const grokService = new GrokService()
          result = await grokService.sendPrompt(TEST_BUSINESS, testPrompt, model)
          break

        case 'OPENAI':
          const openaiService = new OpenAIService()
          result = await openaiService.sendPrompt(TEST_BUSINESS, testPrompt, model)
          break

        case 'PERPLEXITY':
          const perplexityService = new PerplexityService()
          result = await perplexityService.sendPrompt(TEST_BUSINESS, testPrompt, model)
          break

        case 'GEMINI':
          const geminiService = new GeminiService()
          result = await geminiService.sendPrompt(TEST_BUSINESS, testPrompt, model)
          break

        case 'CLAUDE':
          const claudeService = new ClaudeService()
          result = await claudeService.sendPrompt(TEST_BUSINESS, testPrompt, model)
          break

        default:
          return NextResponse.json(
            { success: false, error: `Unsupported provider: ${provider}` },
            { status: 400 }
          )
      }

      const responseTime = Date.now() - startTime

      if (result.success) {
        return NextResponse.json({
          success: true,
          response: result.response,
          responseTime,
          model,
          provider
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error || 'Unknown error',
          responseTime,
          model,
          provider
        })
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime,
        model,
        provider
      })
    }

  } catch (error) {
    console.error('Admin test model error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
