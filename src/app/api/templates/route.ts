import { NextRequest, NextResponse } from 'next/server'
import { MESSAGE_TEMPLATES } from '@/lib/message-templates'
import type { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let templates = MESSAGE_TEMPLATES

    // Filter by type if provided
    if (type) {
      templates = templates.filter((t) => t.type === type)
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { templates },
    })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch templates',
        },
      },
      { status: 500 }
    )
  }
}

