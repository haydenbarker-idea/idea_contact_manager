import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import type { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No photo provided',
          },
        },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'contacts')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}-${randomString}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/contacts/${filename}`

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        url: publicUrl,
        filename,
      },
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload photo',
        },
      },
      { status: 500 }
    )
  }
}

