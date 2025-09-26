import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch user stats
    const [
      totalPrompts,
      thisMonthPrompts,
      lastPrompt,
      successfulPrompts,
      failedPrompts
    ] = await Promise.all([
      // Total prompts all time
      prisma.promptLog.count({
        where: { userId: user.id }
      }),
      
      // This month prompts
      prisma.promptLog.count({
        where: {
          userId: user.id,
          createdAt: { gte: monthStart }
        }
      }),
      
      // Last prompt
      prisma.promptLog.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      
      // Successful prompts
      prisma.promptLog.count({
        where: {
          userId: user.id,
          wasSuccessful: true
        }
      }),
      
      // Failed prompts
      prisma.promptLog.count({
        where: {
          userId: user.id,
          wasSuccessful: false
        }
      })
    ])

    const stats = {
      totalPrompts,
      thisMonthPrompts,
      lastPromptDate: lastPrompt?.createdAt?.toISOString() || null,
      successfulPrompts,
      failedPrompts
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
