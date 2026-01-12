import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'

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
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    // Get tournament with players (verify it belongs to current club)
    const tournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
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

    const matchTypes = tournament.matchTypes || ['MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES']
    const isSingles = matchTypes.includes('SINGLES')
    const minPlayers = isSingles ? 2 : 4

    if (tournament.tournamentPlayers.length < minPlayers) {
      return NextResponse.json(
        { error: `Need at least ${minPlayers} players to generate tournament matches` },
        { status: 400 }
      )
    }

    // Validate players have gender set for doubles tournaments
    if (!isSingles) {
      const playersWithoutGender = tournament.tournamentPlayers.filter(tp => !tp.player.gender)
      if (playersWithoutGender.length > 0 && (matchTypes.includes('MENS_DOUBLES') || matchTypes.includes('WOMENS_DOUBLES') || matchTypes.includes('MIXED_DOUBLES'))) {
        const names = playersWithoutGender.map(tp => tp.player.name).join(', ')
        return NextResponse.json(
          { error: `Følgende spillere mangler køn: ${names}. Køn er påkrævet for double turneringer.` },
          { status: 400 }
        )
      }
    }

    // Sort players by level for seeding (highest first)
    const allPlayers = tournament.tournamentPlayers
      .map(tp => tp.player)
      .sort((a, b) => b.level - a.level)

    // Filter players by gender for specific match types
    const malePlayers = allPlayers.filter(p => p.gender === 'MALE')
    const femalePlayers = allPlayers.filter(p => p.gender === 'FEMALE')

    // Validate we have enough players for each match type
    if (!isSingles) {
      if (matchTypes.includes('MENS_DOUBLES') && malePlayers.length < 4) {
        return NextResponse.json(
          { error: `Herre Double kræver mindst 4 mænd (har ${malePlayers.length})` },
          { status: 400 }
        )
      }
      if (matchTypes.includes('WOMENS_DOUBLES') && femalePlayers.length < 4) {
        return NextResponse.json(
          { error: `Dame Double kræver mindst 4 kvinder (har ${femalePlayers.length})` },
          { status: 400 }
        )
      }
      if (matchTypes.includes('MIXED_DOUBLES') && (malePlayers.length < 2 || femalePlayers.length < 2)) {
        return NextResponse.json(
          { error: `Mix Double kræver mindst 2 mænd og 2 kvinder (har ${malePlayers.length} mænd og ${femalePlayers.length} kvinder)` },
          { status: 400 }
        )
      }
    }

    const sortedPlayers = allPlayers
    const sortedPlayerIds = sortedPlayers.map(p => p.id)

    // Delete existing matches for this tournament
    await prisma.match.deleteMany({
      where: { tournamentId: tournament.id },
    })

    let pairings: { player1Id: string | null; player2Id: string | null }[] = []

    // Generate matches based on format and match types
    if (tournament.format === 'ROUND_ROBIN') {
      if (isSingles && sortedPlayerIds.length < 2) {
        return NextResponse.json(
          { error: 'Round robin requires at least 2 players for singles' },
          { status: 400 }
        )
      }
      if (!isSingles && sortedPlayerIds.length < 4) {
        return NextResponse.json(
          { error: 'Round robin requires at least 4 players for doubles' },
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
      const matchesToCreate: any[] = []
      let matchNumber = 1
      let courtNumber = 1
      const maxCourts = 6

      if (isSingles) {
        // Singles Round Robin - everyone plays everyone
        const players = sortedPlayers
        for (let i = 0; i < players.length; i++) {
          for (let j = i + 1; j < players.length; j++) {
            matchesToCreate.push({
              tournamentId: tournament.id,
              courtNumber: courtNumber,
              matchNumber: matchNumber,
              status: 'PENDING',
              matchPlayers: {
                create: [
                  { playerId: players[i].id, team: 1, position: 1 },
                  { playerId: players[j].id, team: 2, position: 1 },
                ],
              },
            })

            courtNumber = (courtNumber % maxCourts) + 1
            if (courtNumber === 1) matchNumber++
          }
        }
      } else {
        // Doubles Round Robin - generate for each selected match type
        for (const matchType of matchTypes) {
          let playersForType: typeof sortedPlayers = []

          if (matchType === 'MENS_DOUBLES') {
            playersForType = malePlayers
          } else if (matchType === 'WOMENS_DOUBLES') {
            playersForType = femalePlayers
          } else if (matchType === 'MIXED_DOUBLES') {
            playersForType = allPlayers // Will filter during pairing
          }

          if (playersForType.length < 4) continue

          // Generate limited matches for this type
          const numPlayers = playersForType.length
          const matchesPerPlayer = Math.min(Math.floor(numPlayers / 2), 6)
          const playerMatchCount = new Map<string, number>()
          const playerPartnerships = new Map<string, Set<string>>()
          const playerOppositions = new Map<string, Set<string>>()

          playersForType.forEach(p => {
            playerMatchCount.set(p.id, 0)
            playerPartnerships.set(p.id, new Set())
            playerOppositions.set(p.id, new Set())
          })

          const maxMatchesForType = Math.min((numPlayers * matchesPerPlayer) / 4, 50)

          for (let round = 0; round < maxMatchesForType * 3; round++) {
            if (matchesToCreate.length >= 200) break

            let availablePlayers = playersForType.filter(p =>
              (playerMatchCount.get(p.id) || 0) < matchesPerPlayer
            )

            if (matchType === 'MIXED_DOUBLES') {
              const availableMales = availablePlayers.filter(p => p.gender === 'MALE')
              const availableFemales = availablePlayers.filter(p => p.gender === 'FEMALE')
              if (availableMales.length < 2 || availableFemales.length < 2) break

              // Pick 2 males and 2 females
              const males = availableMales.slice(0, 2)
              const females = availableFemales.slice(0, 2)
              const matchPlayers = [males[0], females[0], males[1], females[1]]

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

              matchPlayers.forEach(p => {
                playerMatchCount.set(p.id, (playerMatchCount.get(p.id) || 0) + 1)
              })
            } else {
              // HD or DD
              if (availablePlayers.length < 4) break

              const matchPlayers = availablePlayers.slice(0, 4)

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

              matchPlayers.forEach(p => {
                playerMatchCount.set(p.id, (playerMatchCount.get(p.id) || 0) + 1)
              })
            }

            courtNumber = (courtNumber % maxCourts) + 1
            if (courtNumber === 1) matchNumber++
          }
        }
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
      let matchIndex = 0

      if (isSingles) {
        // Singles elimination
        const players = sortedPlayers
        const numMatches = Math.floor(players.length / 2)

        for (let i = 0; i < numMatches; i++) {
          const match = await prisma.match.create({
            data: {
              tournamentId: tournament.id,
              courtNumber: (matchIndex % 6) + 1,
              matchNumber: Math.floor(matchIndex / 6) + 1,
              status: 'PENDING',
              matchPlayers: {
                create: [
                  { playerId: players[i * 2].id, team: 1, position: 1 },
                  { playerId: players[i * 2 + 1].id, team: 2, position: 1 },
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
          matchIndex++
        }
      } else {
        // Doubles elimination - generate for each match type
        for (const matchType of matchTypes) {
          let playersForType: typeof sortedPlayers = []

          if (matchType === 'MENS_DOUBLES') {
            playersForType = malePlayers
          } else if (matchType === 'WOMENS_DOUBLES') {
            playersForType = femalePlayers
          } else if (matchType === 'MIXED_DOUBLES') {
            // For mixed doubles, pair males with females
            const males = malePlayers
            const females = femalePlayers
            const numPairs = Math.min(Math.floor(males.length / 2), Math.floor(females.length / 2))

            for (let i = 0; i < numPairs; i++) {
              const matchPlayers = [
                males[i * 2],
                females[i * 2],
                males[i * 2 + 1],
                females[i * 2 + 1],
              ]

              const match = await prisma.match.create({
                data: {
                  tournamentId: tournament.id,
                  courtNumber: (matchIndex % 6) + 1,
                  matchNumber: Math.floor(matchIndex / 6) + 1,
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
              matchIndex++
            }
            continue
          }

          if (playersForType.length < 4) continue

          // HD or DD
          const numMatches = Math.floor(playersForType.length / 4)

          for (let i = 0; i < numMatches; i++) {
            const matchPlayers = [
              playersForType[i * 4],
              playersForType[i * 4 + 1],
              playersForType[i * 4 + 2],
              playersForType[i * 4 + 3],
            ]

            const match = await prisma.match.create({
              data: {
                tournamentId: tournament.id,
                courtNumber: (matchIndex % 6) + 1,
                matchNumber: Math.floor(matchIndex / 6) + 1,
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
            matchIndex++
          }
        }
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
