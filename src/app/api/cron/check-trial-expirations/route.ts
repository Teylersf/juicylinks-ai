import { NextRequest, NextResponse } from 'next/server'
import { TrialExpirationService } from '@/lib/trial-expiration'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret provided')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting trial expiration check...')
    
    // Run the trial expiration check
    await TrialExpirationService.checkAndSendExpirationWarnings()
    
    console.log('Trial expiration check completed successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trial expiration check completed',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Trial expiration check failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Trial expiration check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
