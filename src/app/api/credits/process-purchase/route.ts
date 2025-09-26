import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { stripe } from '@/lib/stripe'
import { CreditManager } from '@/lib/credits/credit-manager'
import { CREDIT_PACKAGES } from '@/lib/constants/credit-system'
import { CreditTransactionType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Check if this session has already been processed
    const existingTransaction = await prisma.creditTransaction.findFirst({
      where: {
        metadata: {
          path: ['stripeSessionId'],
          equals: sessionId
        }
      }
    })

    if (existingTransaction) {
      // Session already processed, return success with existing data
      const newBalance = await CreditManager.getUserCredits(user.id)
      return NextResponse.json({
        success: true,
        message: 'Credits already processed',
        newBalance,
        creditsAdded: existingTransaction.amount,
        alreadyProcessed: true
      })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Get the credit package details
    const packageId = session.metadata?.packageId
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId)

    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }

    // Add credits to user's account
    const transaction = await CreditManager.addCredits(
      user.id,
      creditPackage.credits,
      CreditTransactionType.PURCHASE,
      `Purchased ${creditPackage.name}`,
      {
        stripeSessionId: sessionId,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
        packageId: creditPackage.id,
        amountPaid: session.amount_total
      }
    )

    // Get updated balance
    const newBalance = await CreditManager.getUserCredits(user.id)

    // Send credit purchase confirmation email
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credit-purchase',
          userEmail: user.primaryEmail,
          userName: user.displayName,
          creditsAdded: creditPackage.credits,
          amountPaid: session.amount_total || 0,
          newBalance
        })
      })
      
      if (!response.ok) {
        console.error('Failed to send credit purchase confirmation email')
      }
    } catch (emailError) {
      console.error('Error sending credit purchase confirmation email:', emailError)
      // Don't fail the transaction if email fails
    }

    return NextResponse.json({
      success: true,
      transaction,
      newBalance,
      creditsAdded: creditPackage.credits
    })

  } catch (error) {
    console.error('Credit purchase processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process credit purchase' },
      { status: 500 }
    )
  }
}
