import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PromptScheduler } from '@/lib/cron/prompt-scheduler'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check restrictions directly
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isTrialActive = dbUser.isTrialActive && dbUser.trialEndsAt && new Date() < dbUser.trialEndsAt
    const isSubscriptionActive = dbUser.isActive && dbUser.stripeSubscriptionId
    const now = new Date()

    // For trial users, check weekly restrictions
    if (isTrialActive && !isSubscriptionActive) {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const hasRunThisWeek = dbUser.lastQueueRunAt && dbUser.lastQueueRunAt > oneWeekAgo
      
      if (hasRunThisWeek) {
        const nextRunDate = new Date(dbUser.lastQueueRunAt!.getTime() + 7 * 24 * 60 * 60 * 1000)
        const daysUntilReset = Math.ceil((nextRunDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        
        return NextResponse.json({
          success: false,
          error: `Trial users can only run the queue once per week. Next available in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}`,
          reason: 'weekly_limit_reached'
        }, { status: 403 })
      }
    }

    // For paid users, check daily restrictions for manual triggers
    if (isSubscriptionActive) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const hasRunToday = dbUser.lastQueueRunAt && dbUser.lastQueueRunAt > todayStart
      
      if (hasRunToday) {
        const tomorrow = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        const hoursUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / (60 * 60 * 1000))
        
        return NextResponse.json({
          success: false,
          error: `${dbUser.plan} plan allows 1 queue run per day. Next available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}`,
          reason: 'daily_limit_reached'
        }, { status: 403 })
      }
    }

    console.log('Manually triggering prompt queue processing...')
    
    // Update user's last queue run time
    if (isTrialActive && !isSubscriptionActive) {
      // Trial users: update weekly tracking
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastQueueRunAt: new Date(),
          weeklyQueueRunsUsed: { increment: 1 }
        }
      })
    } else if (isSubscriptionActive) {
      // Paid users: update daily tracking
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastQueueRunAt: new Date()
        }
      })
    }
    
    const scheduler = PromptScheduler.getInstance()
    await scheduler.triggerManualProcessing()
    
    return NextResponse.json({
      success: true,
      message: 'Manual prompt queue processing completed',
      isTrialUser: isTrialActive && !isSubscriptionActive
    })

  } catch (error) {
    console.error('Error triggering queue:', error)
    return NextResponse.json(
      { error: 'Failed to trigger queue processing' },
      { status: 500 }
    )
  }
}
