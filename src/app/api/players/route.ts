import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPlayerSchema } from '@/lib/validators/player'

// GET /api/players - List all players
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const players = await db.player.findMany({
      where: {
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

// POST /api/players - Create new player
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createPlayerSchema.parse(body)

    // Convert empty strings to null for optional fields
    const playerData = {
      ...validatedData,
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
