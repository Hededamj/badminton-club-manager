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
      return NextResponse.json({ error: 'Kun ejeren kan ændre roller' }, { status: 401 })
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
      include: {
        user: true,
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Medlemskab ikke fundet' },
        { status: 404 }
      )
    }

    // Handle role changes
    if (role !== undefined && ['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
      // If transferring ownership to someone else
      if (role === 'OWNER' && membership.role !== 'OWNER') {
        // Get current owner's membership
        const currentOwnerMembership = await prisma.clubMembership.findFirst({
          where: {
            clubId,
            role: 'OWNER',
          },
        })

        if (currentOwnerMembership) {
          // Use a transaction to transfer ownership
          await prisma.$transaction([
            // Demote current owner to ADMIN
            prisma.clubMembership.update({
              where: { id: currentOwnerMembership.id },
              data: { role: 'ADMIN' },
            }),
            // Promote new member to OWNER
            prisma.clubMembership.update({
              where: { id: membershipId },
              data: { role: 'OWNER' },
            }),
          ])

          // Return updated membership
          const updated = await prisma.clubMembership.findFirst({
            where: { id: membershipId },
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

          return NextResponse.json({
            ...updated,
            ownershipTransferred: true,
            message: 'Ejerskab overdraget'
          })
        }
      }

      // If trying to demote the owner (not allowed directly - must transfer ownership)
      if (membership.role === 'OWNER' && role !== 'OWNER') {
        return NextResponse.json(
          { error: 'Kan ikke nedgradere ejeren. Overdrag først ejerskabet til en anden.' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}

    if (role !== undefined && ['ADMIN', 'MEMBER'].includes(role)) {
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
            { error: 'Spiller ikke fundet i denne klub' },
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
      { error: 'Kunne ikke opdatere medlem' },
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
