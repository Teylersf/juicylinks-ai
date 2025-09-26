import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'

// Type for Stripe subscription with period fields
interface StripeSubscriptionWithPeriods extends Stripe.Subscription {
  current_period_end: number
  current_period_start: number
}

// Type for Stripe invoice with payment intent
interface StripeInvoiceWithPaymentIntent extends Stripe.Invoice {
  payment_intent?: string
}

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }
    
    // Get the current user
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    console.log('🔍 Verifying payment for user:', user.id, 'session:', sessionId)
    
    // Retrieve the checkout session from Stripe with all related data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'payment_intent']
    })
    
    console.log('📄 Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription ? 'present' : 'missing'
    })
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${session.payment_status}` },
        { status: 400 }
      )
    }
    
    // Get customer and subscription details
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'No customer ID found in session' },
        { status: 400 }
      )
    }
    
    // Get full customer details from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    
    console.log('👤 Customer details:', {
      id: customer.id,
      email: customer.email,
      created: customer.created
    })
    
    // Verify customer email matches user email
    if (customer.email !== user.primaryEmail) {
      return NextResponse.json(
        { error: `Email mismatch. Customer: ${customer.email}, User: ${user.primaryEmail}` },
        { status: 403 }
      )
    }
    
    let subscription: StripeSubscriptionWithPeriods | null = null
    let plan = 'STARTER' // Default
    
    if (subscriptionId) {
      // Get full subscription details
      const retrievedSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      subscription = retrievedSubscription as unknown as StripeSubscriptionWithPeriods
      
      console.log('💳 Subscription details:', {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        items: subscription.items.data.length,
        raw_subscription: JSON.stringify(subscription, null, 2)
      })
      
      // Determine plan from price ID
      const priceId = subscription.items.data[0]?.price.id
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) {
        plan = 'STARTER'
      } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID) {
        plan = 'GROWTH'
      }
      
      console.log('📋 Determined plan:', plan, 'from price:', priceId)
    } else {
      // Handle one-time payments or other scenarios
      console.log('⚠️ No subscription found, treating as STARTER plan')
    }
    
    // Check if user already exists and update, or create new user
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    
    const userData = {
      email: user.primaryEmail!,
      name: user.displayName,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: subscription?.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: subscription && subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      stripeCurrentPeriodStart: subscription && subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
      stripeSubscriptionStatus: subscription?.status || 'active',
      stripeLastPaymentDate: new Date(),
      stripeNextPaymentDate: subscription && subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      plan: plan as 'FREE_TRIAL' | 'STARTER' | 'GROWTH' | 'ENTERPRISE',
      planStartDate: new Date(),
      isTrialActive: false,
      isActive: true,
    }
    
    let updatedUser
    
    if (existingUser) {
      console.log('🔄 Updating existing user:', user.id)
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: userData
      })
    } else {
      console.log('➕ Creating new user:', user.id)
      updatedUser = await prisma.user.create({
        data: {
          id: user.id,
          ...userData
        }
      })
    }
    
    // Create subscription history record
    if (subscription) {
      await prisma.subscriptionHistory.create({
        data: {
          userId: user.id,
          plan: plan as 'FREE_TRIAL' | 'STARTER' | 'GROWTH' | 'ENTERPRISE',
          stripeEventId: session.id,
          eventType: 'subscription_created',
          priceId: subscription.items.data[0]?.price.id,
          amount: subscription.items.data[0]?.price.unit_amount,
          currency: subscription.currency,
          periodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
          periodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(),
        },
      })
    }
    
    // Create invoice record if available
    if (session.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(session.invoice as string) as StripeInvoiceWithPaymentIntent
        
        await prisma.invoice.create({
          data: {
            userId: user.id,
            stripeInvoiceId: invoice.id || '',
            stripePaymentIntentId: invoice.payment_intent || '',
            amount: invoice.amount_paid || 0,
            currency: invoice.currency || 'usd',
            status: 'PAID',
            invoiceDate: new Date(invoice.created * 1000),
            paidAt: new Date(),
          },
        })
      } catch (invoiceError) {
        console.log('⚠️ Could not create invoice record:', invoiceError)
        // Don't fail the whole process for invoice issues
      }
    }
    
    console.log('✅ Payment verification successful for user:', user.id, 'plan:', plan)
    
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
      message: `Successfully activated ${plan} plan!`
    })
    
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to verify payment'
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