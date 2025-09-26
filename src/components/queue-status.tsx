"use client"

import { useQueueStatus } from '@/hooks/use-queue-status'
import { useQueueRestrictions } from '@/hooks/use-queue-restrictions'
import { Clock, Zap, Users, Play, CheckCircle, AlertCircle, Lock, Crown, Calendar, Timer, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePlanSelection } from '@/hooks/use-plan-selection'
import { PlanSelectionModal } from './plan-selection-modal'
import { ModelSelectionModal } from './model-selection-modal'

interface NextRunInfo {
  hasNextRun: boolean
  nextRunTime?: string
  runType?: string
  interval?: string
  timeUntilRun?: {
    hours: number
    minutes: number
    totalMs: number
  }
  debug?: {
    lastRunTime: string | null
    currentTime: string
    isTrialActive: boolean
    isSubscriptionActive: boolean
  }
  preview?: {
    businessCount: number
    modelCount: number
    totalAvailableModels?: number
    businesses: Array<{
      name: string
      models: string[]
    }>
  }
  reason?: string
}

export function QueueStatus() {
  const { status, detailedProgress, isLoading, error } = useQueueStatus()
  const { restrictions, isLoading: restrictionsLoading } = useQueueRestrictions()
  const [isTriggering, setIsTriggering] = useState(false)
  const [showModelSelection, setShowModelSelection] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  const [userBusinesses, setUserBusinesses] = useState<{ id: string; name: string }[]>([])
  const [nextRunInfo, setNextRunInfo] = useState<NextRunInfo | null>(null)
  const { isModalOpen, openPlanSelection, closePlanSelection } = usePlanSelection()

  // Fetch user credit data and next run info
  const fetchUserData = async () => {
    try {
      const [creditResponse, businessResponse, nextRunResponse] = await Promise.all([
        fetch('/api/credits/balance'),
        fetch('/api/businesses'),
        fetch('/api/queue/next-run')
      ])
      
      if (creditResponse.ok) {
        const creditData = await creditResponse.json()
        setUserCredits(creditData.balance || 0)
      }
      
      if (businessResponse.ok) {
        const businessData = await businessResponse.json()
        setUserBusinesses(businessData.businesses || [])
      }

      if (nextRunResponse.ok) {
        const nextRunData = await nextRunResponse.json()
        setNextRunInfo(nextRunData)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleUpgrade = () => {
    openPlanSelection()
  }

  const formatTimeUntilRun = (hours: number, minutes: number): string => {
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      const remainingHours = hours % 24
      return `${days}d ${remainingHours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const handleTriggerQueue = async () => {
    // Check if user has businesses
    if (userBusinesses.length === 0) {
      alert('Please add a business first before triggering the queue.')
      return
    }

    // For credit-based system, show model selection modal
    setShowModelSelection(true)
    return
  }

  const handleSelectiveQueueSubmit = async (selectedModels: { provider: string; models: string[] }[]) => {
    // Use the first business for now (could be enhanced to let user select)
    const businessId = userBusinesses[0]?.id
    
    if (!businessId) {
      alert('No business found')
      return
    }

    setIsTriggering(true)
    setShowModelSelection(false)
    
    try {
      const response = await fetch('/api/queue/trigger-selective', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedModels,
          businessId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Selective queue triggered successfully')
        // Refresh credit data and queue status instead of full page reload
        await Promise.all([
          fetchUserData(), // Refresh credits and businesses
          // Queue status will auto-refresh via polling
        ])
      } else {
        console.error('Failed to trigger selective queue:', result.error)
        alert(`Queue error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error triggering selective queue:', error)
      alert('Failed to trigger queue')
    } finally {
      setIsTriggering(false)
    }
  }

  // Removed unused handleLegacyTriggerQueue function

  // Add browser close warning when processing
  useEffect(() => {
    const isProcessing = detailedProgress?.isProcessing || false
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault()
        e.returnValue = 'Queue processing is in progress. Are you sure you want to leave?'
        return 'Queue processing is in progress. Are you sure you want to leave?'
      }
    }

    if (isProcessing) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [detailedProgress?.isProcessing])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Error loading queue status: {error}</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No queue data available</p>
        </div>
      </div>
    )
  }


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white flex items-center">
          <Zap className="h-4 w-4 mr-2 text-blue-600" />
          Prompt Queue Status
        </h3>
          {restrictions && !restrictions.canTriggerQueue ? (
            <div className="flex items-center space-x-2">
              <button
                disabled={true}
                className="bg-gray-400 text-gray-200 px-3 py-1 rounded-md text-sm cursor-not-allowed flex items-center"
              >
                <Lock className="h-4 w-4 mr-1" />
                Queue Locked
              </button>
              {restrictions.isTrialUser && (
                <button
                  onClick={handleUpgrade}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-md text-sm hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade Now
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleTriggerQueue}
              disabled={isTriggering || status.totalItems > 0 || restrictionsLoading}
              className={`px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                restrictions?.requiresCredits 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Play className="h-4 w-4 mr-1" />
              {isTriggering ? 'Triggering...' : restrictions?.requiresCredits ? 'Use Credits' : 'Trigger Queue'}
            </button>
          )}
      </div>

      <div className="space-y-3">
        {/* Restrictions Display */}
        {restrictions && (
          <div className={`rounded-lg p-3 border ${
            restrictions.canTriggerQueue 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {restrictions.canTriggerQueue ? (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                ) : (
                  <Lock className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    restrictions.canTriggerQueue 
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-amber-900 dark:text-amber-100'
                  }`}>
                    {restrictions.canTriggerQueue 
                      ? (restrictions.reason === 'credits_available' 
                          ? 'Credits Available' 
                          : restrictions.isTrialUser 
                            ? 'Free Trial Active' 
                            : 'Queue Available'
                        ) 
                      : (restrictions.reason === 'daily_limit_reached' ? 'Daily Limit Reached' : 'Weekly Limit Reached')
                    }
                  </p>
                  <p className={`text-xs ${
                    restrictions.canTriggerQueue 
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {restrictions.message}
                  </p>
                  {restrictions.reason === 'daily_limit_reached' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                      ✨ Don&apos;t worry! Your prompts will run automatically each day even if you don&apos;t trigger manually
                    </p>
                  )}
                </div>
              </div>
              
              {!restrictions.canTriggerQueue && (
                <div className="text-right">
                  <div className="flex items-center text-xs text-amber-700 dark:text-amber-300 mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {restrictions.reason === 'daily_limit_reached' 
                      ? `${restrictions.hoursUntilReset || 0} hour${(restrictions.hoursUntilReset || 0) !== 1 ? 's' : ''} left`
                      : `${restrictions.daysUntilReset} day${restrictions.daysUntilReset !== 1 ? 's' : ''} left`
                    }
                  </div>
                  {restrictions.isTrialUser && (
                    <button
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded text-xs hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Upgrade Benefits */}
            {restrictions.isTrialUser && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2 font-medium">
                  🚀 Upgrade to unlock:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <div>• Daily queue processing</div>
                  <div>• Up to 5 businesses</div>
                  <div>• Priority support</div>
                  <div>• Advanced analytics</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Progress Display */}
        {detailedProgress && detailedProgress.isProcessing && (
          <div className="mb-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Processing Progress
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {detailedProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${detailedProgress.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {detailedProgress.currentBusiness && detailedProgress.currentProvider
                      ? `${detailedProgress.currentProvider} • ${detailedProgress.currentBusiness}`
                      : 'Processing Queue'
                    }
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {detailedProgress.message}
                  </p>
                </div>
              </div>

              {/* Provider Progress */}
              {detailedProgress.currentProvider && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {['GROK', 'OPENAI', 'PERPLEXITY', 'GEMINI', 'CLAUDE'].map((provider) => {
                    const isCompleted = detailedProgress.completedProviders.includes(provider)
                    const isCurrent = detailedProgress.currentProvider === provider
                    
                    return (
                      <div
                        key={provider}
                        className={`text-center p-2 rounded-md text-xs font-medium transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : isCurrent
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 animate-pulse'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {isCompleted ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : isCurrent ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                        {provider}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    ⚠️ Do not close your browser while processing!
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Queue processing is in progress. Closing the browser may interrupt the process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed Status */}
        {detailedProgress && detailedProgress.status === 'completed' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Queue Processing Completed! 🎉
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {detailedProgress.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Queue Overview - Only show when items are in queue */}
        {status.totalItems > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {status.totalItems}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total in Queue
              </p>
            </div>
          </div>
        )}

        {/* Current Processing */}
        {status.processingItem && (
          <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-3"></div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Currently Processing
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {status.processingItem.business.name} - {status.processingItem.llmProvider}
                </p>
              </div>
              <div className="text-green-600">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Queue Status Messages */}
        {status.totalItems === 0 && !status.processingItem && (
          <div className="text-center py-4">
            {nextRunInfo?.hasNextRun ? (
              <div>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <Timer className="h-10 w-10 text-blue-600" />
                    <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                  </div>
                </div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Next {nextRunInfo.runType} Scheduled
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {nextRunInfo.timeUntilRun && formatTimeUntilRun(nextRunInfo.timeUntilRun.hours, nextRunInfo.timeUntilRun.minutes)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    {nextRunInfo.nextRunTime && new Date(nextRunInfo.nextRunTime).toLocaleString()}
                  </div>
                  {nextRunInfo.debug?.lastRunTime && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <span className="font-medium">Last run:</span> {new Date(nextRunInfo.debug.lastRunTime).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <div className="flex items-center justify-center space-x-4">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {nextRunInfo.preview?.businessCount} business{nextRunInfo.preview?.businessCount !== 1 ? 'es' : ''}
                    </span>
                    <span className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {(() => {
                        const selectedCount = nextRunInfo.preview?.modelCount || 0
                        const totalCount = nextRunInfo.preview?.totalAvailableModels || selectedCount
                        
                        if (selectedCount === totalCount) {
                          return `${totalCount} model${totalCount !== 1 ? 's' : ''}`
                        } else {
                          return `${selectedCount} of ${totalCount} models`
                        }
                      })()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {nextRunInfo.interval === 'daily' ? 'Runs daily at 9 AM UTC' : 'Runs weekly'}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Queue is Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs">
                  No prompts are currently queued for processing. Add a business and subscription to get started.
                </p>
              </div>
            )}
          </div>
        )}


        {/* Info Box */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            How it works:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Prompts are processed automatically based on your plan</li>
            <li>• Free trial: 1 prompt per week per business</li>
            <li>• Paid plans: 1 prompt per day per business</li>
            <li>• Processing happens with 1-second delays between each prompt</li>
            <li>• You&apos;ll see live updates as your prompts are processed</li>
          </ul>
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        isOpen={isModalOpen}
        onClose={closePlanSelection}
        title="Unlock Full Access"
        subtitle="Choose your plan to continue using all features"
      />

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={showModelSelection}
        onClose={() => setShowModelSelection(false)}
        onSubmit={handleSelectiveQueueSubmit}
        userCredits={userCredits}
        businessName={userBusinesses[0]?.name || 'Your Business'}
        businessId={userBusinesses[0]?.id || ''}
      />
    </div>
  )
}
