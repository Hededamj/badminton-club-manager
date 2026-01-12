import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPlayerSchema } from '@/lib/validators/player'
import { requireClubMember, requireClubAdmin } from '@/lib/auth-helpers'

// GET /api/players - List all players in current club
export async function GET(req: NextRequest) {
  try {
    const session = await requireClubMember()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const players = await db.player.findMany({
      where: {
        clubId,
        AND: [
          activeOnly ? { isActive: true } : {},
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      include: {
        statistics: true,
      },
      orderBy: [
        { isActive: 'desc' },
        { level: 'desc' },
      ],
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

// POST /api/players - Create new player in current club
export async function POST(req: NextRequest) {
  try {
    const session = await requireClubAdmin()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const validatedData = createPlayerSchema.parse(body)

    // Convert empty strings to null for optional fields
    const playerData = {
      ...validatedData,
      clubId,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      holdsportId: validatedData.holdsportId || null,
    }

    // Create player
    const player = await db.player.create({
      data: playerData,
    })

    // Create player statistics
    await db.playerStatistics.create({
      data: {
        playerId: player.id,
      },
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)

    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'En spiller med denne email findes allerede' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
}
