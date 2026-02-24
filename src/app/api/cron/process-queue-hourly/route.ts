import { NextRequest, NextResponse } from 'next/server'
import { PromptQueueManager } from '@/lib/queue/prompt-queue'

// Increase function timeout for long-running queue processing
export const maxDuration = 300 // 5 minutes (Vercel Pro allows up to 5 minutes)

export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Vercel cron triggered: Starting 4-hour prompt queue check...')
    
    const queueManager = PromptQueueManager.getInstance()
    
    // Only process if queue is not already running and queue is empty
    if (queueManager.isCurrentlyProcessing()) {
      console.log('Queue is already processing, skipping 4-hour check')
      return NextResponse.json({
        success: true,
        message: 'Queue is already processing',
        skipped: true
      })
    }

    const currentQueueLength = queueManager.getCurrentQueue().length
    if (currentQueueLength > 0) {
      console.log(`Queue has ${currentQueueLength} items, skipping 4-hour check`)
      return NextResponse.json({
        success: true,
        message: `Queue has ${currentQueueLength} items pending`,
        skipped: true,
        queueLength: currentQueueLength
      })
    }

    // Add any new prompts that might be due
    await queueManager.addPromptsToQueue()
    
    const newQueueLength = queueManager.getCurrentQueue().length
    if (newQueueLength > 0) {
      // Process the queue and AWAIT completion so logs are created before function terminates
      console.log(`4-hour check: Added ${newQueueLength} new prompts to queue, starting processing...`)
      await queueManager.processQueue()
      console.log('4-hour check: Processing completed')
    } else {
      console.log('4-hour check: No new prompts to process')
    }

    return NextResponse.json({
      success: true,
      message: newQueueLength > 0 ? '4-hour check: New prompts added and processing started' : '4-hour check: No new prompts',
      timestamp: new Date().toISOString(),
      queueLength: newQueueLength,
      processed: newQueueLength > 0
    })

  } catch (error) {
    console.error('Error in 4-hour cron job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
