"use client"

import { useState, useEffect } from 'react'
import { CreditCard, Plus, TrendingUp, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { CreditPurchaseModal } from './credit-purchase-modal'
import { formatCredits } from '../lib/constants/credit-system'

interface CreditStats {
  currentBalance: number
  totalSpent: number
}

interface CreditTransaction {
  id: string
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS' | 'ADJUSTMENT'
  amount: number
  balance: number
  description: string
  createdAt: string
  modelName?: string
  creditCost?: number
}

export function CreditBalanceWidget() {
  const [stats, setStats] = useState<CreditStats | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)

  useEffect(() => {
    fetchCreditData()
  }, [])

  const fetchCreditData = async () => {
    try {
      const response = await fetch('/api/credits/balance')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setTransactions(data.recentTransactions)
      }
    } catch (error) {
      console.error('Failed to fetch credit data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
  }

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) {
      return 'text-green-600 dark:text-green-400'
    } else {
      return 'text-red-600 dark:text-red-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load credit information
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Credit Balance
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Pay-per-use AI model submissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>Buy Credits</span>
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Current Balance */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Current Balance
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCredits(stats.currentBalance)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                credits available
              </div>
            </div>

            {/* Total Spent */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Spent
                </span>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCredits(stats.totalSpent)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                credits used
              </div>
            </div>
          </div>

        </div>

        {/* Recent Transactions */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Recent Transactions
              </h4>
              <button
                onClick={() => setShowTransactions(!showTransactions)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {showTransactions ? 'Hide' : 'View All'}
              </button>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, showTransactions ? 10 : 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type, transaction.amount)}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCredits(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Balance: {formatCredits(transaction.balance)}
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Benefits & Recommendations */}
        <div className="border-t border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Maximize Your AI Training Results
              </h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                <p>
                  <strong>✅ Your Plan Includes:</strong> 1 automatic submission per day to all AI models (runs automatically each day)
                </p>
                <p>
                  <strong>🚀 Want Higher Rankings?</strong> We recommend <span className="font-semibold">multiple submissions per day</span> for maximum AI training impact. More submissions = better visibility in future AI recommendations!
                </p>
                <p>
                  <strong>💳 Credits Give You Control:</strong> Purchase credits to trigger additional submissions whenever you want, targeting specific models for your business needs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Balance Warning */}
        {stats.currentBalance < 10 && (
          <div className="border-t border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                Low Credit Balance
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              You have {formatCredits(stats.currentBalance)} credits remaining. Consider purchasing more credits to continue using AI models.
            </p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false)
          fetchCreditData() // Refresh data when modal closes
        }}
        currentBalance={stats.currentBalance}
      />
    </>
  )
}
