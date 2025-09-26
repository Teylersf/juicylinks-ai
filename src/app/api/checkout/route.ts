import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, StripePlan } from '@/lib/stripe'
import { stackServerApp } from '@/stack'

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    
    // Get the current user
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!plan || !['STARTER', 'GROWTH'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    
    const session = await createCheckoutSession({
      userId: user.id,
      email: user.primaryEmail!,
      plan: plan as StripePlan,
      successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    })
    
    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
