import { calculateTeamRating, calculateBalanceScore } from './elo-calculator'

/**
 * Badminton Matchmaking Algorithm
 *
 * Optimization criteria (weighted):
 * - Level fairness (10x): Minimize team strength difference
 * - Partnership variety (5x): Prefer players who haven't partnered recently
 * - Opposition variety (3x): Prefer new matchups
 * - Player rest (8x): Avoid consecutive matches
 */

export interface Player {
  id: string
  name: string
  level: number
}

export interface Match {
  court: number
  matchNumber: number
  team1: [Player, Player]
  team2: [Player, Player]
}

export interface PartnershipHistory {
  player1Id: string
  player2Id: string
  timesPartnered: number
  lastPartnered?: Date
}

export interface OppositionHistory {
  player1Id: string
  player2Id: string
  timesOpposed: number
  lastOpposed?: Date
}

interface MatchScore {
  match: Match
  score: number
  breakdown: {
    levelFairness: number
    partnershipVariety: number
    oppositionVariety: number
    playerRest: number
  }
}

const WEIGHTS = {
  levelFairness: 10,
  partnershipVariety: 5,
  oppositionVariety: 3,
  playerRest: 8,
}

/**
 * Generate all possible team pairings from a list of players
 */
function generateTeamPairings(players: Player[]): Array<[Player, Player]> {
  const pairs: Array<[Player, Player]> = []

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]])
    }
  }

  return pairs
}

/**
 * Generate all possible matches from team pairings
 */
function generatePossibleMatches(
  teamPairings: Array<[Player, Player]>
): Array<{ team1: [Player, Player]; team2: [Player, Player] }> {
  const matches: Array<{ team1: [Player, Player]; team2: [Player, Player] }> = []

  for (let i = 0; i < teamPairings.length; i++) {
    for (let j = i + 1; j < teamPairings.length; j++) {
      const team1 = teamPairings[i]
      const team2 = teamPairings[j]

      // Check no player appears in both teams
      const team1Ids = [team1[0].id, team1[1].id]
      const team2Ids = [team2[0].id, team2[1].id]
      const overlap = team1Ids.some(id => team2Ids.includes(id))

      if (!overlap) {
        matches.push({ team1, team2 })
      }
    }
  }

  return matches
}

/**
 * Get partnership count from history
 */
function getPartnershipCount(
  player1Id: string,
  player2Id: string,
  history: PartnershipHistory[]
): number {
  const partnership = history.find(
    p =>
      (p.player1Id === player1Id && p.player2Id === player2Id) ||
      (p.player1Id === player2Id && p.player2Id === player1Id)
  )
  return partnership?.timesPartnered || 0
}

/**
 * Get opposition count from history
 */
function getOppositionCount(
  player1Id: string,
  player2Id: string,
  history: OppositionHistory[]
): number {
  const opposition = history.find(
    o =>
      (o.player1Id === player1Id && o.player2Id === player2Id) ||
      (o.player1Id === player2Id && o.player2Id === player1Id)
  )
  return opposition?.timesOpposed || 0
}

/**
 * Calculate how recently players had a match
 */
function getPlayerRestScore(playerId: string, recentMatches: Match[]): number {
  // Find most recent match for this player
  for (let i = recentMatches.length - 1; i >= 0; i--) {
    const match = recentMatches[i]
    const playerIds = [
      match.team1[0].id,
      match.team1[1].id,
      match.team2[0].id,
      match.team2[1].id,
    ]

    if (playerIds.includes(playerId)) {
      // Player was in this recent match
      // The more recent, the worse the score
      const matchesAgo = recentMatches.length - i
      return 1 / matchesAgo // 1 for immediate, 0.5 for 2 matches ago, etc.
    }
  }

  return 0 // Player hasn't played recently
}

/**
 * Score a potential match based on all criteria
 */
