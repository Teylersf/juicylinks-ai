import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

// Type for Stripe subscription with period fields
interface StripeSubscriptionWithPeriods extends Stripe.Subscription {
  current_period_end: number
  current_period_start: number
}

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Get the current user
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userEmail = email || user.primaryEmail
    
    console.log('🔍 Checking subscription for email:', userEmail)
    
    // Search for customers by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 10
    })
    
    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this email' },
        { status: 404 }
      )
    }
    
    // Get the most recent customer
    const customer = customers.data[0]
    console.log('👤 Found customer:', customer.id)
    
    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10
    })
    
    console.log('💳 Found subscriptions:', subscriptions.data.length)
    
    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    ) as unknown as StripeSubscriptionWithPeriods | undefined
    
    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Active subscription found:', activeSubscription.id)
    
    // Determine plan from price ID
    const priceId = activeSubscription.items.data[0]?.price.id
    let plan = 'STARTER'
    
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
      plan = 'STARTER'
    } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) {
      plan = 'GROWTH'
    }
    
    // Update user in database
    const userData = {
      email: userEmail,
      name: user.displayName,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: activeSubscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: activeSubscription.current_period_end ? new Date(activeSubscription.current_period_end * 1000) : null,
      stripeCurrentPeriodStart: activeSubscription.current_period_start ? new Date(activeSubscription.current_period_start * 1000) : null,
      stripeSubscriptionStatus: activeSubscription.status,
      stripeLastPaymentDate: new Date(),
      stripeNextPaymentDate: activeSubscription.current_period_end ? new Date(activeSubscription.current_period_end * 1000) : null,
      plan: plan as 'FREE_TRIAL' | 'STARTER' | 'GROWTH' | 'ENTERPRISE',
      planStartDate: new Date(),
      isTrialActive: false,
      isActive: true,
    }
    
    const updatedUser = await prisma.user.upsert({
      where: { id: user.id },
      update: userData,
      create: {
        id: user.id,
        ...userData
      }
    })
    
    console.log('✅ User updated successfully')
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        plan: updatedUser.plan,
        isActive: updatedUser.isActive,
        stripeCustomerId: updatedUser.stripeCustomerId,
        stripeSubscriptionId: updatedUser.stripeSubscriptionId,
        stripeCurrentPeriodEnd: updatedUser.stripeCurrentPeriodEnd,
        stripeSubscriptionStatus: updatedUser.stripeSubscriptionStatus,
      },
      subscription: {
        id: activeSubscription.id,
        status: activeSubscription.status,
        current_period_end: activeSubscription.current_period_end || 0,
        plan: plan
      },
      message: `Successfully found and activated ${plan} plan!`
    })
    
  } catch (error) {
    console.error('❌ Subscription check error:', error)
    
    let errorMessage = 'Failed to check subscription'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
