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
      // For round robin with many players, use a limited approach:
      // Each player plays with different partners against different opponents
      // Rather than ALL possible team combinations (which would be thousands of matches)

      if (sortedPlayerIds.length < 4) {
        return NextResponse.json(
          { error: 'Round robin requires at least 4 players' },
          { status: 400 }
        )
      }

      // Limit matches to a reasonable number:
      // Use round-robin scheduling where each player plays multiple rounds
      // with different partners each time
      const numPlayers = sortedPlayerIds.length
      const numRounds = Math.min(numPlayers - 1, 10) // Max 10 rounds

      // We'll skip the complex team-vs-team approach and just do this for now
      // The actual match creation will be handled below
      pairings = [] // Will be created in the match creation section

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
      // Simplified Round Robin for doubles badminton
      // Each player plays multiple matches with different partners/opponents
      // Limited to a reasonable number of matches

      const numPlayers = sortedPlayerIds.length
      const matchesPerPlayer = Math.min(Math.floor(numPlayers / 2), 8) // Max 8 matches per player

      const matchesToCreate: any[] = []
      const playerMatchCount = new Map<string, number>()
      const playerPartnerships = new Map<string, Set<string>>()
      const playerOppositions = new Map<string, Set<string>>()

      // Initialize tracking
      sortedPlayerIds.forEach(id => {
        playerMatchCount.set(id, 0)
        playerPartnerships.set(id, new Set())
        playerOppositions.set(id, new Set())
      })

      // Generate matches using a rotation algorithm
      let matchNumber = 1
      let courtNumber = 1
      const maxCourts = 6
      const maxMatchesTotal = numPlayers * matchesPerPlayer / 4 // 4 players per match

      for (let round = 0; round < maxMatchesTotal && matchesToCreate.length < 200; round++) {
        // Try to find 4 players for a match
        const availablePlayers = sortedPlayerIds.filter(id =>
          (playerMatchCount.get(id) || 0) < matchesPerPlayer
        )

        if (availablePlayers.length < 4) break

        // Pick 4 players trying to minimize repeated partnerships/oppositions
        let bestMatch: string[] | null = null
        let bestScore = Infinity

        // Try a few random combinations
        for (let attempt = 0; attempt < 10; attempt++) {
          const shuffled = [...availablePlayers].sort(() => Math.random() - 0.5)
          const fourPlayers = shuffled.slice(0, 4)

          // Score based on previous partnerships/oppositions
          let score = 0
          const [p1, p2, p3, p4] = fourPlayers

          // Check partnerships (p1-p2 and p3-p4)
          if (playerPartnerships.get(p1)?.has(p2)) score += 10
          if (playerPartnerships.get(p3)?.has(p4)) score += 10

          // Check oppositions
          if (playerOppositions.get(p1)?.has(p3)) score += 5
          if (playerOppositions.get(p1)?.has(p4)) score += 5
          if (playerOppositions.get(p2)?.has(p3)) score += 5
          if (playerOppositions.get(p2)?.has(p4)) score += 5

          if (score < bestScore) {
            bestScore = score
            bestMatch = fourPlayers
          }

          if (score === 0) break // Perfect match found
        }

        if (!bestMatch) break

        const [p1, p2, p3, p4] = bestMatch

        // Check if this should be mixed doubles
        const players = bestMatch.map(id => sortedPlayers.find(p => p.id === id)!)
        let matchPlayers = players
        if (shouldBeMixedDoubles(players[0], players[1], players[2], players[3])) {
          matchPlayers = arrangeMixedDoubles(players)
        }

        matchesToCreate.push({
          tournamentId: tournament.id,
          courtNumber: courtNumber,
          matchNumber: matchNumber,
          status: 'PENDING',
          matchPlayers: {
            create: [
              { playerId: matchPlayers[0].id, team: 1, position: 1 },
              { playerId: matchPlayers[1].id, team: 1, position: 2 },
              { playerId: matchPlayers[2].id, team: 2, position: 1 },
              { playerId: matchPlayers[3].id, team: 2, position: 2 },
            ],
          },
        })

        // Update tracking
        matchPlayers.forEach(p => {
          playerMatchCount.set(p.id, (playerMatchCount.get(p.id) || 0) + 1)
        })
        playerPartnerships.get(matchPlayers[0].id)?.add(matchPlayers[1].id)
        playerPartnerships.get(matchPlayers[1].id)?.add(matchPlayers[0].id)
        playerPartnerships.get(matchPlayers[2].id)?.add(matchPlayers[3].id)
        playerPartnerships.get(matchPlayers[3].id)?.add(matchPlayers[2].id)

        playerOppositions.get(matchPlayers[0].id)?.add(matchPlayers[2].id)
        playerOppositions.get(matchPlayers[0].id)?.add(matchPlayers[3].id)
        playerOppositions.get(matchPlayers[1].id)?.add(matchPlayers[2].id)
        playerOppositions.get(matchPlayers[1].id)?.add(matchPlayers[3].id)
        playerOppositions.get(matchPlayers[2].id)?.add(matchPlayers[0].id)
        playerOppositions.get(matchPlayers[2].id)?.add(matchPlayers[1].id)
        playerOppositions.get(matchPlayers[3].id)?.add(matchPlayers[0].id)
        playerOppositions.get(matchPlayers[3].id)?.add(matchPlayers[1].id)

        courtNumber = (courtNumber % maxCourts) + 1
        if (courtNumber === 1) matchNumber++
      }

      // Batch create all matches
      for (const matchData of matchesToCreate) {
        const match = await prisma.match.create({
          data: matchData,
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
