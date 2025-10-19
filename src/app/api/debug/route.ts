import { NextResponse } from 'next/server'
import { readdirSync, existsSync, statSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cwd = process.cwd()
    
    // Check various paths
    const checks = {
      cwd: cwd,
      publicExists: existsSync(join(cwd, 'public')),
      publicUploadsExists: existsSync(join(cwd, 'public', 'uploads', 'contacts')),
      standalonePublicExists: existsSync(join(cwd, '.next', 'standalone', 'public')),
      standaloneUploadsExists: existsSync(join(cwd, '.next', 'standalone', 'public', 'uploads', 'contacts')),
      nodeEnv: process.env.NODE_ENV,
      uploadedFiles: [] as string[],
      uploadedFilesStandalone: [] as string[],
    }

    // List files in uploads directory
    const uploadsPath = join(cwd, 'public', 'uploads', 'contacts')
    if (existsSync(uploadsPath)) {
      try {
        checks.uploadedFiles = readdirSync(uploadsPath).slice(0, 10) // Last 10 files
      } catch (e) {
        checks.uploadedFiles = ['Error reading directory']
      }
    }

    // List files in standalone uploads
    const standaloneUploadsPath = join(cwd, '.next', 'standalone', 'public', 'uploads', 'contacts')
    if (existsSync(standaloneUploadsPath)) {
      try {
        checks.uploadedFilesStandalone = readdirSync(standaloneUploadsPath).slice(0, 10)
      } catch (e) {
        checks.uploadedFilesStandalone = ['Error reading directory']
      }
    }

    return NextResponse.json({
      success: true,
      data: checks,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

