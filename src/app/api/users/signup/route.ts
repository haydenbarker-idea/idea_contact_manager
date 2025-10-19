import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { sendSMS } from '@/lib/twilio'
import { sendEmail } from '@/lib/resend-client'
import { generateNewUserWelcomeEmail } from '@/lib/email-templates-user'
import { createSession } from '@/lib/auth'
import { notifyAdminNewUser } from '@/lib/admin-notifications'
import QRCode from 'qrcode'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, linkedin, company, title, bio, slug, password, photoUrl } = body

    // Validate required fields
    if (!name || !email || !bio || !slug || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name, email, bio, slug, and password are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3 || slug.length > 50) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_SLUG',
            message: 'Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only',
          },
        },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password must be at least 6 characters',
          },
        },
        { status: 400 }
      )
    }

    // Check if email or slug already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { slug }],
      },
    })

    if (existing) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message:
              existing.email === email
                ? 'An account with this email already exists'
                : 'This username is already taken',
          },
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        linkedin: linkedin || null,
        company: company || null,
        title: title || null,
        bio,
        slug,
        password: hashedPassword,
        photoUrl: photoUrl || null,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        slug: true,
        createdAt: true,
      },
    })

    console.log('[USER SIGNUP] New user created:', {
      userId: user.id,
      name: user.name,
      slug: user.slug,
      timestamp: new Date().toISOString(),
    })

    // Notify admin of new signup (async, don't wait)
    notifyAdminNewUser({
      name: user.name,
      email: user.email,
      slug: user.slug,
      phone: phone || null,
      company: company || null,
    }).catch(err => {
      console.error('[USER SIGNUP] Admin notification error:', err)
    })

    // Create session to automatically log them in
    await createSession(user.id)

    // Prepare URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://saas.contacts.ideanetworks.com'
    const qrPageUrl = `${baseUrl}/u/${user.slug}/qr`
    const profileUrl = `${baseUrl}/u/${user.slug}`
    const dashboardUrl = `${baseUrl}/dashboard`
    const loginUrl = `${baseUrl}/login`

    // Send welcome email with QR code attachment
    const userFirstName = user.name.split(' ')[0]
    const emailHtml = generateNewUserWelcomeEmail({
      userName: user.name,
      userFirstName,
      userEmail: user.email,
      slug: user.slug,
      qrPageUrl,
      profileUrl,
      dashboardUrl,
      loginUrl,
    })

    // Generate QR code as image buffer
    try {
      const qrCodeBuffer = await QRCode.toBuffer(profileUrl, {
        width: 800,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      })

      sendEmail({
        to: user.email,
        subject: `🎉 Welcome to Contact Exchange Pro, ${userFirstName}!`,
        html: emailHtml,
        attachments: [
          {
            filename: `${user.slug}-qr-code.png`,
            content: qrCodeBuffer,
          },
        ],
      }).then(result => {
        if (result.success) {
          console.log('[USER SIGNUP] Welcome email sent to:', user.email)
        } else {
          console.error('[USER SIGNUP] Email failed:', result.error)
        }
      }).catch(err => {
        console.error('[USER SIGNUP] Email error:', err)
      })
    } catch (qrError) {
      console.error('[USER SIGNUP] QR code generation error:', qrError)
    }

    // Send SMS with their QR code page link (not profile)
    if (phone) {
      const message = `🎉 Welcome ${userFirstName}! Your contact exchange QR code is ready:\n\n${qrPageUrl}\n\nAdd this to your home screen! At conferences, open it and people can scan your QR code.\n\n- Contact Exchange Pro`
      
      sendSMS({ to: phone, message }).then(result => {
        if (result.success) {
          console.log('[USER SIGNUP] SMS sent to:', phone)
        } else {
          console.error('[USER SIGNUP] SMS failed:', result.error)
        }
      }).catch(err => {
        console.error('[USER SIGNUP] SMS error:', err)
      })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        userId: user.id,
        slug: user.slug,
        profileUrl: `/u/${user.slug}`,
      },
      message: 'Account created successfully!',
    })
  } catch (error) {
    console.error('User signup error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create account. Please try again.',
        },
      },
      { status: 500 }
    )
  }
}

