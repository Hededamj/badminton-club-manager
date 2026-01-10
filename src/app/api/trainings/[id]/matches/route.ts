import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { generateMatches, Player } from '@/lib/matchmaking/algorithm'

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get training with players
    const training = await prisma.training.findUnique({
      where: { id: params.id },
      include: {
        trainingPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
    }

    if (training.trainingPlayers.length < 4) {
      return NextResponse.json(
        { error: 'Need at least 4 players to generate matches' },
        { status: 400 }
      )
    }

    // Get partnership history for all players
    const playerIds = training.trainingPlayers.map(tp => tp.player.id)
    const partnerships = await prisma.partnership.findMany({
      where: {
        AND: [
          { player1Id: { in: playerIds } },
          { player2Id: { in: playerIds } },
        ],
      },
    })

    // Get opposition history
    const oppositions = await prisma.opposition.findMany({
      where: {
        AND: [
          { player1Id: { in: playerIds } },
          { player2Id: { in: playerIds } },
        ],
      },
    })

    // Convert to algorithm format
    const players: Player[] = training.trainingPlayers.map(tp => ({
      id: tp.player.id,
      name: tp.player.name,
      level: tp.player.level,
    }))

    const partnershipHistory = partnerships.map(p => ({
      player1Id: p.player1Id,
      player2Id: p.player2Id,
      timesPartnered: p.timesPartnered,
      lastPartnered: p.lastPartnered || undefined,
    }))

    const oppositionHistory = oppositions.map(o => ({
      player1Id: o.player1Id,
      player2Id: o.player2Id,
      timesOpposed: o.timesOpposed,
      lastOpposed: o.lastOpposed || undefined,
    }))

    // Generate matches
    const matches = generateMatches(
      players,
      training.courts,
      training.matchesPerCourt,
      partnershipHistory,
      oppositionHistory
    )

    // Delete existing matches for this training
    await prisma.match.deleteMany({
      where: { trainingId: training.id },
    })

    // Create matches in database
    const createdMatches = await Promise.all(
      matches.map(async match => {
        // Prepare benched players data
        const benchedPlayersData = match.benchedPlayers?.map(p => ({
          id: p.id,
          name: p.name,
          level: p.level,
        }))

        const matchData: any = {
          trainingId: training.id,
          courtNumber: match.court,
          matchNumber: match.matchNumber,
          status: 'PENDING',
          matchPlayers: {
            create: [
              {
                playerId: match.team1[0].id,
                team: 1,
                position: 1,
              },
              {
                playerId: match.team1[1].id,
                team: 1,
                position: 2,
              },
              {
                playerId: match.team2[0].id,
                team: 2,
                position: 1,
              },
              {
                playerId: match.team2[1].id,
                team: 2,
                position: 2,
              },
            ],
          },
        }

        // Only add benchedPlayers if there are any
        if (benchedPlayersData && benchedPlayersData.length > 0) {
          matchData.benchedPlayers = benchedPlayersData
        }

        const createdMatch = await prisma.match.create({
          data: matchData,
          include: {
            matchPlayers: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    level: true,
                  },
                },
              },
            },
          },
        })

        return createdMatch
      })
    )

    // Auto-set training status to IN_PROGRESS
    await prisma.training.update({
      where: { id: training.id },
      data: { status: 'IN_PROGRESS' },
    })

    return NextResponse.json({
      success: true,
      matchesGenerated: createdMatches.length,
      matches: createdMatches,
    })
  } catch (error) {
    console.error('Error generating matches:', error)
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    )
  }
}
