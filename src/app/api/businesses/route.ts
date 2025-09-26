import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createBusinessSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().min(1),
  targetAudience: z.string().min(5).max(300),
  keyServices: z.array(z.string()),
  uniqueSellingPoints: z.array(z.string()),
  competitorKeywords: z.array(z.string()).optional(),
  brandVoice: z.string().max(200).optional(),
  targetLLMs: z.array(z.enum(['GROK', 'OPENAI', 'PERPLEXITY', 'GEMINI', 'CLAUDE'])),
  customPrompts: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createBusinessSchema.parse(body)

    // Get user from database to check plan limits
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { businesses: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check plan limits
    const planLimits = {
      FREE_TRIAL: 1,
      STARTER: 1,
      GROWTH: 5,
      ENTERPRISE: 100,
    }

    const currentLimit = planLimits[dbUser.plan as keyof typeof planLimits] || 1
    
    if (dbUser.businesses.length >= currentLimit) {
      return NextResponse.json({ 
        error: `Your ${dbUser.plan} plan allows up to ${currentLimit} business${currentLimit > 1 ? 'es' : ''}. Please upgrade to add more.` 
      }, { status: 400 })
    }

    // Create the business
    const business = await prisma.business.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        description: validatedData.description,
        website: validatedData.website || null,
        industry: validatedData.industry,
        targetAudience: validatedData.targetAudience,
        keyServices: validatedData.keyServices,
        uniqueSellingPoints: validatedData.uniqueSellingPoints,
        competitorKeywords: validatedData.competitorKeywords || [],
        brandVoice: validatedData.brandVoice || null,
        targetLLMs: validatedData.targetLLMs,
        customPrompts: validatedData.customPrompts || [],
        useAIGeneratedPrompts: !validatedData.customPrompts || validatedData.customPrompts.length === 0,
      }
    })

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        website: business.website,
        industry: business.industry,
        targetLLMs: business.targetLLMs,
        isActive: business.isActive,
        createdAt: business.createdAt,
      }
    })

  } catch (error) {
    console.error('Error creating business:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid data provided',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const businesses = await prisma.business.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        promptLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      businesses: businesses.map(business => ({
        id: business.id,
        name: business.name,
        description: business.description,
        website: business.website,
        industry: business.industry,
        targetAudience: business.targetAudience,
        keyServices: business.keyServices,
        uniqueSellingPoints: business.uniqueSellingPoints,
        competitorKeywords: business.competitorKeywords,
        brandVoice: business.brandVoice,
        targetLLMs: business.targetLLMs,
        customPrompts: business.customPrompts,
        useAIGeneratedPrompts: business.useAIGeneratedPrompts,
        isActive: business.isActive,
        totalPromptsSent: business.totalPromptsSent,
        lastPromptSentAt: business.lastPromptSentAt,
        createdAt: business.createdAt,
        recentPrompts: business.promptLogs.length
      }))
    })

  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
