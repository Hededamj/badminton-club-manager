import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubMember, requireClubOwner } from '@/lib/auth-helpers'

// GET /api/clubs/current - Get current club details
export async function GET(req: NextRequest) {
  try {
    const session = await requireClubMember()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId
    if (!clubId) {
      return NextResponse.json({ error: 'No club selected' }, { status: 400 })
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: {
            players: true,
            trainings: true,
            tournaments: true,
            memberships: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    // Get user's role in this club
    const membership = await prisma.clubMembership.findFirst({
      where: {
        userId: session.user.id,
        clubId: clubId,
        isActive: true,
      },
    })

    return NextResponse.json({
      ...club,
      userRole: membership?.role || 'MEMBER',
    })
  } catch (error) {
    console.error('Error fetching current club:', error)
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    )
  }
}

// PATCH /api/clubs/current - Update current club settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireClubOwner()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - Owner access required' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const { name, description, logo, settings } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Klubnavn skal være mindst 2 tegn' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (logo !== undefined) {
      updateData.logo = logo?.trim() || null
    }

    if (settings !== undefined) {
      updateData.settings = settings
    }

    const club = await prisma.club.update({
      where: { id: clubId },
      data: updateData,
    })

    return NextResponse.json(club)
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}
