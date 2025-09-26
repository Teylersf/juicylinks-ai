import { NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { CreditManager } from '@/lib/credits/credit-manager'

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get credit statistics
    const stats = await CreditManager.getCreditStats(user.id)
    
    // Get recent transaction history
    const recentTransactions = await CreditManager.getTransactionHistory(user.id, 10)

    return NextResponse.json({
      success: true,
      balance: stats.currentBalance,
      stats,
      recentTransactions
    })

  } catch (error) {
    console.error('Credit balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    )
  }
}
