"use client"

import { 
  Building2, 
  Zap, 
  TrendingUp, 
  Calendar, 
  Settings,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wand2
} from 'lucide-react'
import { User, Business, PromptLog, SubscriptionHistory } from '@prisma/client'
import { QueueStatus } from './queue-status'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { openCustomerPortal } from '@/lib/upgrade-utils'
import { usePlanSelection } from '@/hooks/use-plan-selection'
import { PlanSelectionModal } from './plan-selection-modal'
import { EnhancedRecentActivity } from './enhanced-recent-activity'
import { CreditBalanceWidget } from './credit-balance-widget'
import { CreditPurchaseHandler } from './credit-purchase-handler-simple'

type DashboardUser = User & {
  businesses: Business[]
  promptLogs: (PromptLog & { business: Business })[]
  subscriptionHistory: SubscriptionHistory[]
}

interface DashboardContentProps {
  user: DashboardUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  const { stats } = useDashboardStats()
  const { isModalOpen, openPlanSelection, closePlanSelection } = usePlanSelection()
  
  const isTrialActive = user.isTrialActive && user.trialEndsAt && new Date() < user.trialEndsAt
  const isSubscriptionActive = user.isActive && user.stripeSubscriptionId
  const hasAccess = isTrialActive || isSubscriptionActive
  
  const planLimits = {
    FREE_TRIAL: { businesses: 1, promptsPerWeek: 1 },
    STARTER: { businesses: 1, promptsPerDay: 1 },
    GROWTH: { businesses: 5, promptsPerDay: 1 },
    ENTERPRISE: { businesses: 100, promptsPerDay: 1 },
  }
  
  const currentLimits = planLimits[user.plan] || planLimits.FREE_TRIAL
  const businessesUsed = user.businesses.length
  const businessesRemaining = currentLimits.businesses - businessesUsed

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal()
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      alert(error instanceof Error ? error.message : 'Failed to open customer portal')
    }
  }

  const handleUpgrade = () => {
    openPlanSelection()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Handle credit purchase return from Stripe */}
      <CreditPurchaseHandler />
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name || 'User'}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
            Manage your AI SEO campaigns and track performance
          </p>
        </div>

        {/* Plan Status Banner */}
        <div className="mb-8">
          {!hasAccess ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Subscription Required
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Your trial has expired. Subscribe to continue using Juicy Links.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          ) : isTrialActive ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Free Trial Active
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Trial ends on {user.trialEndsAt?.toLocaleDateString()}. Upgrade to continue.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                >
                  Upgrade
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    {user.plan} Plan Active
                  </h3>
                </div>
                <button
                  onClick={handleManageSubscription}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  Manage
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.href = '/dashboard/logs'}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                View All Logs
              </button>
              {user.businesses.length > 0 && (
                <button
                  onClick={() => window.location.href = `/dashboard/businesses/${user.businesses[0].id}/prompts`}
                  className="flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Custom Prompts
                </button>
              )}
              {businessesRemaining > 0 && hasAccess && (
                <button
                  onClick={() => window.location.href = '/dashboard/businesses/add'}
                  className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Business
                </button>
              )}
              <button
                onClick={handleManageSubscription}
                className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/settings'}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                  Businesses
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {businessesUsed}/{currentLimits.businesses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                  Total Prompts
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalPrompts ?? user.totalPromptsAllTime}
                  {stats?.totalPrompts !== user.totalPromptsAllTime && stats?.totalPrompts && (
                    <span className="text-xs sm:text-sm text-green-600 ml-1 sm:ml-2 animate-pulse">●</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                  This Month
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.thisMonthPrompts ?? user.totalPromptsThisMonth}
                  {stats?.thisMonthPrompts !== user.totalPromptsThisMonth && stats?.thisMonthPrompts && (
                    <span className="text-xs sm:text-sm text-green-600 ml-1 sm:ml-2 animate-pulse">●</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-6 shadow-sm">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 flex-shrink-0" />
              <div className="ml-2 sm:ml-4 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                  Last Prompt
                </p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  {stats?.lastPromptDate 
                    ? new Date(stats.lastPromptDate).toLocaleDateString()
                    : user.lastPromptSentAt 
                    ? user.lastPromptSentAt.toLocaleDateString()
                    : 'Never'
                  }
                  {stats?.lastPromptDate && (
                    <span className="text-xs text-green-600 ml-1 sm:ml-2 animate-pulse">●</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Balance Widget */}
        <div className="mb-8">
          <CreditBalanceWidget />
        </div>

        {/* Recent Activity Summary - Show Value */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Recent AI Submissions
              </h2>
              <button
                onClick={() => window.location.href = '/dashboard/logs'}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors self-start sm:self-auto"
              >
                View All →
              </button>
            </div>
            
            {user.promptLogs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No AI submissions yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Your prompts will appear here once processed
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {user.promptLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        log.wasSuccessful ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {log.llmProvider}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleDateString()} • {log.wasSuccessful ? 'Success' : 'Failed'}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 max-w-[100px] truncate">
                      {log.business.name}
                    </div>
                  </div>
                ))}
                {user.promptLogs.length > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{user.promptLogs.length - 3} more submissions
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Queue Status - Smaller */}
        <div className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-4">
              <QueueStatus />
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity - Moved below queue */}
        <div className="mb-8">
          <EnhancedRecentActivity promptLogs={user.promptLogs.slice(0, 20)} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Businesses */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Businesses
                  </h2>
                  {businessesRemaining > 0 && hasAccess && (
                    <button 
                      onClick={() => window.location.href = '/dashboard/businesses/add'}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Business
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {user.businesses.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No businesses yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Add your first business to start training AI models
                    </p>
                    {hasAccess && (
                      <button 
                        onClick={() => window.location.href = '/dashboard/businesses/add'}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add Your First Business
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.businesses.map((business) => (
                      <div key={business.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {business.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {business.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {business.totalPromptsSent} prompts sent
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              business.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                            }`}>
                              {business.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button 
                              onClick={() => window.location.href = `/dashboard/businesses/${business.id}/prompts`}
                              className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
                              title="Configure prompts"
                            >
                              <Wand2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => window.location.href = `/dashboard/businesses/${business.id}/edit`}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Edit business"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={isModalOpen}
        onClose={closePlanSelection}
        title="Upgrade Your Account"
        subtitle="Choose the perfect plan for your business needs"
      />
    </div>
  )
}
