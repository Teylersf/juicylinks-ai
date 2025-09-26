import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const promptConfigSchema = z.object({
  targetLLMs: z.array(z.enum(['GROK', 'OPENAI', 'PERPLEXITY', 'GEMINI', 'CLAUDE'])),
  customPrompts: z.array(z.string()).optional(),
  useAIGeneratedPrompts: z.boolean(),
  promptFrequency: z.enum(['daily', 'weekly']).optional(),
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
    const validatedData = promptConfigSchema.parse(body)
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

    // Update the business prompt configuration
    const business = await prisma.business.update({
      where: { id: resolvedParams.id },
      data: {
        targetLLMs: validatedData.targetLLMs,
        customPrompts: validatedData.customPrompts || [],
        useAIGeneratedPrompts: validatedData.useAIGeneratedPrompts,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        targetLLMs: business.targetLLMs,
        customPrompts: business.customPrompts,
        useAIGeneratedPrompts: business.useAIGeneratedPrompts,
        isActive: business.isActive,
        updatedAt: business.updatedAt,
      }
    })

  } catch (error) {
    console.error('Error updating prompt configuration:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid data provided',
        details: error.issues
      }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update prompt configuration' },
      { status: 500 }
    )
  }
}
