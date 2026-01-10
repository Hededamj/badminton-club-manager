import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// PATCH /api/trainings/[id]/matches/[matchId] - Update match players
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { matchId } = await params
    const body = await request.json()
    const { players } = body

    // Validate players array (can be 0-4 players now)
    if (!Array.isArray(players) || players.length > 4) {
      return NextResponse.json(
        { error: 'Must provide between 0 and 4 players' },
        { status: 400 }
      )
    }

    // Filter out null/undefined players and validate each player has required fields
    const validPlayers = players.filter(p => p && p.playerId)

    for (const player of validPlayers) {
      if (
        !player.playerId ||
        typeof player.team !== 'number' ||
        typeof player.position !== 'number'
      ) {
        return NextResponse.json(
          { error: 'Invalid player data' },
          { status: 400 }
        )
      }
    }

    // Check if match exists and has no result
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        result: true,
        matchPlayers: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.result) {
      return NextResponse.json(
        { error: 'Cannot edit a completed match' },
        { status: 400 }
      )
    }

    // Check if any player is already in another match in the same round
    const otherMatchesInRound = await prisma.match.findMany({
      where: {
        trainingId: match.trainingId,
        matchNumber: match.matchNumber,
        id: { not: matchId },
      },
      include: {
        matchPlayers: true,
      },
    })

    const playerIdsInOtherMatches = otherMatchesInRound.flatMap(m =>
      m.matchPlayers.map(mp => mp.playerId)
    )

    const duplicatePlayers = validPlayers.filter(p =>
      playerIdsInOtherMatches.includes(p.playerId)
    )

    if (duplicatePlayers.length > 0) {
      return NextResponse.json(
        { error: 'En eller flere spillere er allerede i en anden kamp i samme runde' },
        { status: 400 }
      )
    }

    // Update match players in a transaction
    await prisma.$transaction(async tx => {
      // Delete existing match players
      await tx.matchPlayer.deleteMany({
        where: { matchId },
      })

      // Create new match players (only for valid players)
      if (validPlayers.length > 0) {
        await tx.matchPlayer.createMany({
          data: validPlayers.map(p => ({
            matchId,
            playerId: p.playerId,
            team: p.team,
            position: p.position,
          })),
        })
      }
    })

    // Fetch updated match
    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        matchPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                level: true,
                gender: true,
              },
            },
          },
        },
        result: true,
      },
    })

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    })
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
}
