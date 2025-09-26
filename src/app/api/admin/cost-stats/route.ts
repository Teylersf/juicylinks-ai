import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CostStats {
  today: number
  week: number
  month: number
  year: number
  allTime: number
  totalCalls: number
  averageCostPerCall: number
  topModels: Array<{
    model: string
    provider: string
    totalCost: number
    callCount: number
  }>
  dailyBreakdown: Array<{
    date: string
    cost: number
    calls: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    try {
      verify(token, adminPassword)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Calculate date ranges
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Get all prompt logs with costs
    const allLogs = await prisma.promptLog.findMany({
      select: {
        id: true,
        cost: true,
        llmProvider: true,
        model: true,
        createdAt: true,
        wasSuccessful: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate costs for different time periods
    const todayCost = allLogs
      .filter(log => log.createdAt >= todayStart && log.cost)
      .reduce((sum, log) => sum + (log.cost || 0), 0)

    const weekCost = allLogs
      .filter(log => log.createdAt >= weekStart && log.cost)
      .reduce((sum, log) => sum + (log.cost || 0), 0)

    const monthCost = allLogs
      .filter(log => log.createdAt >= monthStart && log.cost)
      .reduce((sum, log) => sum + (log.cost || 0), 0)

    const yearCost = allLogs
      .filter(log => log.createdAt >= yearStart && log.cost)
      .reduce((sum, log) => sum + (log.cost || 0), 0)

    const allTimeCost = allLogs
      .filter(log => log.cost)
      .reduce((sum, log) => sum + (log.cost || 0), 0)

    const totalCalls = allLogs.length
    const averageCostPerCall = totalCalls > 0 ? allTimeCost / totalCalls : 0

    // Calculate top models by cost
    const modelStats = new Map<string, { cost: number; calls: number; provider: string }>()
    
    allLogs.forEach(log => {
      if (log.cost && log.model) {
        const key = `${log.llmProvider}-${log.model}`
        const existing = modelStats.get(key) || { cost: 0, calls: 0, provider: log.llmProvider }
        existing.cost += log.cost
        existing.calls += 1
        modelStats.set(key, existing)
      }
    })

    const topModels = Array.from(modelStats.entries())
      .map(([key, stats]) => ({
        model: key.split('-').slice(1).join('-'), // Remove provider prefix
        provider: stats.provider,
        totalCost: stats.cost,
        callCount: stats.calls
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 10)

    // Calculate daily breakdown for the last 30 days
    const dailyBreakdown: Array<{ date: string; cost: number; calls: number }> = []

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000)

      const dayLogs = allLogs.filter(log => 
        log.createdAt >= dateStart && log.createdAt < dateEnd
      )

      const dayCost = dayLogs
        .filter(log => log.cost)
        .reduce((sum, log) => sum + (log.cost || 0), 0)

      dailyBreakdown.push({
        date: dateStart.toISOString().split('T')[0],
        cost: dayCost,
        calls: dayLogs.length
      })
    }

    const stats: CostStats = {
      today: todayCost,
      week: weekCost,
      month: monthCost,
      year: yearCost,
      allTime: allTimeCost,
      totalCalls,
      averageCostPerCall,
      topModels,
      dailyBreakdown
    }

    return NextResponse.json({
      success: true,
      stats,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cost stats fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost statistics' },
      { status: 500 }
    )
  }
}
