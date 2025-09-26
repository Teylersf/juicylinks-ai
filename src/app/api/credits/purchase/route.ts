import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { stripe } from '@/lib/stripe'
import { CREDIT_PACKAGES } from '@/lib/constants/credit-system'

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { packageId } = await request.json()

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId)
    if (!creditPackage) {
      return NextResponse.json({ error: 'Invalid credit package' }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.primaryEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: creditPackage.name,
              description: creditPackage.description,
              metadata: {
                type: 'credits',
                credits: creditPackage.credits.toString(),
                packageId: creditPackage.id
              }
            },
            unit_amount: creditPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_purchased=true&package=${packageId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_canceled=true`,
      metadata: {
        userId: user.id,
        type: 'credit_purchase',
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString()
      }
    })

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to create credit purchase session' },
      { status: 500 }
    )
  }
}
