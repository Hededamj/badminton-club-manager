import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubMember } from '@/lib/auth-helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/clubs - Get all clubs the user is a member of
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberships = await prisma.clubMembership.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    })

    const clubs = memberships.map((m) => ({
      ...m.club,
      role: m.role,
      playerId: m.playerId,
    }))

    return NextResponse.json(clubs)
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

// POST /api/clubs - Create a new club
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Klubnavn skal være mindst 2 tegn' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'oe')
      .replace(/[å]/g, 'aa')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug already exists
    const existingClub = await prisma.club.findUnique({
      where: { slug },
    })

    if (existingClub) {
      return NextResponse.json(
        { error: 'En klub med dette navn findes allerede' },
        { status: 400 }
      )
    }

    // Create club and membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      const club = await tx.club.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || null,
          isActive: true,
        },
      })

      // Create owner membership
      await tx.clubMembership.create({
        data: {
          userId: session.user.id,
          clubId: club.id,
          role: 'OWNER',
          isActive: true,
        },
      })

      return club
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
