import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const { playerIds } = body

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: 'Player IDs must be a non-empty array' },
        { status: 400 }
      )
    }

    // Check if tournament exists and belongs to current club
    const tournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Check if players exist and belong to current club
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds }, clubId },
    })

    if (players.length !== playerIds.length) {
      return NextResponse.json(
        { error: 'Some players do not exist' },
        { status: 400 }
      )
    }

    // Add players to tournament (using createMany to avoid duplicates)
    const existingPlayers = await prisma.tournamentPlayer.findMany({
      where: {
        tournamentId: params.id,
        playerId: { in: playerIds },
      },
    })

    const existingPlayerIds = new Set(existingPlayers.map(tp => tp.playerId))
    const newPlayerIds = playerIds.filter(id => !existingPlayerIds.has(id))

    if (newPlayerIds.length > 0) {
      await prisma.tournamentPlayer.createMany({
        data: newPlayerIds.map(playerId => ({
          tournamentId: params.id,
          playerId,
        })),
      })
    }

    const updatedTournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        tournamentPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                level: true,
                gender: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      added: newPlayerIds.length,
      skipped: existingPlayerIds.size,
      tournament: updatedTournament,
    })
  } catch (error) {
    console.error('Error adding players to tournament:', error)
    return NextResponse.json(
      { error: 'Failed to add players to tournament' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const { searchParams } = new URL(req.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Verify tournament belongs to current club
    const tournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Remove player from tournament
    await prisma.tournamentPlayer.deleteMany({
      where: {
        tournamentId: params.id,
        playerId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing player from tournament:', error)
    return NextResponse.json(
      { error: 'Failed to remove player from tournament' },
      { status: 500 }
    )
  }
}
