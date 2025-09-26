import { NextResponse } from 'next/server'
import { OpenAIService } from '@/lib/llm-services/openai'

export async function POST() {
  try {
    const openaiService = new OpenAIService()
    
    // Test the connection
    const testResult = await openaiService.testConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'OpenAI GPT-5 API connection successful',
        model: testResult.model,
        availableModels: openaiService.getAvailableModels(),
        modelInfo: openaiService.getModelInfo()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing OpenAI API:', error)
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
    const openaiService = new OpenAIService()
    
    return NextResponse.json({
      success: true,
      availableModels: openaiService.getAvailableModels(),
      modelInfo: openaiService.getModelInfo(),
      recommendations: {
        'cost-effective': openaiService.getRecommendedModel('cost-effective'),
        'balanced': openaiService.getRecommendedModel('balanced'),
        'premium': openaiService.getRecommendedModel('premium')
      },
      message: 'OpenAI GPT-5 service is ready'
    })

  } catch (error) {
    console.error('Error getting OpenAI info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
