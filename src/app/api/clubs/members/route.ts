import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubMember, requireClubAdmin, requireClubOwner } from '@/lib/auth-helpers'

// GET /api/clubs/members - Get all members of the current club
export async function GET(req: NextRequest) {
  try {
    const session = await requireClubMember()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const memberships = await prisma.clubMembership.findMany({
      where: {
        clubId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        player: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then MEMBER
        { joinedAt: 'asc' },
      ],
    })

    return NextResponse.json(memberships)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// PATCH /api/clubs/members - Update a member's role
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireClubOwner()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Owner access required' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const { membershipId, role, playerId } = body

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required' },
        { status: 400 }
      )
    }

    // Verify membership belongs to current club
    const membership = await prisma.clubMembership.findFirst({
      where: {
        id: membershipId,
        clubId,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    // Can't change owner's role
    if (membership.role === 'OWNER' && role && role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (role !== undefined && ['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      updateData.role = role
    }

    if (playerId !== undefined) {
      // Verify player belongs to this club
      if (playerId) {
        const player = await prisma.player.findFirst({
          where: { id: playerId, clubId },
        })
        if (!player) {
          return NextResponse.json(
            { error: 'Player not found in this club' },
            { status: 400 }
          )
        }
      }
      updateData.playerId = playerId || null
    }

    const updated = await prisma.clubMembership.update({
      where: { id: membershipId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        player: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/clubs/members - Remove a member from the club
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const { searchParams } = new URL(req.url)
    const membershipId = searchParams.get('membershipId')

    if (!membershipId) {
      return NextResponse.json(
        { error: 'Membership ID is required' },
        { status: 400 }
      )
    }

    // Verify membership belongs to current club
    const membership = await prisma.clubMembership.findFirst({
      where: {
        id: membershipId,
        clubId,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    // Can't remove owner
    if (membership.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove club owner' },
        { status: 400 }
      )
    }

    // Can't remove yourself
    if (membership.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      )
    }

    // Soft delete - set isActive to false
    await prisma.clubMembership.update({
      where: { id: membershipId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}
