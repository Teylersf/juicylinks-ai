import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { stackServerApp } from '@/stack'
import { PrismaClient } from '@prisma/client'
import { sendWelcomeEmail } from '@/lib/email'
import { TrialExpirationService } from '@/lib/trial-expiration'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get the current user
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user from database
    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })
    
    // Create user if doesn't exist (first time login)
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.primaryEmail!,
          name: user.displayName,
          plan: 'FREE_TRIAL',
          isTrialActive: true,
        },
      })
      
      // Set trial expiration using the service
      try {
        await TrialExpirationService.setTrialExpiration(user.id)
        console.log(`Trial expiration set for new user: ${user.id}`)
      } catch (trialError) {
        console.error(`Failed to set trial expiration for ${user.id}:`, trialError)
      }
      
      // Send welcome email to new trial user
      try {
        await sendWelcomeEmail(user.primaryEmail!, user.displayName || undefined)
        console.log(`Welcome email sent to new user: ${user.primaryEmail}`)
      } catch (emailError) {
        console.error(`Failed to send welcome email to ${user.primaryEmail}:`, emailError)
        // Don't throw - email failure shouldn't break user creation
      }
    }
    
    // If user has a Stripe subscription, check its current status
    if (dbUser.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(dbUser.stripeSubscriptionId)
        
        // Update user status based on Stripe subscription
        const isActive = subscription.status === 'active'
        const currentPeriodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000)
        
        if (dbUser.isActive !== isActive || 
            dbUser.stripeCurrentPeriodEnd?.getTime() !== currentPeriodEnd.getTime()) {
          
          dbUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              isActive,
              stripeCurrentPeriodEnd: currentPeriodEnd,
              // If subscription is canceled or past due, revert to trial
              plan: isActive ? dbUser.plan : 'FREE_TRIAL',
            },
          })
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
        // If we can't reach Stripe, use database values
      }
    }
    
    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        plan: dbUser.plan,
        isActive: dbUser.isActive,
        isTrialActive: dbUser.isTrialActive,
        trialEndsAt: dbUser.trialEndsAt,
        stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
        stripeCustomerId: dbUser.stripeCustomerId,
        totalPromptsAllTime: dbUser.totalPromptsAllTime,
        totalPromptsThisMonth: dbUser.totalPromptsThisMonth,
        lastPromptSentAt: dbUser.lastPromptSentAt,
      }
    })
    
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
