/**
 * Utility functions for handling user upgrades and Stripe checkout
 */

export type StripePlan = 'STARTER' | 'GROWTH'

/**
 * Initiates Stripe checkout for a given plan
 */
export async function initiateUpgrade(plan: StripePlan = 'STARTER'): Promise<void> {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    })
    
    const data = await response.json()
    
    if (data.url) {
      window.location.href = data.url
    } else {
      throw new Error(data.error || 'Failed to create checkout session')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    throw new Error('Failed to start checkout. Please try again.')
  }
}

/**
 * Opens Stripe customer portal for subscription management
 */
export async function openCustomerPortal(): Promise<void> {
  try {
    const response = await fetch('/api/customer-portal', {
      method: 'POST',
    })
    
    const data = await response.json()
    
    if (data.url) {
      window.location.href = data.url
    } else {
      throw new Error(data.error || 'Failed to open customer portal')
    }
  } catch (error) {
    console.error('Customer portal error:', error)
    throw new Error('Failed to open customer portal. Please try again.')
  }
}

import { getModelStats } from './utils/model-stats'

/**
 * Plan information for display purposes
 */
export function getPlanInfo() {
  const modelStats = getModelStats()
  
  return {
    STARTER: {
      name: 'Starter',
      description: 'Great for small businesses',
      price: 49,
      period: 'month',
      additionalBusinessPrice: 49,
      features: [
        '1 Business Profile',
        'Daily AI Prompts',
        `${modelStats.totalModels} LLM Models`,
        'Basic Analytics',
        'Email Support'
      ]
    },
    GROWTH: {
      name: 'Growth',
      description: 'Perfect for growing companies',
      price: 79,
      period: 'month',
      additionalBusinessPrice: 19,
      features: [
        '5 Business Profiles',
        'Daily AI Prompts',
        `${modelStats.totalModels} LLM Models`,
        'Advanced Analytics',
        'Priority Support',
        'Custom Prompts'
      ]
    }
  } as const
}

// Legacy export for backward compatibility
export const PLAN_INFO = getPlanInfo()
