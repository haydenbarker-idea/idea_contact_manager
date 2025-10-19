import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import type { ApiResponse } from '@/types'

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        },
        { status: 401 }
      )
    }

    // Get full user profile
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        linkedin: true,
        bio: true,
        photoUrl: true,
        slug: true,
        active: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get profile',
        },
      },
      { status: 500 }
    )
  }
}

// PATCH - Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromSession(request)

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // If changing password, verify current password
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Current password required to change password',
            },
          },
          { status: 400 }
        )
      }

      // Get current user with password
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      })

      if (!userWithPassword) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'User not found',
            },
          },
          { status: 404 }
        )
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(
        body.currentPassword,
        userWithPassword.password
      )

      if (!passwordMatch) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Current password is incorrect',
            },
          },
          { status: 400 }
        )
      }

      // Hash new password
      body.password = await bcrypt.hash(body.newPassword, 10)
    }

    // Check if email is being changed and is unique
    if (body.email && body.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      })

      if (existingUser) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already in use',
            },
          },
          { status: 400 }
        )
      }
    }

    // Build update data (only include provided fields)
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone || null
    if (body.company !== undefined) updateData.company = body.company || null
    if (body.title !== undefined) updateData.title = body.title || null
    if (body.linkedin !== undefined) updateData.linkedin = body.linkedin || null
    if (body.bio !== undefined) updateData.bio = body.bio || null
    if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl
    if (body.password !== undefined) updateData.password = body.password

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        title: true,
        linkedin: true,
        bio: true,
        photoUrl: true,
        slug: true,
      },
    })

    console.log('[PROFILE UPDATE] User updated:', {
      userId: user.id,
      fields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update profile',
        },
      },
      { status: 500 }
    )
  }
}

