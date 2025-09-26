import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { getModelStats } from '@/lib/utils/model-stats'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        businesses: {
          where: { isActive: true },
          select: { id: true, name: true, targetLLMs: true }
        }
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const isTrialActive = dbUser.isTrialActive && dbUser.trialEndsAt && now < dbUser.trialEndsAt
    const isSubscriptionActive = dbUser.isActive && dbUser.stripeSubscriptionId

    if (!isTrialActive && !isSubscriptionActive) {
      return NextResponse.json({
        hasNextRun: false,
        reason: 'no_active_subscription'
      })
    }

    // Calculate next run time based on user type
    let nextRunTime: Date
    let runType: string
    let interval: string

    if (isTrialActive && !isSubscriptionActive) {
      // Trial users: weekly runs
      if (dbUser.lastSubscriptionRunAt) {
        nextRunTime = new Date(dbUser.lastSubscriptionRunAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      } else {
        // If never run, next run is at next 9 AM UTC
        nextRunTime = getNext9AMUTC()
      }
      runType = 'Trial Run'
      interval = 'weekly'
    } else {
      // Paid users: daily runs at 9 AM UTC
      if (dbUser.lastSubscriptionRunAt) {
        const lastRunDate = new Date(dbUser.lastSubscriptionRunAt)
        
        // For daily runs: next run should be the day after the last run at 9 AM UTC
        const nextDay = new Date(lastRunDate)
        nextDay.setUTCDate(nextDay.getUTCDate() + 1)
        nextDay.setUTCHours(9, 0, 0, 0)
        
        // If that time has already passed, move to the next day
        while (nextDay <= now) {
          nextDay.setUTCDate(nextDay.getUTCDate() + 1)
        }
        
        nextRunTime = nextDay
      } else {
        // Never run, next run is at next 9 AM UTC
        nextRunTime = getNext9AMUTC()
      }
      runType = 'Subscription Run'
      interval = 'daily'
    }

    // Get user's businesses and calculate what will be processed
    const activeBusinesses = dbUser.businesses // Already filtered for isActive: true in query
    
    // Calculate user's selected models vs total available
    const modelStats = getModelStats()
    const totalAvailableModels = modelStats.totalModels
    
    // For subscription users, always use ALL available models
    // For trial users, also use ALL available models (since we changed the system)
    // Only credit-based manual runs should allow selective model choice
    const userSelectedModels = activeBusinesses.length > 0 ? totalAvailableModels : 0

    // Calculate time until next run
    const timeUntilRun = nextRunTime.getTime() - now.getTime()
    const hoursUntil = Math.floor(timeUntilRun / (1000 * 60 * 60))
    const minutesUntil = Math.floor((timeUntilRun % (1000 * 60 * 60)) / (1000 * 60))

    return NextResponse.json({
      hasNextRun: true,
      nextRunTime: nextRunTime.toISOString(),
      runType,
      interval,
      timeUntilRun: {
        hours: hoursUntil,
        minutes: minutesUntil,
        totalMs: timeUntilRun
      },
      debug: {
        lastRunTime: dbUser.lastSubscriptionRunAt?.toISOString() || null,
        currentTime: now.toISOString(),
        isTrialActive,
        isSubscriptionActive
      },
      preview: {
        businessCount: activeBusinesses.length,
        modelCount: userSelectedModels,
        totalAvailableModels: totalAvailableModels,
        businesses: activeBusinesses.map(b => ({
          name: b.name,
          models: b.targetLLMs.map(llm => llm.toString()) // Convert LLMProvider enum to string
        }))
      }
    })

  } catch (error) {
    console.error('Error getting next run info:', error)
    return NextResponse.json(
      { error: 'Failed to get next run info' },
      { status: 500 }
    )
  }
}

function getNext9AMUTC(daysFromNow = 0): Date {
  const now = new Date()
  const next9AM = new Date()
  
  // Set to 9 AM UTC
  next9AM.setUTCHours(9, 0, 0, 0)
  
  // Add days if specified
  if (daysFromNow > 0) {
    next9AM.setUTCDate(next9AM.getUTCDate() + daysFromNow)
  }
  
  // If 9 AM today has already passed, move to tomorrow
  if (daysFromNow === 0 && next9AM <= now) {
    next9AM.setUTCDate(next9AM.getUTCDate() + 1)
  }
  
  return next9AM
}
