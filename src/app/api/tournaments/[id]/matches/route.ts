import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// Helper to generate round robin matches
function generateRoundRobinPairings(playerIds: string[]): { player1Id: string; player2Id: string }[] {
  const pairings: { player1Id: string; player2Id: string }[] = []

  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      pairings.push({
        player1Id: playerIds[i],
        player2Id: playerIds[j],
      })
    }
  }

  return pairings
}

// Helper to generate single elimination bracket
function generateSingleEliminationBracket(playerIds: string[]): { player1Id: string | null; player2Id: string | null }[] {
  const pairings: { player1Id: string | null; player2Id: string | null }[] = []

  // Find next power of 2
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(playerIds.length)))
  const byes = bracketSize - playerIds.length

  // Create first round pairings
  let playerIndex = 0
  for (let i = 0; i < bracketSize / 2; i++) {
    const player1 = playerIndex < playerIds.length ? playerIds[playerIndex++] : null
    const player2 = playerIndex < playerIds.length ? playerIds[playerIndex++] : null

    pairings.push({
      player1Id: player1,
      player2Id: player2,
    })
  }

  return pairings
}

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

    const body = await req.json()
    const { playerIds } = body

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to generate tournament matches' },
        { status: 400 }
      )
    }

    // Get tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Get players with their levels for seeding
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      orderBy: { level: 'desc' }, // Seed by level
    })

    if (players.length !== playerIds.length) {
      return NextResponse.json({ error: 'Some players not found' }, { status: 404 })
    }

    const sortedPlayerIds = players.map(p => p.id)

    // Delete existing matches for this tournament
    await prisma.match.deleteMany({
      where: { tournamentId: tournament.id },
    })

    let pairings: { player1Id: string | null; player2Id: string | null }[] = []

    // Generate matches based on format
    if (tournament.format === 'ROUND_ROBIN') {
      // For round robin, every pair plays each other (doubles)
      // We need groups of 4 players for badminton doubles
      if (sortedPlayerIds.length % 4 !== 0) {
        return NextResponse.json(
          { error: 'Round robin requires a multiple of 4 players for doubles' },
          { status: 400 }
        )
      }

      // Generate all possible team combinations
      const teams: { player1Id: string; player2Id: string }[] = []
      for (let i = 0; i < sortedPlayerIds.length; i++) {
        for (let j = i + 1; j < sortedPlayerIds.length; j++) {
          teams.push({ player1Id: sortedPlayerIds[i], player2Id: sortedPlayerIds[j] })
        }
      }

      // Create matches between all team pairs
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const team1 = teams[i]
          const team2 = teams[j]

          // Skip if teams share a player
          if (
            team1.player1Id === team2.player1Id ||
            team1.player1Id === team2.player2Id ||
            team1.player2Id === team2.player1Id ||
            team1.player2Id === team2.player2Id
          ) {
            continue
          }

          pairings.push({
            player1Id: team1.player1Id,
            player2Id: team1.player2Id,
          })
        }
      }
    } else if (tournament.format === 'SINGLE_ELIMINATION') {
      // For single elimination doubles, we need pairs
      if (sortedPlayerIds.length % 2 !== 0) {
        return NextResponse.json(
          { error: 'Single elimination requires an even number of players for doubles pairing' },
          { status: 400 }
        )
      }

      pairings = generateSingleEliminationBracket(sortedPlayerIds)
    } else {
      return NextResponse.json(
        { error: `Tournament format ${tournament.format} not yet implemented` },
        { status: 400 }
      )
    }

    // Create matches in database
    // For round robin, distribute across courts
    // For single elimination, group by rounds
    const createdMatches = []

    if (tournament.format === 'ROUND_ROBIN') {
      // Round robin matches for doubles
      const teams: { player1Id: string; player2Id: string }[] = []
      for (let i = 0; i < sortedPlayerIds.length; i++) {
        for (let j = i + 1; j < sortedPlayerIds.length; j++) {
          teams.push({ player1Id: sortedPlayerIds[i], player2Id: sortedPlayerIds[j] })
        }
      }

      let matchNumber = 0
      let courtNumber = 1
      const maxCourts = 6

      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const team1 = teams[i]
          const team2 = teams[j]

          // Skip if teams share a player
          if (
            team1.player1Id === team2.player1Id ||
            team1.player1Id === team2.player2Id ||
            team1.player2Id === team2.player1Id ||
            team1.player2Id === team2.player2Id
          ) {
            continue
          }

          const match = await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              courtNumber: courtNumber,
              matchNumber: Math.floor(matchNumber / maxCourts) + 1,
              status: 'PENDING',
              matchPlayers: {
                create: [
                  { playerId: team1.player1Id, team: 1, position: 1 },
                  { playerId: team1.player2Id, team: 1, position: 2 },
                  { playerId: team2.player1Id, team: 2, position: 1 },
                  { playerId: team2.player2Id, team: 2, position: 2 },
                ],
              },
            },
            include: {
              matchPlayers: {
                include: {
                  player: {
                    select: { id: true, name: true, level: true },
                  },
                },
              },
            },
          })

          createdMatches.push(match)
          matchNumber++
          courtNumber = (courtNumber % maxCourts) + 1
        }
      }
    } else if (tournament.format === 'SINGLE_ELIMINATION') {
      // For single elimination, create team pairings from sorted players
      // Players should be arranged in teams of 2 first
      if (sortedPlayerIds.length < 4) {
        return NextResponse.json(
          { error: 'Need at least 4 players for single elimination doubles' },
          { status: 400 }
        )
      }

      // Create matches between pairs of teams
      const numMatches = Math.floor(sortedPlayerIds.length / 4)
      let playerIndex = 0

      for (let i = 0; i < numMatches; i++) {
        // Get 4 players for this match
        const team1Player1 = sortedPlayerIds[playerIndex++]
        const team1Player2 = sortedPlayerIds[playerIndex++]
        const team2Player1 = sortedPlayerIds[playerIndex++]
        const team2Player2 = sortedPlayerIds[playerIndex++]

        const match = await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            courtNumber: (i % 6) + 1,
            matchNumber: Math.floor(i / 6) + 1,
            status: 'PENDING',
            matchPlayers: {
              create: [
                { playerId: team1Player1, team: 1, position: 1 },
                { playerId: team1Player2, team: 1, position: 2 },
                { playerId: team2Player1, team: 2, position: 1 },
                { playerId: team2Player2, team: 2, position: 2 },
              ],
            },
          },
          include: {
            matchPlayers: {
              include: {
                player: {
                  select: { id: true, name: true, level: true },
                },
              },
            },
          },
        })

        createdMatches.push(match)
      }
    }

    return NextResponse.json({
      success: true,
      matchesGenerated: createdMatches.length,
      matches: createdMatches,
    })
  } catch (error) {
    console.error('Error generating tournament matches:', error)
    return NextResponse.json(
      { error: 'Failed to generate tournament matches' },
      { status: 500 }
    )
  }
}
