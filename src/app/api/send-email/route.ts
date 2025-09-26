import { NextRequest, NextResponse } from 'next/server'
import { 
  sendEmail, 
  sendWelcomeEmail, 
  sendSubscriptionConfirmationEmail,
  sendQueueProcessingNotification,
  sendTrialExpirationWarning,
  sendLowCreditWarning,
  sendCreditPurchaseConfirmation
} from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(data.userEmail, data.userName)
        break
        
      case 'subscription-confirmation':
        result = await sendSubscriptionConfirmationEmail(
          data.userEmail, 
          data.userName, 
          data.plan
        )
        break
        
      case 'queue-processing':
        result = await sendQueueProcessingNotification(
          data.userEmail,
          data.userName,
          data.results
        )
        break
        
      case 'trial-expiration':
        result = await sendTrialExpirationWarning(
          data.userEmail,
          data.userName,
          data.daysRemaining
        )
        break
        
      case 'low-credits':
        result = await sendLowCreditWarning(
          data.userEmail,
          data.userName,
          data.currentCredits,
          data.threshold
        )
        break
        
      case 'credit-purchase':
        result = await sendCreditPurchaseConfirmation(
          data.userEmail,
          data.userName,
          data.creditsAdded,
          data.amountPaid,
          data.newBalance
        )
        break
        
      case 'custom':
        result = await sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Email sent successfully' 
    })

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

