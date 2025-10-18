import { NextResponse } from 'next/server'
import { generateVCard, getVCardFilename } from '@/lib/vcard'

export async function GET() {
  // Get user profile from environment variables (MVP single-user mode)
  const profile = {
    name: process.env.NEXT_PUBLIC_DEFAULT_USER_NAME || 'Your Name',
    title: process.env.NEXT_PUBLIC_DEFAULT_USER_TITLE || '',
    company: process.env.NEXT_PUBLIC_DEFAULT_USER_COMPANY || '',
    email: process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || '',
    phone: process.env.NEXT_PUBLIC_DEFAULT_USER_PHONE || '',
    linkedin: process.env.NEXT_PUBLIC_DEFAULT_USER_LINKEDIN || '',
  }

  const vcardContent = generateVCard(profile)
  const filename = getVCardFilename(profile.name)

  return new NextResponse(vcardContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

