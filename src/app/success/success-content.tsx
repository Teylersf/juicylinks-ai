"use client"

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function SuccessPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)
  
  // Verify payment function that can be called multiple times
  const verifyPayment = useCallback(async (sessionId: string, isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true)
    } else {
      setStatus('loading')
    }
    
    try {
      console.log('🔍 Attempting payment verification with session:', sessionId)
      
      // First try the session-based verification
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Session verification successful')
        setStatus('success')
        setMessage(data.message || `Welcome to ${data.user.plan} plan!`)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
        return
      }
      
      console.log('⚠️ Session verification failed, trying subscription check:', data.error)
      
      // If session verification fails, try checking for existing subscription
      const subscriptionResponse = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      
      const subscriptionData = await subscriptionResponse.json()
      
      if (subscriptionData.success) {
        console.log('✅ Subscription check successful')
        setStatus('success')
        setMessage(subscriptionData.message || `Welcome to ${subscriptionData.user.plan} plan!`)
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        console.log('❌ Both verification methods failed')
        setStatus('error')
        setMessage(`Verification failed: ${data.error}. Subscription check: ${subscriptionData.error}`)
      }
      
    } catch (error) {
      console.error('❌ Payment verification error:', error)
      setStatus('error')
      setMessage('Failed to verify payment. This might be a temporary network issue.')
    } finally {
      if (isRetry) {
        setIsRetrying(false)
      }
    }
  }, [router])

  // Retry verification handler
  const handleRetryVerification = () => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifyPayment(sessionId, true)
    }
  }

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found in URL')
      return
    }
    
    verifyPayment(sessionId)
  }, [searchParams, verifyPayment])
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Processing Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we confirm your subscription...
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-green-800 dark:text-green-200 text-sm">
                Redirecting to your dashboard in a few seconds...
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard Now
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment Issue
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            
            {/* Retry Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                💡 If you just completed payment, try verifying again. Sometimes it takes a moment for Stripe to process.
              </p>
              <button
                onClick={handleRetryVerification}
                disabled={isRetrying}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking Payment...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment Verification
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Pricing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
