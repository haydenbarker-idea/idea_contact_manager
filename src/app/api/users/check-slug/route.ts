import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Slug is required',
          },
        },
        { status: 400 }
      )
    }

    // Check if slug is valid format
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          available: false,
          error: {
            code: 'INVALID_SLUG',
            message: 'Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only',
          },
        },
        { status: 400 }
      )
    }

    // Check if slug is already taken
    const existing = await prisma.user.findUnique({
      where: { slug },
      select: { id: true },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      available: !existing,
    })
  } catch (error) {
    console.error('Check slug error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check slug availability',
        },
      },
      { status: 500 }
    )
  }
}

