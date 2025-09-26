import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { CreditManager } from '@/lib/credits/credit-manager'
import { calculateTotalCredits } from '@/lib/constants/credit-system'
import { PromptQueueManager } from '@/lib/queue/prompt-queue'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { selectedModels, businessId } = await request.json()

    if (!selectedModels || !Array.isArray(selectedModels) || selectedModels.length === 0) {
      return NextResponse.json({ error: 'No models selected' }, { status: 400 })
    }

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Calculate total credit cost
    const totalCost = calculateTotalCredits(selectedModels)

    // Check if user has enough credits
    const creditCheck = await CreditManager.canAffordModels(
      user.id,
      selectedModels.flatMap(selection => selection.models)
    )

    if (!creditCheck.canAfford) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditCheck.required,
        available: creditCheck.available
      }, { status: 400 })
    }

    // Get queue manager instance
    const queueManager = PromptQueueManager.getInstance()

    // Add selective prompts to queue
    await queueManager.addSelectivePromptsToQueue(user.id, businessId, selectedModels)

    // Process the queue immediately as a credit-based run
    await queueManager.processQueue('credit')

    return NextResponse.json({
      success: true,
      message: 'Selective queue processing started',
      totalCost,
      modelsSelected: selectedModels.reduce((total, selection) => total + selection.models.length, 0)
    })

  } catch (error) {
    console.error('Selective queue trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger selective queue processing' },
      { status: 500 }
    )
  }
}
