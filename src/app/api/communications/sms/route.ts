import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendSMS } from '@/lib/twilio'
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
    const { contactId, message, templateId } = body

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

    if (!contact.phone) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NO_PHONE_NUMBER',
            message: 'Contact has no phone number',
          },
        },
        { status: 400 }
      )
    }

    // Fill template if provided, otherwise use raw message
    let finalMessage = message
    if (templateId) {
      const variables = getTemplateVariables(contact.name)
      finalMessage = fillTemplate(message, variables)
    }

    // Send SMS
    const result = await sendSMS({
      to: contact.phone,
      message: finalMessage,
    })

    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'SMS_SEND_FAILED',
            message: result.error || 'Failed to send SMS',
          },
        },
        { status: 500 }
      )
    }

    // Log communication in database
    const communication = await prisma.communication.create({
      data: {
        contactId: contact.id,
        type: 'SMS',
        direction: 'OUTBOUND',
        message: finalMessage,
        status: 'SENT',
        metadata: {
          twilioSid: result.messageId,
          twilioStatus: result.status,
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
    console.error('Send SMS error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send SMS',
        },
      },
      { status: 500 }
    )
  }
}

