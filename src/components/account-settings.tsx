'use client'

import { useState } from 'react'
import { User, CreditCard, Shield, Activity, Trash2, Save, ArrowLeft, Mail, Calendar, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react'

interface CreditTransaction {
  id: string
  userId: string
  type: string
  amount: number
  balance: number
  description: string
  stripePaymentIntentId?: string | null
  stripePriceAmount?: number | null
  creditPackageSize?: number | null
  promptLogId?: string | null
  modelName?: string | null
  creditCost?: number | null
  metadata?: unknown
  createdAt: Date
  updatedAt: Date
}

interface SubscriptionHistory {
  id: string
  userId: string
  plan: string
  stripeEventId?: string | null
  eventType: string
  priceId?: string | null
  amount?: number | null
  currency: string
  periodStart?: Date | null
  periodEnd?: Date | null
  createdAt: Date
}

interface AccountSettingsProps {
  user: {
    id: string
    email: string
    name: string | null
    avatar: string | null
    plan: string
    isActive: boolean
    isTrialActive: boolean
    trialEndsAt: Date | null
    credits: number
    totalCreditsEarned: number
    totalCreditsSpent: number
    totalPromptsAllTime: number
    totalPromptsThisMonth: number
    stripeSubscriptionStatus: string | null
    stripeCurrentPeriodEnd: Date | null
    createdAt: Date
    businesses: { id: string; name: string }[]
    creditTransactions?: CreditTransaction[]
    subscriptionHistory?: SubscriptionHistory[]
  }
}

type TabType = 'profile' | 'subscription' | 'usage' | 'security'

export function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [name, setName] = useState(user.name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to open customer portal' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to open subscription management' })
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'STARTER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'GROWTH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'FREE_TRIAL':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'usage' as TabType, label: 'Usage & Credits', icon: Activity },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your account preferences and information
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Profile Information
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Avatar is managed by your authentication provider</p>
                        </div>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        />
                        <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Email changes must be done through your authentication provider
                      </p>
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Member Since
                      </label>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-5 w-5 mr-2" />
                        {formatDate(user.createdAt)}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving || name === user.name}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Subscription & Billing
                  </h2>

                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Current Plan
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Your subscription details
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPlanBadgeColor(user.plan)}`}>
                          {user.plan.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                            {user.isActive ? '✅ Active' : user.isTrialActive ? '🎉 Trial Active' : '❌ Inactive'}
                          </p>
                        </div>
                        {user.trialEndsAt && user.isTrialActive && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Trial Ends</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                              {formatDate(user.trialEndsAt)}
                            </p>
                          </div>
                        )}
                        {user.stripeCurrentPeriodEnd && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Next Billing Date</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                              {formatDate(user.stripeCurrentPeriodEnd)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Businesses</p>
                          <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                            {user.businesses.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Manage Subscription */}
                    <div>
                      <button
                        onClick={handleManageSubscription}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Manage Subscription & Billing
                      </button>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Update payment method, view invoices, or cancel subscription
                      </p>
                    </div>

                    {/* Upgrade Options */}
                    {user.plan === 'FREE_TRIAL' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          Upgrade Your Plan
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-400 mb-4">
                          Get unlimited daily submissions and advanced features
                        </p>
                        <button
                          onClick={() => window.location.href = '/pricing'}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Plans
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Usage & Credits Tab */}
              {activeTab === 'usage' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Usage & Credits
                  </h2>

                  <div className="space-y-6">
                    {/* Credits Overview */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Credit Balance
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Available credits for extra submissions
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {user.credits.toFixed(0)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">credits</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = '/pricing'}
                        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Buy More Credits
                      </button>
                    </div>

                    {/* Usage Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">All Time</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {user.totalPromptsAllTime}
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Total submissions
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {user.totalPromptsThisMonth}
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Monthly submissions
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Credits Spent</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                              {user.totalCreditsSpent.toFixed(0)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-purple-500" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Lifetime credits used
                        </p>
                      </div>
                    </div>

                    {/* View Logs Button */}
                    <div>
                      <button
                        onClick={() => window.location.href = '/dashboard/logs'}
                        className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        View Detailed Logs
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Security Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Password */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Password
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Password management is handled by your authentication provider
                          </p>
                        </div>
                        <Shield className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Account Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Account Active</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Email Verified</span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
                      <div className="flex items-start">
                        <Trash2 className="h-6 w-6 text-red-600 mr-3 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                            Delete Account
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                alert('Account deletion feature - contact support at admin@juicylinks.ai')
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

