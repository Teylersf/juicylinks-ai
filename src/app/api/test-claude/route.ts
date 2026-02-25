import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/llm-services/claude'

export async function POST() {
  try {
    const claudeService = new ClaudeService()
    
    // Test the connection
    const testResult = await claudeService.testConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Anthropic Claude API connection successful',
        model: testResult.model,
        availableModels: claudeService.getAvailableModels(),
        modelInfo: claudeService.getModelInfo(),
        capabilities: {
          vision: true,
          extendedThinking: true,
          reasoning: true,
          analysis: true,
          claude4: true
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing Claude API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const claudeService = new ClaudeService()
    
    return NextResponse.json({
      success: true,
      availableModels: claudeService.getAvailableModels(),
      modelInfo: claudeService.getModelInfo(),
      recommendations: {
        'cost-effective': claudeService.getRecommendedModel('cost-effective'),
        'balanced': claudeService.getRecommendedModel('balanced'),
        'premium': claudeService.getRecommendedModel('premium'),
        'fastest': claudeService.getRecommendedModel('fastest')
      },
      capabilities: {
        vision: 'All models support image understanding and analysis',
        extendedThinking: 'Claude 4 and Sonnet 3.7 models support extended thinking',
        reasoning: 'Superior analytical and reasoning capabilities',
        contextWindow: 'Up to 200K tokens (1M beta available for Sonnet 4)',
        latestModels: 'Claude Opus 4.1 and Sonnet 4 with March 2025 training data'
      },
      message: 'Anthropic Claude service is ready'
    })

  } catch (error) {
    console.error('Error getting Claude info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Advanced test with custom prompt and extended thinking
export async function PUT(request: NextRequest) {
  try {
    const { 
      businessName, 
      businessDescription, 
      customPrompt, 
      model, 
      enableExtendedThinking = false
    } = await request.json()
    
    if (!businessName || !businessDescription) {
      return NextResponse.json({
        success: false,
        error: 'businessName and businessDescription are required'
      }, { status: 400 })
    }

    const claudeService = new ClaudeService()
    
    const testBusiness = {
      name: businessName,
      description: businessDescription
    }

    let result
    if (enableExtendedThinking) {
      result = await claudeService.sendPromptWithExtendedThinking(
        testBusiness,
        customPrompt,
        model || 'claude-sonnet-4-6'
      )
    } else {
      result = await claudeService.sendPrompt(
        testBusiness,
        customPrompt,
        model || 'claude-sonnet-4-6'
      )
    }
    
    return NextResponse.json({
      success: result.success,
      response: result.response,
      error: result.error,
      tokenCount: result.tokenCount,
      responseTime: result.responseTime,
      cost: result.cost,
      model: result.model,
      extendedThinkingEnabled: enableExtendedThinking,
      message: result.success ? 'Prompt sent successfully' : 'Prompt failed'
    })

  } catch (error) {
    console.error('Error testing custom prompt:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Test model capabilities and features
export async function PATCH(request: NextRequest) {
  try {
    const { model } = await request.json()
    const claudeService = new ClaudeService()
    
    const modelInfo = claudeService.getModelInfo()
    const selectedModel = modelInfo.find(m => m.name === (model || 'claude-sonnet-4-6'))
    
    if (!selectedModel) {
      return NextResponse.json({
        success: false,
        error: 'Model not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      model: selectedModel,
      visionSupport: claudeService.supportsVision(selectedModel.name),
      extendedThinkingSupport: claudeService.supportsExtendedThinking(selectedModel.name),
      capabilities: selectedModel.capabilities,
      contextWindow: selectedModel.contextWindow,
      maxOutput: selectedModel.maxOutput,
      trainingCutoff: selectedModel.trainingCutoff,
      pricing: {
        input: `$${selectedModel.inputPrice}/1M tokens`,
        output: `$${selectedModel.outputPrice}/1M tokens`
      },
      message: `${selectedModel.name} model information retrieved`
    })

  } catch (error) {
    console.error('Error getting model info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Compare Claude models
export async function DELETE() {
  try {
    const claudeService = new ClaudeService()
    const modelInfo = claudeService.getModelInfo()
    
    // Group models by generation for comparison
    const claude4Models = modelInfo.filter(m => 
      m.name.includes('claude-opus-4') || m.name.includes('claude-sonnet-4')
    )
    const claude3Models = modelInfo.filter(m => 
      m.name.includes('claude-3')
    )
    
    return NextResponse.json({
      success: true,
      comparison: {
        claude4: {
          models: claude4Models,
          features: [
            'Latest March 2025 training data',
            'Enhanced reasoning capabilities',
            'Extended thinking support',
            'Superior performance',
            'Vision support'
          ],
          recommended: 'claude-sonnet-4-20250514'
        },
        claude3: {
          models: claude3Models,
          features: [
            'Fast processing',
            'Cost-effective options',
            'Vision support',
            'Proven reliability'
          ],
          recommended: 'claude-3-5-haiku-20241022'
        }
      },
      recommendations: {
        'For most use cases': 'claude-sonnet-4-20250514',
        'For premium analysis': 'claude-opus-4-1-20250805',
        'For speed': 'claude-3-5-haiku-20241022',
        'For cost efficiency': 'claude-3-haiku-20240307'
      },
      message: 'Claude model comparison completed'
    })

  } catch (error) {
    console.error('Error comparing models:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
