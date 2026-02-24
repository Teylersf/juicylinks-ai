import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

export const STRIPE_PLANS = {
  STARTER: {
    productId: process.env.STRIPE_STARTER_PRODUCT_ID!,
    name: 'Starter',
    price: 49,
    description: 'Great for small businesses',
    features: [
      '1 business/website/app',
      'Daily submissions to all AIs',
      'Custom prompt creation',
      'Advanced analytics',
      'Priority email support',
      'Performance tracking'
    ],
    businesses: 1,
    additionalBusinessPrice: 49
  },
  GROWTH: {
    productId: process.env.STRIPE_GROWTH_PRODUCT_ID!,
    name: 'Growth',
    price: 79,
    description: 'Perfect for growing companies',
    features: [
      '5 businesses/websites/apps',
      'Daily submissions to all AIs',
      'Custom prompt creation',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Dedicated account manager'
    ],
    businesses: 5,
    additionalBusinessPrice: 19
  }
} as const

export type StripePlan = keyof typeof STRIPE_PLANS

export async function createCheckoutSession({
  userId,
  email,
  plan,
  successUrl,
  cancelUrl,
}: {
  userId: string
  email: string
  plan: StripePlan
  successUrl: string
  cancelUrl: string
}) {
  const planConfig = STRIPE_PLANS[plan]
  
  // First, we need to get the price ID from Stripe
  const prices = await stripe.prices.list({
    product: planConfig.productId,
    active: true,
  })
  
  if (!prices.data.length) {
    throw new Error(`No active prices found for product ${planConfig.productId}`)
  }
  
  // Use the first active price (you might want to filter by recurring interval)
  const price = prices.data[0]
  
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true, // Enable promo code input on checkout page
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
  })
  
  return session
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  
  return session
}
