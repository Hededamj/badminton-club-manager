import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/clubs/switch - Switch to a different club
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { clubId } = body

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      )
    }

    // Verify user is a member of this club
    const membership = await prisma.clubMembership.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId,
        isActive: true,
      },
      include: {
        club: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this club' },
        { status: 403 }
      )
    }

    // Return the new club info - the actual switch happens via session update
    // The frontend will trigger a session refresh after this
    return NextResponse.json({
      success: true,
      club: {
        id: membership.club.id,
        name: membership.club.name,
        slug: membership.club.slug,
      },
      role: membership.role,
      playerId: membership.playerId,
    })
  } catch (error) {
    console.error('Error switching club:', error)
    return NextResponse.json(
      { error: 'Failed to switch club' },
      { status: 500 }
    )
  }
}
