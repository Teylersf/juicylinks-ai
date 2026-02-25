import { NextRequest, NextResponse } from 'next/server'

interface BusinessData {
  name: string
  description: string
  website: string
  industry: string
  targetAudience: string
  keyServices: string[]
  uniqueSellingPoints: string[]
  brandVoice: string
  competitorKeywords: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validatedUrl = url.trim()
    if (!validatedUrl.startsWith('http://') && !validatedUrl.startsWith('https://')) {
      validatedUrl = `https://${validatedUrl}`
    }

    // Use Perplexity API to analyze the website
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      return NextResponse.json(
        { success: false, error: 'Perplexity API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `Analyze this business website: ${validatedUrl}

Extract and return ONLY a JSON object with the following structure (no markdown, no code blocks, just raw JSON):
{
  "name": "Business Name",
  "description": "Detailed business description (2-3 sentences about what they do)",
  "industry": "Primary industry category",
  "targetAudience": "Description of their ideal customers",
  "keyServices": ["Service 1", "Service 2", "Service 3"],
  "uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
  "brandVoice": "Description of their brand personality and tone",
  "competitorKeywords": ["Keyword 1", "Keyword 2", "Keyword 3"]
}

Instructions:
- "name": The official business name
- "description": A compelling 2-3 sentence description of what the business does
- "industry": Choose from: Technology, Healthcare, Finance, Education, E-commerce, Manufacturing, Real Estate, Marketing & Advertising, Consulting, Legal Services, Food & Beverage, Travel & Tourism, Entertainment, Non-profit, or Other
- "targetAudience": Describe who their customers are (demographics, needs, pain points)
- "keyServices": Array of 3-5 main services or products they offer
- "uniqueSellingPoints": Array of 3-5 things that make them unique or better than competitors
- "brandVoice": Describe their tone (e.g., professional, friendly, innovative, luxurious, casual)
- "competitorKeywords": Array of 3-5 industry keywords or competitor names

Return ONLY valid JSON. Do not include markdown formatting, code blocks, or any explanatory text.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityApiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst that extracts structured information from websites. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Perplexity API error:', errorData)
      return NextResponse.json(
        { success: false, error: `Failed to analyze website: ${response.status}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No response from Perplexity API' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let businessData: Partial<BusinessData>
    try {
      // Try to extract JSON from the response (handle cases where there might be markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      businessData = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content)
      return NextResponse.json(
        { success: false, error: 'Failed to parse business data from response' },
        { status: 500 }
      )
    }

    // Validate and set defaults
    const result: BusinessData = {
      name: businessData.name || '',
      description: businessData.description || '',
      website: validatedUrl,
      industry: businessData.industry || 'Other',
      targetAudience: businessData.targetAudience || '',
      keyServices: Array.isArray(businessData.keyServices) ? businessData.keyServices : [],
      uniqueSellingPoints: Array.isArray(businessData.uniqueSellingPoints) ? businessData.uniqueSellingPoints : [],
      brandVoice: businessData.brandVoice || '',
      competitorKeywords: Array.isArray(businessData.competitorKeywords) ? businessData.competitorKeywords : []
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Business data extracted successfully'
    })

  } catch (error) {
    console.error('Error scraping business:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
