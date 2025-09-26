import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateBusinessSchema = z.object({
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
  isActive: z.boolean(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateBusinessSchema.parse(body)
    const resolvedParams = await params

    // Check if business exists and belongs to user
    const existingBusiness = await prisma.business.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      }
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Update the business
    const business = await prisma.business.update({
      where: { id: resolvedParams.id },
      data: {
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
        isActive: validatedData.isActive,
        updatedAt: new Date(),
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
        updatedAt: business.updatedAt,
      }
    })

  } catch (error) {
    console.error('Error updating business:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid data provided',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Check if business exists and belongs to user
    const existingBusiness = await prisma.business.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      }
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Delete the business (this will cascade delete prompt logs due to foreign key constraints)
    await prisma.business.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Business deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    const business = await prisma.business.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
      include: {
        promptLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      business: {
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
        updatedAt: business.updatedAt,
        recentPrompts: business.promptLogs
      }
    })

  } catch (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    )
  }
}
