import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateVCard, getVCardFilename } from '@/lib/vcard'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contactId = params.id

    // Fetch contact from database
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } },
        { status: 404 }
      )
    }

    // Generate vCard with contact's data
    const vcardContent = generateVCard({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || undefined,
      linkedin: contact.linkedin || undefined,
      company: contact.company || undefined,
      title: contact.title || undefined,
      photoPath: contact.photoUrl || undefined, // Use their selfie photo
    })

    const filename = getVCardFilename(contact.name)

    return new NextResponse(vcardContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('vCard generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate vCard',
        },
      },
      { status: 500 }
    )
  }
}

