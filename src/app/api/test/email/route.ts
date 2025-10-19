import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, isResendConfigured, getFromEmail } from '@/lib/resend-client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Simple password authentication
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!authHeader || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [_, password] = credentials.split(':')

    if (password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    // Check if Resend is configured
    if (!isResendConfigured()) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'Resend API key not configured',
        envVars: {
          RESEND_API_KEY: !!process.env.RESEND_API_KEY,
          RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'not set',
        },
      })
    }

    const body = await request.json()
    const testEmail = body.email || process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'No test email provided',
      })
    }

    // Send test email
    console.log('[EMAIL TEST] Sending test email to:', testEmail)
    
    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Email from Contact Exchange App',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from your Contact Exchange app.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>From Email: ${getFromEmail()}</li>
          <li>Sent At: ${new Date().toISOString()}</li>
        </ul>
        <p>If you received this email, Resend is working correctly! ✅</p>
      `,
      text: `Email Test Successful!\n\nThis is a test email from your Contact Exchange app.\n\nConfiguration:\nFrom Email: ${getFromEmail()}\nSent At: ${new Date().toISOString()}\n\nIf you received this email, Resend is working correctly!`,
    })

    console.log('[EMAIL TEST] Result:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        configured: true,
        messageId: result.messageId,
        to: testEmail,
        from: getFromEmail(),
        message: 'Test email sent successfully! Check your inbox.',
      })
    } else {
      return NextResponse.json({
        success: false,
        configured: true,
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error('[EMAIL TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email',
    })
  }
}

// GET to check configuration status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!authHeader || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      )
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [_, password] = credentials.split(':')

    if (password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      configured: isResendConfigured(),
      fromEmail: getFromEmail(),
      envVars: {
        RESEND_API_KEY: !!process.env.RESEND_API_KEY ? 'Set' : 'Not set',
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'Not set',
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

