import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, isTwilioConfigured } from '@/lib/twilio'

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

    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'Twilio not configured',
        envVars: {
          TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
          TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
          TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || 'Not set',
        },
      })
    }

    const body = await request.json()
    const testPhone = body.phone || process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE

    if (!testPhone) {
      return NextResponse.json({
        success: false,
        error: 'No test phone number provided',
      })
    }

    // Send test SMS
    console.log('[SMS TEST] Sending test SMS to:', testPhone)
    
    const result = await sendSMS({
      to: testPhone,
      message: `Test SMS from Contact Exchange App\n\nSent at: ${new Date().toLocaleString()}\n\nIf you received this, Twilio is working correctly! ✅`,
    })

    console.log('[SMS TEST] Result:', result)

    if (result.success) {
      return NextResponse.json({
        success: true,
        configured: true,
        messageId: result.messageId,
        status: result.status,
        to: testPhone,
        from: process.env.TWILIO_PHONE_NUMBER,
        message: 'Test SMS sent successfully! Check your phone.',
      })
    } else {
      return NextResponse.json({
        success: false,
        configured: true,
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error('[SMS TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test SMS',
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
      configured: isTwilioConfigured(),
      fromPhone: process.env.TWILIO_PHONE_NUMBER || 'Not set',
      envVars: {
        TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
        TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || 'Not set',
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

