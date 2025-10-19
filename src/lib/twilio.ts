import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !twilioPhone) {
  console.warn('Twilio credentials not configured. SMS features will be disabled.')
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface SendSMSParams {
  to: string
  message: string
}

export interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  status?: string
}

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS({ to, message }: SendSMSParams): Promise<SMSResult> {
  if (!client || !twilioPhone) {
    return {
      success: false,
      error: 'Twilio not configured',
    }
  }

  try {
    // Ensure phone number has + prefix
    const formattedPhone = to.startsWith('+') ? to : `+${to}`

    const messageResponse = await client.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone,
    })

    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
    }
  } catch (error: any) {
    console.error('Twilio SMS error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    }
  }
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && twilioPhone)
}