function scoreMatch(
  match: { team1: [Player, Player]; team2: [Player, Player] },
  partnershipHistory: PartnershipHistory[],
  oppositionHistory: OppositionHistory[],
  recentMatches: Match[]
): MatchScore {
  const team1Rating = calculateTeamRating(match.team1[0].level, match.team1[1].level)
  const team2Rating = calculateTeamRating(match.team2[0].level, match.team2[1].level)

  // 1. Level fairness (0 = perfect, 1 = very imbalanced)
  const levelFairnessScore = calculateBalanceScore(team1Rating, team2Rating)

  // 2. Partnership variety (0 = never partnered, 1 = partnered many times)
  const team1PartnershipCount = getPartnershipCount(
    match.team1[0].id,
    match.team1[1].id,
    partnershipHistory
  )
  const team2PartnershipCount = getPartnershipCount(
    match.team2[0].id,
    match.team2[1].id,
    partnershipHistory
  )
  // Normalize: assume 10+ partnerships is max
  const partnershipVarietyScore =
    Math.min((team1PartnershipCount + team2PartnershipCount) / 20, 1)

  // 3. Opposition variety (0 = never opposed, 1 = opposed many times)
  let totalOppositionCount = 0
  for (const p1 of match.team1) {
    for (const p2 of match.team2) {
      totalOppositionCount += getOppositionCount(p1.id, p2.id, oppositionHistory)
    }
  }
  // Normalize: assume 10+ oppositions is max for all 4 combinations
  const oppositionVarietyScore = Math.min(totalOppositionCount / 40, 1)

  // 4. Player rest (0 = all well-rested, 1 = someone just played)
  const allPlayers = [...match.team1, ...match.team2]
  const restScores = allPlayers.map(p => getPlayerRestScore(p.id, recentMatches))
  const playerRestScore = Math.max(...restScores) // Worst case

  // Calculate weighted total (lower is better)
  const totalScore =
    levelFairnessScore * WEIGHTS.levelFairness +
    partnershipVarietyScore * WEIGHTS.partnershipVariety +
    oppositionVarietyScore * WEIGHTS.oppositionVariety +
    playerRestScore * WEIGHTS.playerRest

  return {
    match: {
      court: 0,
      matchNumber: 0,
      team1: match.team1,
      team2: match.team2,
    },
    score: totalScore,
    breakdown: {
      levelFairness: levelFairnessScore,
      partnershipVariety: partnershipVarietyScore,
      oppositionVariety: oppositionVarietyScore,
      playerRest: playerRestScore,
    },
  }
}

/**
 * Generate matches for a training session
 * @param players - Available players
 * @param courts - Number of courts available
 * @param matchesPerCourt - Number of matches per court
 * @param partnershipHistory - Historical partnership data
 * @param oppositionHistory - Historical opposition data
 * @returns Generated matches
 */
export function generateMatches(
  players: Player[],
  courts: number,
  matchesPerCourt: number,
  partnershipHistory: PartnershipHistory[] = [],
  oppositionHistory: OppositionHistory[] = []
): Match[] {
  if (players.length < 4) {
    throw new Error('Need at least 4 players to generate matches')
  }

  const totalMatches = courts * matchesPerCourt
  const generatedMatches: Match[] = []
  const usedPlayers = new Set<string>()

  // Generate matches for each round
  for (let matchNum = 1; matchNum <= matchesPerCourt; matchNum++) {
    // Generate matches for all courts in this round
    for (let court = 1; court <= courts; court++) {
      const availablePlayers = players.filter(p => !usedPlayers.has(p.id))

      if (availablePlayers.length < 4) {
        // Not enough players for this court, skip
        continue
      }

      // Generate all possible team pairings
      const teamPairings = generateTeamPairings(availablePlayers)
      const possibleMatches = generatePossibleMatches(teamPairings)

      if (possibleMatches.length === 0) {
        continue
      }

      // Score all possible matches
      const scoredMatches = possibleMatches.map(match =>
        scoreMatch(match, partnershipHistory, oppositionHistory, generatedMatches)
      )

      // Sort by score (lower is better)
      scoredMatches.sort((a, b) => a.score - b.score)

      // Select best match
      const bestMatch = scoredMatches[0].match
      bestMatch.court = court
      bestMatch.matchNumber = matchNum

      generatedMatches.push(bestMatch)

      // Mark players as used for this round
      bestMatch.team1.forEach(p => usedPlayers.add(p.id))
      bestMatch.team2.forEach(p => usedPlayers.add(p.id))
    }

    // Clear used players for next round
    usedPlayers.clear()
  }

  return generatedMatches
}
