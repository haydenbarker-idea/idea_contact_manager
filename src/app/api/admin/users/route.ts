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

// GET all users with their stats
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } }
    )
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        slug: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            contacts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform to include contact count
    const usersWithStats = users.map(user => ({
      ...user,
      contactCount: user._count.contacts,
      _count: undefined, // Remove _count from response
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: usersWithStats,
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    )
  }
}

// DELETE a user
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'BAD_REQUEST', message: 'User ID required' } },
        { status: 400 }
      )
    }

    // Delete user's contacts first (cascade)
    await prisma.contact.deleteMany({
      where: { userId },
    })

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    })

    console.log('[ADMIN] User deleted:', userId)

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete user' } },
      { status: 500 }
    )
  }
}

