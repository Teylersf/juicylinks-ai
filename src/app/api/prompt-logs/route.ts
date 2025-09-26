import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const businessId = searchParams.get('businessId')
    const provider = searchParams.get('provider')
    const status = searchParams.get('status')
    const dateRange = searchParams.get('dateRange')
    const isExport = searchParams.get('export') === 'true'

    // Build where clause
    const where = {
      business: {
        userId: user.id
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    if (search) {
      where.OR = [
        { promptText: { contains: search, mode: 'insensitive' } },
        { responseText: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (businessId) {
      where.businessId = businessId
    }

    if (provider) {
      where.llmProvider = provider
    }

    if (status) {
      where.wasSuccessful = status === 'success'
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStart, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = {
        gte: startDate
      }
    }

    if (isExport) {
      // Export all matching logs as CSV
      const logs = await prisma.promptLog.findMany({
        where,
        include: {
          business: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const csvHeaders = [
        'Date',
        'Business',
        'LLM Provider',
        'Model',
        'Prompt Type',
        'Trigger Type',
        'Status',
        'Cost (USD)',
        'Prompt',
        'Response',
        'Error'
      ].join(',')

      const csvRows = logs.map(log => [
        log.createdAt.toISOString(),
        `"${log.business?.name || 'N/A'}"`,
        log.llmProvider,
        log.model,
        log.promptType || 'RECOMMENDATION',
        log.triggerType || 'automatic',
        log.wasSuccessful ? 'Success' : 'Failed',
        log.cost ? (log.cost / 100).toFixed(4) : '0.0000',
        `"${log.promptText.replace(/"/g, '""')}"`,
        log.responseText ? `"${log.responseText.replace(/"/g, '""')}"` : '',
        log.errorMessage ? `"${log.errorMessage.replace(/"/g, '""')}"` : ''
      ].join(','))

      const csv = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="prompt-logs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Get total count for pagination
    const total = await prisma.promptLog.count({ where })

    // Get paginated logs
    const logs = await prisma.promptLog.findMany({
      where,
      include: {
        business: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const formattedLogs = logs.map(log => ({
      id: log.id,
      businessId: log.businessId,
      businessName: log.business?.name || 'N/A',
      llmProvider: log.llmProvider,
      model: log.model,
      promptType: log.promptType,
      triggerType: log.triggerType || 'automatic',
      promptSent: log.promptText,
      response: log.responseText,
      wasSuccessful: log.wasSuccessful,
      errorMessage: log.errorMessage,
      cost: log.cost,
      createdAt: log.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching prompt logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt logs' },
      { status: 500 }
    )
  }
}
