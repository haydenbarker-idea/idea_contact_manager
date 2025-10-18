import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    // Simple password authentication (MVP)
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

    // Extract password from Basic auth
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

    // Fetch all contacts
    const contacts = await prisma.contact.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { contacts },
    })
  } catch (error) {
    console.error('List contacts error:', error)
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

