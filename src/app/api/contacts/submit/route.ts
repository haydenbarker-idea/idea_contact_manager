import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSubmissionSchema } from '@/lib/validations'
import { sendSMS } from '@/lib/twilio'
import { sendEmail } from '@/lib/resend-client'
import { generateWelcomeEmail } from '@/lib/email-templates'
import { readFile } from 'fs/promises'
import { join } from 'path'
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

    // Send welcome email with company PDF (non-blocking)
    if (contact.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://contacts.ideanetworks.com'
      const yourName = process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Hayden Barker'
      const yourTitle = process.env.NEXT_PUBLIC_DEFAULT_USER_TITLE || 'Co-Owner'
      const yourCompany = process.env.NEXT_PUBLIC_DEFAULT_USER_COMPANY || 'Idea Networks'
      const yourEmail = process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || 'hbarker@ideanetworks.com'
      const yourPhone = process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '+16476242735'
      const yourLinkedIn = process.env.NEXT_PUBLIC_DEFAULT_USER_LINKEDIN || 'https://linkedin.com/in/haydenbarker'
      const companyWebsite = 'https://www.ideanetworks.com'
      const companyLinkedIn = 'https://www.linkedin.com/company/idea-networks-inc'
      const vcardUrl = `${appUrl}/api/vcard`
      
      const firstName = contact.name.split(' ')[0]
      
      const htmlContent = generateWelcomeEmail({
        contactName: contact.name,
        contactFirstName: firstName,
        conference: contact.conference || 'the event',
        yourName,
        yourTitle,
        yourCompany,
        yourEmail,
        yourPhone,
        yourLinkedIn,
        companyWebsite,
        companyLinkedIn,
        vcardUrl,
      })
      
      // Read PDF attachment
      const pdfPath = join(process.cwd(), 'public', 'documents', 'IdeaNetworksValue.pdf')
      
      // Send email asynchronously
      readFile(pdfPath)
        .then(pdfBuffer => {
          return sendEmail({
            to: contact.email,
            subject: `Great meeting you at ${contact.conference || 'the event'}, ${firstName}!`,
            html: htmlContent,
            attachments: [
              {
                filename: 'Idea_Networks_Overview.pdf',
                content: pdfBuffer,
              },
            ],
          })
        })
        .then(result => {
          if (result.success) {
            console.log('[CONTACT SUBMIT] Email sent to:', contact.email, 'MessageId:', result.messageId)
          } else {
            console.error('[CONTACT SUBMIT] Email failed:', result.error)
          }
        })
        .catch(error => {
          console.error('[CONTACT SUBMIT] Email error:', error)
          // Send email without attachment if PDF fails
          sendEmail({
            to: contact.email,
            subject: `Great meeting you at ${contact.conference || 'the event'}, ${firstName}!`,
            html: htmlContent,
          }).then(result => {
            if (result.success) {
              console.log('[CONTACT SUBMIT] Email sent (no PDF) to:', contact.email)
            }
          })
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

