"use client"

import { useState, useEffect, useCallback } from 'react'

export interface DashboardStats {
  totalPrompts: number
  thisMonthPrompts: number
  lastPromptDate: string | null
  successfulPrompts: number
  failedPrompts: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch dashboard stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(fetchStats, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  }
}
