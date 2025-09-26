import { NextResponse } from 'next/server'
import { GrokService } from '@/lib/llm-services/grok'

export async function POST() {
  try {
    const grokService = new GrokService()
    
    // Test the connection
    const testResult = await grokService.testConnection()
    
    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Grok API connection successful',
        availableModels: grokService.getAvailableModels()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error testing Grok API:', error)
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
    const grokService = new GrokService()
    
    return NextResponse.json({
      success: true,
      availableModels: grokService.getAvailableModels(),
      message: 'Grok service is ready'
    })

  } catch (error) {
    console.error('Error getting Grok info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
