import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/resend-client'
import { fillTemplate, getTemplateVariables } from '@/lib/message-templates'
import type { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Simple admin authentication
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!authHeader || !adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [_, password] = credentials.split(':')

    if (password !== adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          },
        },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { contactId, subject, message, templateId } = body

    if (!contactId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_CONTACT_ID',
            message: 'Contact ID is required',
          },
        },
        { status: 400 }
      )
    }

    // Get contact from database
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CONTACT_NOT_FOUND',
            message: 'Contact not found',
          },
        },
        { status: 404 }
      )
    }

    if (!contact.email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NO_EMAIL',
            message: 'Contact has no email address',
          },
        },
        { status: 400 }
      )
    }

    // Fill template if provided
    const variables = getTemplateVariables(contact.name)
    const finalSubject = templateId ? fillTemplate(subject, variables) : subject
    const finalMessage = templateId ? fillTemplate(message, variables) : message

    // Convert plain text to simple HTML
    const htmlMessage = finalMessage.replace(/\n/g, '<br>')

    // Send email
    const result = await sendEmail({
      to: contact.email,
      subject: finalSubject,
      html: htmlMessage,
      text: finalMessage,
    })

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_FAILED',
            message: result.error || 'Failed to send email',
          },
        },
        { status: 500 }
      )
    }

    // Log communication in database
    const communication = await prisma.communication.create({
      data: {
        contactId: contact.id,
        type: 'EMAIL',
        direction: 'OUTBOUND',
        subject: finalSubject,
        message: finalMessage,
        status: 'SENT',
        metadata: {
          resendId: result.messageId,
        },
      },
    })

    // Update contact's lastContact timestamp and status if NEW
    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        lastContact: new Date(),
        status: contact.status === 'NEW' ? 'CONTACTED' : contact.status,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        communication,
        messageId: result.messageId,
      },
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send email',
        },
      },
      { status: 500 }
    )
  }
}

