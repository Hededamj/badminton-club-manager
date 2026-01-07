import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// Helper to check if match should be mixed doubles
function shouldBeMixedDoubles(
  team1Player1: any,
  team1Player2: any,
  team2Player1: any,
  team2Player2: any
): boolean {
  const allHaveGender = [team1Player1, team1Player2, team2Player1, team2Player2].every(p => p.gender)
  if (!allHaveGender) return false

  const genders = [team1Player1.gender, team1Player2.gender, team2Player1.gender, team2Player2.gender]
  const maleCount = genders.filter(g => g === 'MALE').length
  const femaleCount = genders.filter(g => g === 'FEMALE').length

  return maleCount === 2 && femaleCount === 2
}

// Helper to arrange players for mixed doubles
function arrangeMixedDoubles(players: any[]): any[] {
  const males = players.filter(p => p.gender === 'MALE')
  const females = players.filter(p => p.gender === 'FEMALE')

  if (males.length !== 2 || females.length !== 2) {
    return players // Not mixed doubles, return as is
  }

  // Arrange as: male1, female1, male2, female2
  return [males[0], females[0], males[1], females[1]]
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

    // Get tournament with players
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        tournamentPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    if (tournament.tournamentPlayers.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to generate tournament matches' },
        { status: 400 }
      )
    }

    // Sort players by level for seeding (highest first)
    const sortedPlayers = tournament.tournamentPlayers
      .map(tp => tp.player)
      .sort((a, b) => b.level - a.level)

    const sortedPlayerIds = sortedPlayers.map(p => p.id)

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
        let matchPlayers = [
          sortedPlayers[playerIndex++],
          sortedPlayers[playerIndex++],
          sortedPlayers[playerIndex++],
          sortedPlayers[playerIndex++],
        ]

        // Check if this should be mixed doubles and rearrange if needed
        if (shouldBeMixedDoubles(matchPlayers[0], matchPlayers[1], matchPlayers[2], matchPlayers[3])) {
          matchPlayers = arrangeMixedDoubles(matchPlayers)
        }

        const match = await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            courtNumber: (i % 6) + 1,
            matchNumber: Math.floor(i / 6) + 1,
            status: 'PENDING',
            matchPlayers: {
              create: [
                { playerId: matchPlayers[0].id, team: 1, position: 1 },
                { playerId: matchPlayers[1].id, team: 1, position: 2 },
                { playerId: matchPlayers[2].id, team: 2, position: 1 },
                { playerId: matchPlayers[3].id, team: 2, position: 2 },
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
