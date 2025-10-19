import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

// Simple authentication check
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const [type, credentials] = authHeader.split(' ')
  if (type !== 'Basic') return false

  const decoded = Buffer.from(credentials, 'base64').toString()
  const [username, password] = decoded.split(':')

  return password === process.env.ADMIN_PASSWORD
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } }
    )
  }

  try {
    const userId = params.id

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, slug: true },
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Get their contacts
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        linkedin: true,
        status: true,
        submittedAt: true,
        photoUrl: true,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        user,
        contacts,
      },
    })
  } catch (error) {
    console.error('Admin get user contacts error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch contacts' } },
      { status: 500 }
    )
  }
}

