import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Update user status (for approval/rejection)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const params = await context.params
    const { id } = params
    const body = await request.json()
    const { status } = body

    console.log('PATCH /api/users/[id] - User ID:', id)
    console.log('PATCH /api/users/[id] - Status:', status)

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending', 'suspended']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update user status
    console.log('Updating user status...')
    const updatedUser = await db.update(
      'app_users',
      { status },
      { id }
    )

    console.log('Update result:', updatedUser)

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}`,
      user: updatedUser[0]
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
