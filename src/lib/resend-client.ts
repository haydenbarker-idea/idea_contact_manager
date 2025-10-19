import { Resend } from 'resend'

// Initialize Resend client
const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'contact@ideanetworks.com'

if (!apiKey) {
  console.warn('Resend API key not configured. Email features will be disabled.')
}

const resend = apiKey ? new Resend(apiKey) : null

export interface SendEmailParams {
  to: string
  subject: string
  html?: string
  text?: string
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<EmailResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend not configured',
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: html || text,
      text,
    })

    if (error) {
      console.error('Resend email error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error: any) {
    console.error('Resend email error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

/**
 * Check if Resend is properly configured
 */
export function isResendConfigured(): boolean {
  return !!apiKey
}

/**
 * Get the configured "from" email address
 */
export function getFromEmail(): string {
  return fromEmail
}

