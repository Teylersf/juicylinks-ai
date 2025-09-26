"use client"

import { useState } from 'react'
import { X, CreditCard, Zap, Star, ArrowRight } from 'lucide-react'
import { CREDIT_PACKAGES, formatPrice, formatCredits } from '../lib/constants/credit-system'

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
}

export function CreditPurchaseModal({ isOpen, onClose, currentBalance }: CreditPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>(CREDIT_PACKAGES[1].id) // Default to popular package
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage
        })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Store session ID for processing after return from Stripe
        if (data.sessionId) {
          localStorage.setItem('credit_purchase_session_id', data.sessionId)
        }
        
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Failed to initiate purchase')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedPkg = CREDIT_PACKAGES.find(pkg => pkg.id === selectedPackage)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Purchase Credits
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Current Balance: <strong>{formatCredits(currentBalance)} credits</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* How Credits Work */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-100 mb-2">
              💡 How Credits Work
            </h3>
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              Each AI model costs different credits: <strong>Economy models (0.5 credits)</strong>, <strong>Standard models (1 credit)</strong>, and <strong>Premium models (2 credits)</strong>. 
              Choose exactly which models to submit to and pay only for what you use!
            </p>
          </div>

          {/* Credit Packages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPackage === pkg.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                } ${pkg.popular ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <input
                      type="radio"
                      checked={selectedPackage === pkg.id}
                      onChange={() => setSelectedPackage(pkg.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-1">
                    {pkg.name}
                  </h3>
                  
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatPrice(pkg.price)}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {pkg.description}
                  </p>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {pkg.details}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCredits(pkg.credits)} Credits
                    </span>
                  </div>
                  
                  {/* Model cost examples */}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Economy models: 0.5 credits • Standard: 1 credit • Premium: 2 credits
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Package Summary */}
          {selectedPkg && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 mb-6">
              <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2">
                Purchase Summary
              </h4>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-300">Package:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedPkg.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-300">Credits:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCredits(selectedPkg.credits)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-300">Individual Submissions:</span>
                <span className="font-medium text-gray-900 dark:text-white text-right">{selectedPkg.description}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600 dark:text-gray-300">Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatPrice(selectedPkg.price)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-gray-900 dark:text-white">New Balance:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCredits(currentBalance + selectedPkg.credits)} credits
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* How Credits Work */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 How Credits Work
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <strong>Economy Models</strong> (0.5 credits): Fast, cost-effective responses</li>
              <li>• <strong>Standard Models</strong> (1 credit): Balanced performance and quality</li>
              <li>• <strong>Premium Models</strong> (2 credits): Advanced reasoning and capabilities</li>
              <li>• Credits never expire and can be used anytime</li>
              <li>• Choose exactly which models to submit to for maximum control</li>
            </ul>
          </div>
        </div>

        {/* Fixed Footer - Outside scrollable area */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="order-2 sm:order-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-center border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Cancel
            </button>
            
            <button
              onClick={handlePurchase}
              disabled={loading}
              className={`order-1 sm:order-2 flex items-center justify-center space-x-2 px-6 py-3 sm:py-2 rounded-lg font-medium text-sm sm:text-base ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>{loading ? 'Processing...' : `Purchase ${selectedPkg?.name || 'Credits'}`}</span>
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
