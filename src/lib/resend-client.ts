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
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
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
  attachments,
}: SendEmailParams): Promise<EmailResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend not configured',
    }
  }

  try {
    // Build email payload - Resend requires either html or text, not both as undefined
    const emailPayload: any = {
      from: fromEmail,
      to,
      subject,
    }

    if (html) {
      emailPayload.html = html
      if (text) emailPayload.text = text
    } else if (text) {
      emailPayload.text = text
    } else {
      return {
        success: false,
        error: 'Either html or text content is required',
      }
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: att.content instanceof Buffer ? att.content : Buffer.from(att.content),
      }))
    }

    const { data, error } = await resend.emails.send(emailPayload)

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

