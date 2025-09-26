import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

interface ClaudeModel {
  id: string
  display_name: string
  created_at: string
  type: string
}

interface ClaudeModelsResponse {
  data: ClaudeModel[]
  first_id: string | null
  has_more: boolean
  last_id: string | null
}

export async function GET(request: NextRequest) {
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

    // Get Claude API key
    const claudeApiKey = process.env.ANTHROPIC_API_KEY
    if (!claudeApiKey) {
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    // Fetch models from Claude API
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { 
          success: false, 
          error: `Claude API error: ${response.status} - ${errorText}` 
        },
        { status: response.status }
      )
    }

    const data: ClaudeModelsResponse = await response.json()

    // Format the models for easier reading
    const formattedModels = data.data.map(model => ({
      id: model.id,
      displayName: model.display_name,
      createdAt: model.created_at,
      type: model.type
    }))

    return NextResponse.json({
      success: true,
      models: formattedModels,
      totalCount: data.data.length,
      hasMore: data.has_more,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Claude models fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Claude models' },
      { status: 500 }
    )
  }
}
