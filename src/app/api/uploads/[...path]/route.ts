import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    
    // Try multiple possible locations
    const possiblePaths = [
      join(process.cwd(), 'public', 'uploads', filePath),
      join(process.cwd(), '.next', 'standalone', 'public', 'uploads', filePath),
      join('/var/www/contact-exchange', 'public', 'uploads', filePath),
    ]

    let actualPath: string | null = null
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        actualPath = path
        break
      }
    }

    if (!actualPath) {
      console.error('[UPLOAD SERVE] File not found:', filePath, 'tried:', possiblePaths)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read the file
    const fileBuffer = await readFile(actualPath)
    const stats = await stat(actualPath)

    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    }
    const contentType = contentTypes[ext || ''] || 'application/octet-stream'

    console.log('[UPLOAD SERVE] Success:', {
      filePath,
      actualPath,
      size: stats.size,
      contentType,
    })

    // Return the file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': stats.size.toString(),
      },
    })
  } catch (error) {
    console.error('[UPLOAD SERVE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}

