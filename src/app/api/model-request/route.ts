import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { modelRequest } = await request.json()

    if (!modelRequest || typeof modelRequest !== 'string' || !modelRequest.trim()) {
      return NextResponse.json({ error: 'Model request is required' }, { status: 400 })
    }

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'admin@juicylinks.ai',
      to: 'teylersf@gmail.com',
      subject: 'New AI Model Request - Juicy Links',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
            🤖 New AI Model Request
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">User Information:</h3>
            <p><strong>Email:</strong> ${user.primaryEmail || 'Not provided'}</p>
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Display Name:</strong> ${user.displayName || 'Not provided'}</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">Requested Model:</h3>
            <p style="font-size: 16px; line-height: 1.6; color: #451a03; white-space: pre-wrap;">${modelRequest.trim()}</p>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
              <strong>📅 Submitted:</strong> ${new Date().toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This request was sent from <a href="https://juicylinks.ai" style="color: #7c3aed;">Juicy Links</a>
          </p>
        </div>
      `,
      text: `
New AI Model Request - Juicy Links

User Information:
- Email: ${user.primaryEmail || 'Not provided'}
- User ID: ${user.id}
- Display Name: ${user.displayName || 'Not provided'}

Requested Model:
${modelRequest.trim()}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
})}

This request was sent from Juicy Links (https://juicylinks.ai)
      `
    })

    if (emailResult.error) {
      console.error('Resend email error:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('Model request email sent successfully:', emailResult.data?.id)

    return NextResponse.json({
      success: true,
      message: 'Model request sent successfully',
      emailId: emailResult.data?.id
    })

  } catch (error) {
    console.error('Model request API error:', error)
    return NextResponse.json(
      { error: 'Failed to process model request' },
      { status: 500 }
    )
  }
}
