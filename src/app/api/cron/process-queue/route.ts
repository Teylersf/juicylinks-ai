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
    console.log('Vercel cron triggered: Starting daily prompt queue processing...')
    
    const queueManager = PromptQueueManager.getInstance()
    
    // Check if already processing
    if (queueManager.isCurrentlyProcessing()) {
      console.log('Queue is already processing, skipping this cron run')
      return NextResponse.json({
        success: true,
        message: 'Queue is already processing',
        skipped: true
      })
    }

    // Add prompts to queue and process them
    await queueManager.addPromptsToQueue('automatic')
    
    const queueLength = queueManager.getCurrentQueue().length
    console.log(`Added ${queueLength} items to queue, starting processing...`)
    
    // Process the queue and AWAIT completion so logs are created before function terminates
    await queueManager.processQueue('automatic')

    console.log('Daily prompt queue processing completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Daily prompt queue processing completed',
      timestamp: new Date().toISOString(),
      itemsProcessed: queueLength
    })

  } catch (error) {
    console.error('Error in daily cron job:', error)
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
