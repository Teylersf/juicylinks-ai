import { Suspense } from 'react'
import { Metadata } from 'next'
import SuccessPageContent from './success-content'

export const metadata: Metadata = {
  title: 'Payment Successful - Juicy Links',
  description: 'Your subscription has been activated successfully.',
  robots: 'noindex, nofollow',
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
