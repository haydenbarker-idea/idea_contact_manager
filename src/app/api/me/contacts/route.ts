import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get current session
    const session = await getSession()

    if (!session) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Please log in to view your contacts',
          },
        },
        { status: 401 }
      )
    }

    // Fetch user's contacts
    const contacts = await prisma.contact.findMany({
      where: {
        userId: session.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        linkedin: true,
        photoUrl: true,
        conference: true,
        notes: true,
        submittedAt: true,
        status: true,
      },
    })

    // Get analytics
    const totalContacts = contacts.length
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentContacts = contacts.filter(c => new Date(c.submittedAt) > last24Hours).length

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        contacts,
        analytics: {
          totalContacts,
          recentContacts,
        },
      },
    })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch contacts',
        },
      },
      { status: 500 }
    )
  }
}

