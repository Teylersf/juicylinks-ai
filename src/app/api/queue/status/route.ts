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
    const status = queueManager.getQueueStatusForUser(user.id)
    const detailedProgress = queueManager.getDetailedProgress()

    return NextResponse.json({
      success: true,
      status,
      detailedProgress
    })

  } catch (error) {
    console.error('Error getting queue status:', error)
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    )
  }
}
