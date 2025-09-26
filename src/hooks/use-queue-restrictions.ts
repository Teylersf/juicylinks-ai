"use client"

import { useState, useEffect, useCallback } from 'react'

export interface QueueRestrictions {
  canTriggerQueue: boolean
  reason: 'paid_user_available' | 'trial_available' | 'weekly_limit_reached' | 'daily_limit_reached' | 'credits_available' | 'no_access' | 'unknown'
  message: string
  isTrialUser: boolean
  daysUntilReset: number
  hoursUntilReset?: number
  lastRunAt?: string
  nextRunAt?: string
  hasCredits?: boolean
  creditBalance?: number
  requiresCredits?: boolean
}

export function useQueueRestrictions() {
  const [restrictions, setRestrictions] = useState<QueueRestrictions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestrictions = useCallback(async () => {
    try {
      const response = await fetch('/api/queue/restrictions')
      const data = await response.json()
      
      if (response.ok) {
        setRestrictions(data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch restrictions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestrictions()
    
    // Refresh restrictions every 30 seconds
    const interval = setInterval(fetchRestrictions, 30000)
    
    return () => clearInterval(interval)
  }, [fetchRestrictions])

  return {
    restrictions,
    isLoading,
    error,
    refetch: fetchRestrictions
  }
}
