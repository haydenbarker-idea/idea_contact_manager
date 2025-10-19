import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSubmissionSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/twilio'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = contactSubmissionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0].message,
          },
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create contact
    const contact = await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        company: data.company || null,
        title: data.title || null,
        photoUrl: data.photoUrl || null,
        conference: data.conference || null,
      },
    })

    // Log for debugging
    console.log('[CONTACT SUBMIT] Success:', {
      contactId: contact.id,
      name: contact.name,
      photoUrl: contact.photoUrl,
      conference: contact.conference,
      timestamp: new Date().toISOString(),
    })

    // Send SMS to contact with your information (non-blocking)
    if (contact.phone) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contacts.ideanetworks.com'
      const yourName = process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Hayden Barker'
      const yourEmail = process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || 'hbarker@ideanetworks.com'
      const yourPhone = process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '+16476242735'
      const yourLinkedIn = process.env.NEXT_PUBLIC_DEFAULT_USER_LINKEDIN || 'https://linkedin.com/in/haydenbarker'
      const vcardUrl = `${appUrl}/api/vcard`
      
      const message = `Hi ${contact.name}! Great meeting you at ${contact.conference || 'the event'}!\n\n` +
        `Here's my contact info:\n` +
        `📛 ${yourName}\n` +
        `📧 ${yourEmail}\n` +
        `📱 ${yourPhone}\n` +
        `💼 ${yourLinkedIn}\n\n` +
        `💾 Save my contact (with photo):\n${vcardUrl}\n\n` +
        `Looking forward to staying connected!`
      
      // Send SMS asynchronously (don't wait for it)
      sendSMS({
        to: contact.phone,
        message: message,
      }).then(result => {
        if (result.success) {
          console.log('[CONTACT SUBMIT] SMS sent to:', contact.phone, 'MessageId:', result.messageId)
        } else {
          console.error('[CONTACT SUBMIT] SMS failed:', result.error)
        }
      }).catch(error => {
        console.error('[CONTACT SUBMIT] SMS error:', error)
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { contactId: contact.id },
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to submit contact. Please try again.',
        },
      },
      { status: 500 }
    )
  }
}

