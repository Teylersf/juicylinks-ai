import { NextRequest, NextResponse } from 'next/server'
import { PerplexityService } from '@/lib/llm-services/perplexity'

export async function POST() {
  try {
    const perplexityService = new PerplexityService()
    
    // Test the connection
    const testResult = await perplexityService.testConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Perplexity Sonar API connection successful',
        model: testResult.model,
        availableModels: perplexityService.getAvailableModels(),
        modelInfo: perplexityService.getModelInfo(),
        capabilities: {
          realTimeSearch: true,
          currentInformation: true,
          webGrounding: true
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing Perplexity API:', error)
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
    const perplexityService = new PerplexityService()
    
    return NextResponse.json({
      success: true,
      availableModels: perplexityService.getAvailableModels(),
      modelInfo: perplexityService.getModelInfo(),
      recommendations: {
        'cost-effective': perplexityService.getRecommendedModel('cost-effective'),
        'advanced': perplexityService.getRecommendedModel('advanced')
      },
      capabilities: {
        realTimeSearch: 'All Sonar models support real-time web search',
        grounding: 'Responses are grounded in current web information',
        currentData: 'Access to up-to-date information and recent events'
      },
      message: 'Perplexity Sonar service is ready'
    })

  } catch (error) {
    console.error('Error getting Perplexity info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Advanced test with custom prompt
export async function PUT(request: NextRequest) {
  try {
    const { businessName, businessDescription, customPrompt, model } = await request.json()
    
    if (!businessName || !businessDescription) {
      return NextResponse.json({
        success: false,
        error: 'businessName and businessDescription are required'
      }, { status: 400 })
    }

    const perplexityService = new PerplexityService()
    
    const testBusiness = {
      name: businessName,
      description: businessDescription
    }

    const result = await perplexityService.sendPrompt(
      testBusiness,
      customPrompt,
      model || 'sonar'
    )
    
    return NextResponse.json({
      success: result.success,
      response: result.response,
      error: result.error,
      tokenCount: result.tokenCount,
      responseTime: result.responseTime,
      cost: result.cost,
      model: result.model,
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
