import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { sendSMS } from '@/lib/twilio'
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

    // Send SMS with their profile link
    if (phone) {
      const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/u/${user.slug}`
      const message = `🎉 Welcome ${user.name.split(' ')[0]}! Your contact exchange page is live:\n\n${profileUrl}\n\nTap to add it to your home screen and start collecting contacts!\n\n- Contact Exchange Pro`
      
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

