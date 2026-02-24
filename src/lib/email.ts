/**
 * Email service using Resend API
 */

import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required')
}

if (!process.env.RESEND_FROM_EMAIL) {
  throw new Error('RESEND_FROM_EMAIL environment variable is required')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  // Ensure at least one of html or text is provided
  if (!options.html && !options.text) {
    throw new Error('Either html or text content must be provided')
  }

  try {
    // Create the base email data
    const baseEmailData = {
      from: options.from || process.env.RESEND_FROM_EMAIL!,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
    }

    // Add content based on what's available
    let emailData
    if (options.html && options.text) {
      emailData = { ...baseEmailData, html: options.html, text: options.text }
    } else if (options.html) {
      emailData = { ...baseEmailData, html: options.html }
    } else if (options.text) {
      emailData = { ...baseEmailData, text: options.text }
    } else {
      throw new Error('Either html or text content must be provided')
    }

    const { data, error } = await resend.emails.send(emailData)

    if (error) {
      console.error('Resend email error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

/**
 * Send welcome email to new trial users with upsell
 */
export async function sendWelcomeEmail(userEmail: string, userName?: string) {
  const subject = '🎉 Welcome to Juicy Links - Your FREE Trial is Active!'
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">🎉 Welcome to Juicy Links!</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p><strong>Congratulations!</strong> Your FREE 2-week trial is now active and you're ready to start training AI models to recommend your business.</p>
      
      <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">🆓 Your Trial Includes:</h3>
        <ul style="color: #1e40af; margin: 0;">
          <li>✅ 1 Business Profile</li>
          <li>✅ 1 Submission per week to ALL 5 AI models</li>
          <li>✅ Access to OpenAI, Claude, Gemini, Perplexity & Grok</li>
          <li>✅ Basic analytics and reporting</li>
        </ul>
      </div>
      
      <h2 style="color: #1f2937;">🚀 Quick Start Guide:</h2>
      <ol>
        <li><strong>Add Your Business:</strong> Set up your business profile with detailed information</li>
        <li><strong>Configure Prompts:</strong> Customize how we promote your business to AI models</li>
        <li><strong>Trigger Your First Queue:</strong> Send your business info to all 5 LLMs instantly!</li>
      </ol>
      
      <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #15803d; margin-top: 0;">💡 How It Works</h3>
        <p style="color: #166534; margin-bottom: 15px;">We send promotional prompts about your business to OpenAI, Claude, Gemini, Perplexity, and Grok. With data sharing enabled, these prompts train the next generation of AI models to know and recommend your business.</p>
        <p style="color: #15803d; font-weight: bold; margin: 0;">The more submissions = Higher success rate!</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
          🚀 Start Your Trial Now
        </a>
      </div>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">⚡ Want DAILY Submissions for Maximum Results?</h3>
        <p style="color: #92400e; margin-bottom: 15px;">Trial users get 1 submission per week, but our paid members get DAILY submissions to all AI models!</p>
        
        <div style="display: flex; gap: 15px; margin-top: 15px;">
          <div style="flex: 1; background: white; padding: 15px; border-radius: 6px;">
            <h4 style="color: #1f2937; margin: 0 0 10px 0;">Starter - $49/month</h4>
            <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>DAILY submissions (7x more than trial!)</li>
              <li>1 Business Profile</li>
              <li>Advanced Analytics</li>
            </ul>
          </div>
          <div style="flex: 1; background: white; padding: 15px; border-radius: 6px; border: 2px solid #16a34a;">
            <h4 style="color: #15803d; margin: 0 0 10px 0;">Growth - $79/month ⭐</h4>
            <ul style="color: #166534; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>DAILY submissions (7x more than trial!)</li>
              <li>5 Business Profiles</li>
              <li>Priority Support</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
             style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Upgrade for Daily Submissions →
          </a>
        </div>
      </div>
      
      <p><strong>Questions?</strong> Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/how-it-works" style="color: #2563eb;">How It Works</a> page.</p>
      
      <p>Ready to dominate AI recommendations?<br><strong>The Juicy Links Team</strong></p>
    </div>
  `
  
  const text = `
Welcome to Juicy Links!

Hi${userName ? ` ${userName}` : ''},

Welcome to Juicy Links! You're now ready to start training AI models to recommend your business.

What's Next?
1. Add Your Business: Set up your business profile with detailed information
2. Configure Prompts: Customize how we promote your business to AI models  
3. Start Training: Begin sending prompts to all major LLMs

How It Works:
We send promotional prompts about your business to OpenAI, Claude, Gemini, Perplexity, and Grok. With data sharing enabled, these prompts train the next generation of AI models to know and recommend your business.

Get started: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Questions? Reply to this email or visit: ${process.env.NEXT_PUBLIC_APP_URL}/how-it-works

Best regards,
The Juicy Links Team
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}

/**
 * Send low credit warning email
 */
export async function sendLowCreditWarning(
  userEmail: string,
  userName: string | undefined,
  currentCredits: number
) {
  const subject = `⚠️ Low Credits Alert - Only ${currentCredits} Credits Remaining`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ea580c;">⚠️ Low Credits Alert</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Your credit balance is running low. You currently have <strong>${currentCredits} credits</strong> remaining.</p>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">🔋 Running Low on Credits</h3>
        <p style="color: #92400e; margin-bottom: 15px;">Credits are used for manual AI submissions beyond your plan's included daily submissions.</p>
        <p style="color: #92400e; margin-bottom: 0;"><strong>Tip:</strong> Your paid plan includes automatic daily submissions at no extra cost!</p>
      </div>
      
      <h2 style="color: #1f2937;">💳 Buy More Credits</h2>
      <p>Purchase additional credits to continue making manual submissions whenever you want:</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 20px 0;">
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
          <h4 style="color: #1f2937; margin: 0 0 5px 0;">Starter Pack</h4>
          <p style="color: #2563eb; font-size: 18px; font-weight: bold; margin: 5px 0;">$10</p>
          <p style="color: #4b5563; font-size: 12px; margin: 0;">50-200 submissions</p>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #16a34a;">
          <h4 style="color: #15803d; margin: 0 0 5px 0;">Popular</h4>
          <p style="color: #16a34a; font-size: 18px; font-weight: bold; margin: 5px 0;">$20</p>
          <p style="color: #166534; font-size: 12px; margin: 0;">100-400 submissions</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
          <h4 style="color: #1f2937; margin: 0 0 5px 0;">Power Pack</h4>
          <p style="color: #2563eb; font-size: 18px; font-weight: bold; margin: 5px 0;">$50</p>
          <p style="color: #4b5563; font-size: 12px; margin: 0;">250-1000 submissions</p>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          💳 Buy Credits Now
        </a>
      </div>
      
      <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #1e40af; margin-top: 0;">💡 Remember:</h4>
        <ul style="color: #1e40af; margin: 0; font-size: 14px;">
          <li>Your plan includes automatic daily submissions (no credits needed)</li>
          <li>Credits are only for additional manual submissions</li>
          <li>More submissions = higher AI recommendation success</li>
        </ul>
      </div>
      
      <p>Questions? Reply to this email and we'll help you out!</p>
      
      <p>Best regards,<br><strong>The Juicy Links Team</strong></p>
    </div>
  `
  
  const text = `
Low Credits Alert

Hi${userName ? ` ${userName}` : ''},

Your credit balance is running low. You currently have ${currentCredits} credits remaining.

Credits are used for manual AI submissions beyond your plan's included daily submissions.

Buy more credits at: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Remember: Your plan includes automatic daily submissions at no extra cost!

Best regards,
The Juicy Links Team
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}

/**
 * Send trial expiring in 3 days warning email
 */
export async function sendTrialExpiring3Days(
  userEmail: string,
  userName: string | undefined,
  expirationDate: string
) {
  const subject = `⚠️ Your Juicy Links trial expires in 3 days`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ea580c;">⚠️ Trial Expiring Soon</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Your <strong>Juicy Links free trial</strong> expires in just <strong>3 days</strong> on <strong>${expirationDate}</strong>.</p>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">🚀 Don't Lose Your AI SEO Progress!</h3>
        <p style="color: #92400e; margin-bottom: 15px;">You've started building your presence in AI models. Keep the momentum going!</p>
        <p style="color: #92400e; margin-bottom: 0;"><strong>Upgrade now</strong> to continue getting recommended by AI platforms.</p>
      </div>
      
      <h2 style="color: #1f2937;">🎯 What You'll Keep With a Paid Plan:</h2>
      <ul style="color: #374151; line-height: 1.6;">
        <li><strong>Daily AI Submissions</strong> - Automatic submissions to all 22 AI models</li>
        <li><strong>Business Profile Management</strong> - Multiple businesses and custom prompts</li>
        <li><strong>Performance Analytics</strong> - Track your AI recommendation success</li>
        <li><strong>Priority Support</strong> - Get help when you need it</li>
      </ul>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #1e40af; margin-top: 0;">💰 Special Offer - Save 20%</h3>
        <p style="color: #1e40af; margin-bottom: 15px;">Upgrade before your trial expires and save 20% on your first month!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=TRIAL20" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Upgrade Now & Save 20%
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #2563eb;">contact page</a>.
      </p>
    </div>
  `
  
  const text = `
Hi${userName ? ` ${userName}` : ''},

Your Juicy Links free trial expires in just 3 days on ${expirationDate}.

Don't lose your AI SEO progress! You've started building your presence in AI models - keep the momentum going by upgrading to a paid plan.

What you'll keep with a paid plan:
- Daily AI Submissions - Automatic submissions to all 22 AI models
- Business Profile Management - Multiple businesses and custom prompts  
- Performance Analytics - Track your AI recommendation success
- Priority Support - Get help when you need it

Special Offer - Save 20%
Upgrade before your trial expires and save 20% on your first month!

Upgrade now: ${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=TRIAL20

Questions? Reply to this email or contact us at ${process.env.NEXT_PUBLIC_APP_URL}/contact

Best regards,
The Juicy Links Team
  `

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
    to: userEmail,
    subject,
    html,
    text
  })
}

/**
 * Send trial expiring in 1 day warning email
 */
export async function sendTrialExpiring1Day(
  userEmail: string,
  userName: string | undefined,
  expirationDate: string
) {
  const subject = `🚨 Your Juicy Links trial expires TOMORROW`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">🚨 Trial Expires Tomorrow!</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p><strong>URGENT:</strong> Your Juicy Links free trial expires <strong>TOMORROW (${expirationDate})</strong>.</p>
      
      <div style="background: #fee2e2; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #991b1b; margin-top: 0;">⏰ Last Chance to Upgrade!</h3>
        <p style="color: #991b1b; margin-bottom: 15px;">After tomorrow, you'll lose access to:</p>
        <ul style="color: #991b1b; margin-bottom: 0;">
          <li>Daily AI model submissions</li>
          <li>Business profile management</li>
          <li>Performance analytics</li>
          <li>All your progress data</li>
        </ul>
      </div>
      
      <h2 style="color: #1f2937;">🎯 Upgrade in 2 Minutes:</h2>
      <ol style="color: #374151; line-height: 1.8;">
        <li>Choose your plan (Starter $49/month or Growth $99/month)</li>
        <li>Enter payment details</li>
        <li>Keep all your data and continue growing</li>
      </ol>
      
      <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #166534; margin-top: 0;">💎 FINAL OFFER - 25% OFF</h3>
        <p style="color: #166534; margin-bottom: 15px;">Last chance! Upgrade now and get 25% off your first month.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=LASTCHANCE25" 
           style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
          🚀 Upgrade Now - 25% OFF
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Need help? Reply to this email immediately or call our priority line.
      </p>
    </div>
  `
  
  const text = `
URGENT: Your Juicy Links trial expires TOMORROW (${expirationDate})!

Hi${userName ? ` ${userName}` : ''},

This is your final warning - your free trial ends tomorrow.

After tomorrow, you'll lose access to:
- Daily AI model submissions
- Business profile management  
- Performance analytics
- All your progress data

FINAL OFFER - 25% OFF
Last chance! Upgrade now and get 25% off your first month.

Upgrade immediately: ${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=LASTCHANCE25

Need help? Reply to this email immediately.

The Juicy Links Team
  `

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
    to: userEmail,
    subject,
    html,
    text
  })
}

/**
 * Send trial expired notification email
 */
export async function sendTrialExpired(
  userEmail: string,
  userName: string | undefined
) {
  const subject = `Your Juicy Links trial has expired - Upgrade to continue`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6b7280;">Your Trial Has Expired</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Your Juicy Links free trial has expired. Your account is now inactive, but <strong>all your data is safely stored</strong> and ready for when you upgrade.</p>
      
      <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0;">
        <h3 style="color: #374151; margin-top: 0;">📊 Your Progress is Saved</h3>
        <p style="color: #374151; margin-bottom: 15px;">Don't worry - we've kept all your:</p>
        <ul style="color: #374151; margin-bottom: 0;">
          <li>Business profiles and settings</li>
          <li>Custom prompts and configurations</li>
          <li>Performance analytics and logs</li>
          <li>Account preferences</li>
        </ul>
      </div>
      
      <h2 style="color: #1f2937;">🚀 Ready to Continue?</h2>
      <p style="color: #374151;">Upgrade to any paid plan and immediately regain access to:</p>
      <ul style="color: #374151; line-height: 1.6;">
        <li><strong>Daily AI Submissions</strong> - Resume getting recommended by AI</li>
        <li><strong>All Your Data</strong> - Pick up exactly where you left off</li>
        <li><strong>Advanced Features</strong> - Multiple businesses, custom prompts, analytics</li>
        <li><strong>Priority Support</strong> - Get help when you need it</li>
      </ul>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #1e40af; margin-top: 0;">💰 Welcome Back Offer</h3>
        <p style="color: #1e40af; margin-bottom: 15px;">Upgrade within 7 days and get your first month for just $1!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=WELCOME1" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Upgrade for $1
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Questions about upgrading? <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #2563eb;">Contact our team</a> - we're here to help!
      </p>
    </div>
  `
  
  const text = `
Hi${userName ? ` ${userName}` : ''},

Your Juicy Links free trial has expired. Your account is now inactive, but all your data is safely stored and ready for when you upgrade.

Your Progress is Saved
Don't worry - we've kept all your:
- Business profiles and settings
- Custom prompts and configurations  
- Performance analytics and logs
- Account preferences

Ready to Continue?
Upgrade to any paid plan and immediately regain access to:
- Daily AI Submissions - Resume getting recommended by AI
- All Your Data - Pick up exactly where you left off
- Advanced Features - Multiple businesses, custom prompts, analytics
- Priority Support - Get help when you need it

Welcome Back Offer
Upgrade within 7 days and get your first month for just $1!

Upgrade now: ${process.env.NEXT_PUBLIC_APP_URL}/pricing?discount=WELCOME1

Questions? Contact us at ${process.env.NEXT_PUBLIC_APP_URL}/contact

The Juicy Links Team
  `

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
    to: userEmail,
    subject,
    html,
    text
  })
}

/**
 * Send credit purchase confirmation email
 */
export async function sendCreditPurchaseConfirmation(
  userEmail: string,
  userName: string | undefined,
  creditsAdded: number,
  amountPaid: number,
  newBalance: number
) {
  const subject = `✅ Credit Purchase Confirmed - ${creditsAdded} Credits Added`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">✅ Credit Purchase Confirmed!</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Your credit purchase has been successfully processed. Thank you for your purchase!</p>
      
      <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #15803d; margin-top: 0;">💳 Purchase Details</h3>
        <div style="color: #166534;">
          <p style="margin: 5px 0;"><strong>Credits Added:</strong> ${creditsAdded}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${(amountPaid / 100).toFixed(2)}</p>
          <p style="margin: 5px 0;"><strong>New Balance:</strong> ${newBalance} credits</p>
        </div>
      </div>
      
      <h2 style="color: #1f2937;">🚀 Ready to Submit!</h2>
      <p>Your credits are now available for manual AI submissions. Use them to:</p>
      
      <ul style="color: #4b5563;">
        <li>Submit to specific AI models of your choice</li>
        <li>Make additional submissions beyond your daily plan</li>
        <li>Test different prompt strategies</li>
        <li>Boost your AI recommendation frequency</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          🎯 Start Manual Submissions
        </a>
      </div>
      
      <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #1e40af; margin-top: 0;">💡 Pro Tip:</h4>
        <p style="color: #1e40af; margin: 0; font-size: 14px;">
          Combine your automatic daily submissions with strategic manual submissions for maximum AI recommendation success!
        </p>
      </div>
      
      <p>Questions about your credits or need help? Reply to this email!</p>
      
      <p>Happy submitting!<br><strong>The Juicy Links Team</strong></p>
    </div>
  `
  
  const text = `
Credit Purchase Confirmed!

Hi${userName ? ` ${userName}` : ''},

Your credit purchase has been successfully processed.

Purchase Details:
- Credits Added: ${creditsAdded}
- Amount Paid: $${(amountPaid / 100).toFixed(2)}
- New Balance: ${newBalance} credits

Your credits are now available for manual AI submissions.

Start using them: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Best regards,
The Juicy Links Team
  `

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  })
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  userEmail: string, 
  userName: string | undefined, 
  plan: string
) {
  const subject = `${plan} Plan Activated - Welcome to Juicy Links Pro!`
  
  const planFeatures = {
    STARTER: [
      '1 Business Profile',
      'Daily AI Prompts to 5 LLMs',
      'Basic Analytics',
      'Email Support'
    ],
    GROWTH: [
      '5 Business Profiles',
      'Daily AI Prompts to 5 LLMs', 
      'Advanced Analytics',
      'Priority Support',
      'Custom Prompts'
    ]
  }
  
  const features = planFeatures[plan as keyof typeof planFeatures] || planFeatures.STARTER
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">🎉 ${plan} Plan Activated!</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Congratulations! Your ${plan} plan is now active and ready to supercharge your AI SEO strategy.</p>
      
      <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #15803d; margin-top: 0;">✅ Your ${plan} Plan Includes:</h3>
        <ul style="color: #166534;">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      
      <h2 style="color: #1f2937;">Ready to Start?</h2>
      <p>Your prompts will now be sent daily to all major AI models, training them to recommend your business when users ask for suggestions.</p>
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Access Your Dashboard
        </a>
      </p>
      
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>💡 Pro Tip:</strong> The longer you keep your subscription active, the more data points we create about your business, increasing your chances of being recommended in future AI models!</p>
      </div>
      
      <p>Questions about your subscription? Contact us at admin@juicylinks.ai</p>
      
      <p>Best regards,<br>The Juicy Links Team</p>
    </div>
  `
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

/**
 * Send queue processing notification with upsell for trials
 */
export async function sendQueueProcessingNotification(
  userEmail: string,
  userName: string | undefined,
  results: {
    totalPrompts: number
    successfulPrompts: number
    failedPrompts: number
    businessName: string
    isTrialUser: boolean
    userPlan?: string
    triggerType: 'manual' | 'automatic' | 'credit'
  }
) {
  const triggerText = results.triggerType === 'manual' ? 'manually triggered' : 
                      results.triggerType === 'credit' ? 'credit-based run' : 'automatically processed'
  const subject = `${results.failedPrompts === 0 ? '✅' : '⚠️'} Queue ${triggerText.charAt(0).toUpperCase() + triggerText.slice(1)} - ${results.successfulPrompts}/${results.totalPrompts} Prompts Sent`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: ${results.failedPrompts === 0 ? '#16a34a' : '#ea580c'};">
        ${results.failedPrompts === 0 ? '✅' : '⚠️'} Queue Processing Complete
      </h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      ${results.isTrialUser ? `
        <p>Your <strong>FREE TRIAL</strong> prompt queue for <strong>${results.businessName}</strong> has been ${triggerText}!</p>
      ` : `
        <p><strong>Thank you for being a ${results.userPlan || 'paid'} member!</strong> Your prompt queue for <strong>${results.businessName}</strong> has been ${triggerText}.</p>
      `}
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">📊 Processing Results:</h3>
        <ul>
          <li><strong>Total Prompts:</strong> ${results.totalPrompts}</li>
          <li><strong>Successful:</strong> <span style="color: #16a34a;">${results.successfulPrompts}</span></li>
          ${results.failedPrompts > 0 ? `<li><strong>Failed:</strong> <span style="color: #dc2626;">${results.failedPrompts}</span></li>` : ''}
          <li><strong>AI Models Reached:</strong> OpenAI, Claude, Gemini, Perplexity, Grok</li>
        </ul>
      </div>
      
      ${results.failedPrompts === 0 ? 
        '<div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #15803d; margin: 0;"><strong>🎉 Perfect Success!</strong> All prompts were sent successfully! Your business information is now being processed by all major AI models and will be included in their training data.</p></div>' :
        '<div style="background: #fef2f2; border: 2px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="color: #dc2626; margin: 0;"><strong>⚠️ Partial Success:</strong> Some prompts failed to send. This is normal due to API rate limits and they will be retried in the next processing cycle.</p></div>'
      }
      
      ${results.isTrialUser ? `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">🚀 Want 7x MORE Submissions for Maximum AI Training?</h3>
          <p style="color: #92400e; margin-bottom: 15px;"><strong>Trial Limitation:</strong> You only get 1 submission per week, but our paid members get DAILY submissions!</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4 style="color: #1f2937; margin: 0 0 10px 0;">📈 Why More Submissions = Higher Success:</h4>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li><strong>More Data Points:</strong> Each submission creates training data for AI models</li>
              <li><strong>Higher Recommendation Probability:</strong> More exposure = better recognition</li>
              <li><strong>Faster Results:</strong> Daily submissions accelerate the training process</li>
              <li><strong>Competitive Advantage:</strong> Stay ahead of competitors with consistent presence</li>
            </ul>
          </div>
          
          <div style="display: flex; gap: 15px; margin: 15px 0;">
            <div style="flex: 1; background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
              <h4 style="color: #1f2937; margin: 0 0 10px 0;">Starter - $49/month</h4>
              <p style="color: #16a34a; font-weight: bold; margin: 0 0 5px 0;">DAILY submissions (7x more!)</p>
              <ul style="color: #4b5563; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>1 Business Profile</li>
                <li>Advanced Analytics</li>
                <li>Email Support</li>
              </ul>
            </div>
            <div style="flex: 1; background: #f0fdf4; padding: 15px; border-radius: 6px; border: 2px solid #16a34a;">
              <h4 style="color: #15803d; margin: 0 0 10px 0;">Growth - $79/month ⭐</h4>
              <p style="color: #16a34a; font-weight: bold; margin: 0 0 5px 0;">DAILY submissions (7x more!)</p>
              <ul style="color: #166534; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>5 Business Profiles</li>
                <li>Priority Support</li>
                <li>Custom Prompts</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 15px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
               style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              🚀 Upgrade for Daily Submissions
            </a>
          </div>
        </div>
      ` : `
        <div style="background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #15803d; margin-top: 0;">🙏 Thank You for Being a ${results.userPlan || 'Paid'} Member!</h3>
          <p style="color: #166534; margin-bottom: 15px;">Your daily submissions are building a strong presence across all major AI models. Keep your subscription active for maximum long-term benefit!</p>
          
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <h4 style="color: #1f2937; margin: 0 0 10px 0;">💪 Your Competitive Advantages:</h4>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li><strong>Daily Training:</strong> Consistent data points across all AI models</li>
              <li><strong>Long-term Growth:</strong> Building recommendation strength over time</li>
              <li><strong>Market Leadership:</strong> Staying ahead with regular AI exposure</li>
              <li><strong>Future-Proof:</strong> Ready for new AI models as they launch</li>
            </ul>
          </div>
        </div>
      `}
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/logs" 
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
          📊 View Detailed Logs
        </a>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          🏠 Dashboard
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        <strong>Next Processing:</strong> ${results.isTrialUser ? 'Available in 7 days (or upgrade for daily processing!)' : 'Tomorrow (daily for paid members)'}
      </p>
      
      <p>Best regards,<br><strong>The Juicy Links Team</strong></p>
    </div>
  `
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}

/**
 * Send trial expiration warning
 */
export async function sendTrialExpirationWarning(
  userEmail: string,
  userName: string | undefined,
  daysRemaining: number
) {
  const subject = `⏰ Your Juicy Links Trial Expires in ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ea580c;">⏰ Trial Expiring Soon</h1>
      
      <p>Hi${userName ? ` ${userName}` : ''},</p>
      
      <p>Your Juicy Links free trial expires in <strong>${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</strong>.</p>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">🚀 Don't Lose Your Progress!</h3>
        <p style="color: #92400e; margin-bottom: 0;">Upgrade now to continue training AI models to recommend your business. The longer you stay active, the better your results!</p>
      </div>
      
      <h2 style="color: #1f2937;">Choose Your Plan:</h2>
      
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1f2937; margin-top: 0;">Starter - $49/month</h3>
          <ul style="color: #4b5563; font-size: 14px;">
            <li>1 Business Profile</li>
            <li>Daily AI Prompts</li>
            <li>5 LLM Models</li>
            <li>Basic Analytics</li>
          </ul>
        </div>
        <div style="flex: 1; background: #f0fdf4; padding: 20px; border-radius: 8px; border: 2px solid #16a34a;">
          <h3 style="color: #15803d; margin-top: 0;">Growth - $79/month</h3>
          <ul style="color: #166534; font-size: 14px;">
            <li>5 Business Profiles</li>
            <li>Daily AI Prompts</li>
            <li>5 LLM Models</li>
            <li>Advanced Analytics</li>
            <li>Priority Support</li>
          </ul>
        </div>
      </div>
      
      <p style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
           style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Upgrade Now
        </a>
      </p>
      
      <p style="font-size: 14px; color: #6b7280;">Questions? Reply to this email and we'll help you choose the right plan.</p>
      
      <p>Best regards,<br>The Juicy Links Team</p>
    </div>
  `
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
  })
}
