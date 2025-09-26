import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PromptQueueManager } from '@/lib/queue/prompt-queue'

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queueManager = PromptQueueManager.getInstance()
    const currentQueue = queueManager.getCurrentQueue()
    const isProcessing = queueManager.isCurrentlyProcessing()

    return NextResponse.json({
      success: true,
      cronStatus: {
        vercelCronsConfigured: true,
        dailyCron: '0 9 * * * (9 AM UTC daily)',
        hourlyCron: '0 */4 * * * (Every 4 hours)',
        nextDailyRun: getNextCronRun('0 9 * * *'),
        nextHourlyRun: getNextCronRun('0 */4 * * *')
      },
      queueStatus: {
        isProcessing,
        queueLength: currentQueue.length,
        processingItem: currentQueue.find(item => item.status === 'processing'),
        pendingItems: currentQueue.filter(item => item.status === 'pending').length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting cron status:', error)
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}

function getNextCronRun(cronExpression: string): string {
  // Simple next run calculation for display purposes
  const now = new Date()
  
  if (cronExpression === '0 9 * * *') {
    // Daily at 9 AM UTC
    const next = new Date(now)
    next.setUTCHours(9, 0, 0, 0)
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 1)
    }
    return next.toISOString()
  }
  
  if (cronExpression === '0 */4 * * *') {
    // Every 4 hours
    const next = new Date(now)
    const currentHour = next.getUTCHours()
    const nextHour = Math.ceil((currentHour + 1) / 4) * 4
    next.setUTCHours(nextHour, 0, 0, 0)
    if (nextHour >= 24) {
      next.setUTCDate(next.getUTCDate() + 1)
      next.setUTCHours(0, 0, 0, 0)
    }
    return next.toISOString()
  }
  
  return 'Unknown'
}
