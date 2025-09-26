import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { CreditManager } from '@/lib/credits/credit-manager'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isTrialActive = dbUser.isTrialActive && dbUser.trialEndsAt && new Date() < dbUser.trialEndsAt
    const isSubscriptionActive = dbUser.isActive && dbUser.stripeSubscriptionId
    const hasAccess = isTrialActive || isSubscriptionActive

    if (!hasAccess) {
      return NextResponse.json({
        canTriggerQueue: false,
        reason: 'no_access',
        message: 'Please upgrade to access queue features',
        isTrialUser: false,
        daysUntilReset: 0
      })
    }

    // For paid users, check daily restrictions based on plan
    if (isSubscriptionActive) {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Check if user has manually triggered queue today (manual triggers are still limited)
      // Note: This doesn't interfere with automatic subscription runs which use lastSubscriptionRunAt
      const hasRunToday = dbUser.lastQueueRunAt && dbUser.lastQueueRunAt > todayStart
      
      // Get user's credit balance
      const creditStats = await CreditManager.getCreditStats(user.id)
      const hasCredits = creditStats.currentBalance > 0
      
      if (hasRunToday) {
        // If they've used their daily limit but have credits, they can still trigger with credits
        if (hasCredits) {
          return NextResponse.json({
            canTriggerQueue: true,
            reason: 'credits_available',
            message: `Daily limit reached, but you can use credits (${creditStats.currentBalance} available)`,
            isTrialUser: false,
            hasCredits: true,
            creditBalance: creditStats.currentBalance,
            requiresCredits: true
          })
        }
        
        // Calculate hours until they can run again (next day)
        const tomorrow = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        const hoursUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / (60 * 60 * 1000))
        
        return NextResponse.json({
          canTriggerQueue: false,
          reason: 'daily_limit_reached',
          message: `${dbUser.plan} plan allows 1 queue run per day. Next available in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}`,
          isTrialUser: false,
          hoursUntilReset,
          lastRunAt: dbUser.lastQueueRunAt!.toISOString(),
          nextRunAt: tomorrow.toISOString(),
          hasCredits: false,
          creditBalance: creditStats.currentBalance
        })
      }

      return NextResponse.json({
        canTriggerQueue: true,
        reason: 'paid_user_available',
        message: `Queue available (${dbUser.plan} plan)`,
        isTrialUser: false,
        daysUntilReset: 0,
        hasCredits,
        creditBalance: creditStats.currentBalance,
        requiresCredits: false
      })
    }

    // For trial users, check weekly restrictions
    if (isTrialActive) {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Check if user has run queue in the last 7 days
      const hasRunThisWeek = dbUser.lastQueueRunAt && dbUser.lastQueueRunAt > oneWeekAgo
      
      if (hasRunThisWeek) {
        // Calculate days until they can run again
        const nextRunDate = new Date(dbUser.lastQueueRunAt!.getTime() + 7 * 24 * 60 * 60 * 1000)
        const daysUntilReset = Math.ceil((nextRunDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        
        return NextResponse.json({
          canTriggerQueue: false,
          reason: 'weekly_limit_reached',
          message: `Trial users can only run the queue once per week. Next available in ${daysUntilReset} day${daysUntilReset !== 1 ? 's' : ''}`,
          isTrialUser: true,
          daysUntilReset,
          lastRunAt: dbUser.lastQueueRunAt!.toISOString(),
          nextRunAt: nextRunDate.toISOString()
        })
      }

      return NextResponse.json({
        canTriggerQueue: true,
        reason: 'trial_available',
        message: 'Queue available (trial)',
        isTrialUser: true,
        daysUntilReset: 0
      })
    }

    return NextResponse.json({
      canTriggerQueue: false,
      reason: 'unknown',
      message: 'Access status unclear',
      isTrialUser: false,
      daysUntilReset: 0
    })

  } catch (error) {
    console.error('Error checking queue restrictions:', error)
    return NextResponse.json(
      { error: 'Failed to check queue restrictions' },
      { status: 500 }
    )
  }
}
