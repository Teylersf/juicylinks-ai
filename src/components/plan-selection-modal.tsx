"use client"

import { useState } from 'react'
import { X, Crown, Check, Zap, Building2, Users, Headphones } from 'lucide-react'
import { initiateUpgrade, PLAN_INFO, type StripePlan } from '@/lib/upgrade-utils'

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
}

export function PlanSelectionModal({ isOpen, onClose, title, subtitle }: PlanSelectionModalProps) {
  const [isUpgrading, setIsUpgrading] = useState<StripePlan | null>(null)

  if (!isOpen) return null

  const handleUpgrade = async (plan: StripePlan) => {
    setIsUpgrading(plan)
    try {
      await initiateUpgrade(plan)
    } catch (error) {
      console.error('Upgrade error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start upgrade process')
      setIsUpgrading(null)
    }
  }

  const plans = [
    {
      id: 'STARTER' as StripePlan,
      name: PLAN_INFO.STARTER.name,
      price: PLAN_INFO.STARTER.price,
      period: PLAN_INFO.STARTER.period,
      description: 'Perfect for small businesses getting started',
      popular: false,
      features: [
        '1 Business Profile',
        'Daily AI Prompts',
        '5 LLM Models (Grok, GPT-5, Gemini, Claude, Perplexity)',
        'Basic Analytics',
        'Email Support',
        'Custom Prompts'
      ],
      icon: <Building2 className="h-6 w-6" />,
      color: 'border-gray-200 dark:border-gray-700'
    },
    {
      id: 'GROWTH' as StripePlan,
      name: PLAN_INFO.GROWTH.name,
      price: PLAN_INFO.GROWTH.price,
      period: PLAN_INFO.GROWTH.period,
      description: 'Ideal for growing businesses with multiple locations',
      popular: true,
      features: [
        '5 Business Profiles',
        'Daily AI Prompts',
        '5 LLM Models (Grok, GPT-5, Gemini, Claude, Perplexity)',
        'Advanced Analytics',
        'Priority Support',
        'Custom Prompts',
        'Bulk Operations'
      ],
      icon: <Crown className="h-6 w-6" />,
      color: 'border-blue-500 ring-2 ring-blue-500'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title || 'Choose Your Plan'}
            </h2>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 ${plan.color} ${
                  plan.popular ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    plan.popular 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {plan.icon}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300 ml-1">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading === plan.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                        : 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50'
                    }`}
                  >
                    {isUpgrading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </button>

                  {/* Features */}
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      What&apos;s included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  30-day money-back guarantee
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Cancel anytime
                </div>
                <div className="flex items-center">
                  <Headphones className="h-4 w-4 mr-1" />
                  24/7 support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
