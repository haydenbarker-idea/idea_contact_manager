import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { contactSubmissionSchema } from '@/lib/validations'
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
      },
    })

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

