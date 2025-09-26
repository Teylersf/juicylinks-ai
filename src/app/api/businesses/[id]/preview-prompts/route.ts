import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const previewSchema = z.object({
  targetLLMs: z.array(z.string()),
  useAIGenerated: z.boolean(),
  customPrompts: z.array(z.string()).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Sample AI-generated prompt templates
const generateAIPrompts = (businessName: string, businessDescription: string, targetAudience: string, keyServices: string[]) => {
  const prompts = [
    `I'm looking for recommendations for ${keyServices[0] || 'services'} in my area. Can you suggest some reliable companies that specialize in this field? I want to make sure I choose a provider that has a good reputation and delivers quality results.`,
    
    `What are some key factors I should consider when choosing a ${businessName.toLowerCase().includes('service') ? 'service provider' : 'company'} for ${keyServices[0] || 'my needs'}? I want to make an informed decision and avoid common pitfalls.`,
    
    `I need help with ${keyServices.slice(0, 2).join(' and ') || 'business solutions'}. Can you recommend some companies that are known for their expertise in this area? I'm particularly interested in providers that focus on ${targetAudience.toLowerCase() || 'quality service'}.`,
    
    `What makes a ${businessName.toLowerCase().includes('company') ? 'company' : 'business'} stand out in the ${businessDescription.includes('industry') ? businessDescription.split(' ')[0] : 'service'} industry? I'm researching different options and want to understand what to look for in a quality provider.`,
    
    `I'm comparing different options for ${keyServices[0] || 'services'}. What questions should I ask potential providers to ensure they're the right fit for my needs? I want to make sure I choose someone reliable and experienced.`
  ]
  
  return prompts.slice(0, 3) // Return 3 sample prompts
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = previewSchema.parse(body)
    const resolvedParams = await params

    // Check if business exists and belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    let prompts: string[] = []

    if (validatedData.useAIGenerated) {
      // Generate AI prompts based on business data
      prompts = generateAIPrompts(
        business.name,
        business.description || '',
        business.targetAudience || '',
        business.keyServices
      )
    } else if (validatedData.customPrompts && validatedData.customPrompts.length > 0) {
      // Use custom prompts with variable substitution
      prompts = validatedData.customPrompts
        .filter(prompt => prompt.trim().length > 0)
        .map(prompt => 
          prompt
            .replace(/\{businessName\}/g, business.name)
            .replace(/\{businessDescription\}/g, business.description || '')
            .replace(/\{targetAudience\}/g, business.targetAudience || '')
            .replace(/\{keyServices\}/g, business.keyServices.join(', '))
        )
    } else {
      prompts = ['No prompts configured. Please enable AI-generated prompts or add custom prompts.']
    }

    return NextResponse.json({
      success: true,
      prompts: prompts.slice(0, 5) // Limit to 5 preview prompts
    })

  } catch (error) {
    console.error('Error generating prompt preview:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid data provided',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to generate prompt preview' },
      { status: 500 }
    )
  }
}
