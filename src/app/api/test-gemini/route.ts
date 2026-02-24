import { NextRequest, NextResponse } from 'next/server'
import { GeminiService } from '@/lib/llm-services/gemini'

export async function POST() {
  try {
    const geminiService = new GeminiService()
    
    // Test the connection
    const testResult = await geminiService.testConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Google Gemini API connection successful',
        model: testResult.model,
        availableModels: geminiService.getAvailableModels(),
        modelInfo: geminiService.getModelInfo(),
        capabilities: {
          multimodal: true,
          reasoning: true,
          thinking: true,
          nextGeneration: true
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing Gemini API:', error)
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
    const geminiService = new GeminiService()
    
    return NextResponse.json({
      success: true,
      availableModels: geminiService.getAvailableModels(),
      modelInfo: geminiService.getModelInfo(),
      recommendations: {
        'cost-effective': geminiService.getRecommendedModel('cost-effective'),
        'balanced': geminiService.getRecommendedModel('balanced'),
        'premium': geminiService.getRecommendedModel('premium'),
        'latest': geminiService.getRecommendedModel('latest')
      },
      capabilities: {
        multimodal: 'All models support audio, images, videos, and text input',
        reasoning: 'Enhanced thinking and reasoning capabilities',
        thinking: 'Adaptive thinking mode available (increases cost)',
        nextGeneration: 'Gemini 3.x models with latest features'
      },
      message: 'Google Gemini service is ready'
    })

  } catch (error) {
    console.error('Error getting Gemini info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Advanced test with custom prompt and thinking mode
export async function PUT(request: NextRequest) {
  try {
    const { 
      businessName, 
      businessDescription, 
      customPrompt, 
      model, 
      enableThinking = false,
      thinkingBudget = 1000 
    } = await request.json()
    
    if (!businessName || !businessDescription) {
      return NextResponse.json({
        success: false,
        error: 'businessName and businessDescription are required'
      }, { status: 400 })
    }

    const geminiService = new GeminiService()
    
    const testBusiness = {
      name: businessName,
      description: businessDescription
    }

    let result
    if (enableThinking) {
      result = await geminiService.sendPromptWithThinking(
        testBusiness,
        customPrompt,
        model || 'gemini-3-flash-preview',
        thinkingBudget
      )
    } else {
      result = await geminiService.sendPrompt(
        testBusiness,
        customPrompt,
        model || 'gemini-3-flash-preview'
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
      thinkingEnabled: enableThinking,
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

// Test multimodal capabilities info
export async function PATCH(request: NextRequest) {
  try {
    const { model } = await request.json()
    const geminiService = new GeminiService()
    
    const modelInfo = geminiService.getModelInfo()
    const selectedModel = modelInfo.find(m => m.name === (model || 'gemini-3-flash-preview'))
    
    if (!selectedModel) {
      return NextResponse.json({
        success: false,
        error: 'Model not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      model: selectedModel,
      multimodalSupport: geminiService.supportsMultimodal(selectedModel.name),
      capabilities: selectedModel.capabilities,
      optimizedFor: selectedModel.optimizedFor,
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
