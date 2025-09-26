import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message, inquiryType } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create email content
    const inquiryTypeLabels: Record<string, string> = {
      general: 'General Inquiry',
      sales: 'Sales & Pricing',
      support: 'Technical Support',
      enterprise: 'Enterprise Solutions',
      partnership: 'Partnership',
      feedback: 'Feedback'
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">From Juicy Links Website</p>
          </div>
          
          <div style="border-left: 4px solid #3b82f6; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">${subject}</h2>
            <p style="color: #374151; margin: 0; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Contact Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #374151;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #374151;">${email}</td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Company:</td>
                <td style="padding: 8px 0; color: #374151;">${company}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Inquiry Type:</td>
                <td style="padding: 8px 0; color: #374151;">${inquiryTypeLabels[inquiryType] || inquiryType}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Sent from Juicy Links Contact Form<br>
              ${new Date().toLocaleString('en-US', { 
                timeZone: 'America/Los_Angeles',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>
        </div>
      </div>
    `

    const emailText = `
New Contact Form Submission - Juicy Links

Subject: ${subject}

Message:
${message}

Contact Details:
- Name: ${name}
- Email: ${email}
${company ? `- Company: ${company}` : ''}
- Inquiry Type: ${inquiryTypeLabels[inquiryType] || inquiryType}

Sent: ${new Date().toLocaleString('en-US', { 
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}
    `

    // Send email to you
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
      to: 'teylersf@gmail.com',
      subject: `[Juicy Links Contact] ${subject}`,
      html: emailHtml,
      text: emailText,
      replyTo: email
    })

    // Send confirmation email to the user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">We've received your message</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <p style="color: #1e40af; margin: 0; text-align: center; font-weight: 600;">
              ✓ Your message has been successfully sent
            </p>
          </div>
          
          <p style="color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
            Hi ${name},
          </p>
          
          <p style="color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
            Thank you for reaching out to Juicy Links! We've received your inquiry about "${subject}" and our team will review it shortly.
          </p>
          
          <p style="color: #374151; margin: 0 0 20px 0; line-height: 1.6;">
            <strong>What happens next?</strong>
          </p>
          
          <ul style="color: #374151; margin: 0 0 20px 20px; line-height: 1.6;">
            <li>We'll review your message within 2-4 hours during business days</li>
            <li>A team member will respond to you at ${email}</li>
            <li>For urgent matters, you can also email us directly at support@juicylinks.ai</li>
          </ul>
          
          <p style="color: #374151; margin: 0 0 30px 0; line-height: 1.6;">
            In the meantime, feel free to explore our <a href="https://juicylinks.ai/how-it-works" style="color: #3b82f6; text-decoration: none;">How It Works</a> page to learn more about how we help businesses get recommended by AI platforms.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #1f2937;">The Juicy Links Team</strong><br>
              <a href="https://juicylinks.ai" style="color: #3b82f6; text-decoration: none;">juicylinks.ai</a>
            </p>
          </div>
        </div>
      </div>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
      to: email,
      subject: 'Thank you for contacting Juicy Links - We\'ll be in touch soon!',
      html: confirmationHtml,
      text: `Hi ${name},

Thank you for reaching out to Juicy Links! We've received your inquiry about "${subject}" and our team will review it shortly.

What happens next?
- We'll review your message within 2-4 hours during business days
- A team member will respond to you at ${email}
- For urgent matters, you can also email us directly at support@juicylinks.ai

Best regards,
The Juicy Links Team
https://juicylinks.ai`
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
