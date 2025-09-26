"use client"

import { useState, useEffect, useCallback } from 'react'

export interface QueueStatus {
  totalItems: number
  processingItem?: {
    id: string
    business: {
      name: string
    }
    llmProvider: string
    status: string
  }
}

export interface DetailedProgress {
  isProcessing: boolean
  currentBusiness?: string
  currentProvider?: string
  currentModel?: string
  completedProviders: string[]
  totalProviders: number
  progress: number // 0-100
  status: 'idle' | 'processing' | 'completed' | 'error'
  message: string
}

export function useQueueStatus() {
  const [status, setStatus] = useState<QueueStatus | null>(null)
  const [detailedProgress, setDetailedProgress] = useState<DetailedProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/queue/status')
      const data = await response.json()
      
      if (data.success) {
        // Only update if data has actually changed to prevent flickering
        setStatus(prevStatus => {
          const newStatus = data.status
          if (JSON.stringify(prevStatus) !== JSON.stringify(newStatus)) {
            return newStatus
          }
          return prevStatus
        })
        
        setDetailedProgress(prevProgress => {
          const newProgress = data.detailedProgress
          if (JSON.stringify(prevProgress) !== JSON.stringify(newProgress)) {
            return newProgress
          }
          return prevProgress
        })
        
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch queue status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const triggerQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/queue/trigger', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        // Refresh status after triggering
        await fetchStatus()
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }
    }
  }, [fetchStatus])

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Adaptive polling: faster when processing, slower when idle
    const setupPolling = () => {
      const interval = setInterval(() => {
        fetchStatus()
      }, detailedProgress?.isProcessing ? 1500 : 5000) // 1.5s when processing, 5s when idle
      
      return interval
    }

    const interval = setupPolling()

    return () => {
      clearInterval(interval)
    }
  }, [fetchStatus, detailedProgress?.isProcessing])

  return {
    status,
    detailedProgress,
    isLoading,
    error,
    refetch: fetchStatus,
    triggerQueue
  }
}
