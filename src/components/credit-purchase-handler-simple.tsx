"use client"

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function CreditPurchaseHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const creditsPurchased = searchParams.get('credits_purchased')
    const packageId = searchParams.get('package')
    const sessionId = searchParams.get('session_id')

    // Only process if we have the right parameters
    if (creditsPurchased === 'true' && packageId) {
      // Immediately clean up URL to prevent refresh loop
      const url = new URL(window.location.href)
      url.searchParams.delete('credits_purchased')
      url.searchParams.delete('package')
      url.searchParams.delete('session_id')
      router.replace(url.pathname + url.search)

      // Process the credit purchase
      processCreditPurchase(sessionId, packageId)
    }
  }, []) // Empty dependency array - only run once on mount

  const processCreditPurchase = async (sessionId: string | null, packageId: string) => {
    try {
      // Get session ID from URL or localStorage
      let actualSessionId = sessionId
      if (!actualSessionId) {
        actualSessionId = localStorage.getItem('credit_purchase_session_id')
      }

      if (!actualSessionId) {
        console.error('No session ID available for credit purchase processing')
        return
      }

      const response = await fetch('/api/credits/process-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: actualSessionId
        })
      })

      const data = await response.json()

      if (data.success) {
        console.log('Credits processed successfully:', data)
        
        // Clean up localStorage
        localStorage.removeItem('credit_purchase_session_id')
        
        // Show success message
        const creditsAdded = data.creditsAdded
        alert(`Success! ${creditsAdded} credits have been added to your account.`)
        
        // Refresh to update balance
        window.location.reload()
      } else {
        console.error('Failed to process credit purchase:', data.error)
        if (!data.alreadyProcessed) {
          alert('There was an issue processing your credit purchase. Please contact support.')
        }
      }
    } catch (error) {
      console.error('Error processing credit purchase:', error)
      alert('There was an issue processing your credit purchase. Please contact support.')
    }
  }

  return null
}
