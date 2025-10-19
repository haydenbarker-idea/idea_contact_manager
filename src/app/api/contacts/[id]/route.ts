import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple password authentication
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!authHeader || !adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [_, password] = credentials.split(':')

    if (password !== adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Update contact (only notes - status handled by /status route)
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        notes: body.notes,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { contact },
    })
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update contact',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple password authentication
    const authHeader = request.headers.get('authorization')
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!authHeader || !adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [_, password] = credentials.split(':')

    if (password !== adminPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          },
        },
        { status: 401 }
      )
    }

    // Delete all communications for this contact first
    await prisma.communication.deleteMany({
      where: { contactId: params.id },
    })

    // Delete the contact
    await prisma.contact.delete({
      where: { id: params.id },
    })

    console.log('[CONTACT DELETE] Success:', {
      contactId: params.id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: 'Contact deleted successfully' },
    })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete contact',
        },
      },
      { status: 500 }
    )
  }
}

