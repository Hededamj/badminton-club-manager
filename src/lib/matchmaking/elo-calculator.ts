/**
 * ELO Rating System for Badminton Doubles
 *
 * K-factor: 32 (standard volatility)
 * Initial rating: 1500
 * Team rating: Average of two players
 */

const K_FACTOR = 32

/**
 * Calculate expected score for a player/team
 * @param ratingA - Rating of player/team A
 * @param ratingB - Rating of player/team B
 * @returns Expected score (0-1) for team A
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Calculate new ELO rating after a match
 * @param currentRating - Current player rating
 * @param expectedScore - Expected score (0-1)
 * @param actualScore - Actual score (1 for win, 0 for loss)
 * @returns New rating
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number
): number {
  return Math.round(currentRating + K_FACTOR * (actualScore - expectedScore))
}

/**
 * Calculate team rating (average of two players)
 */
export function calculateTeamRating(player1Level: number, player2Level: number): number {
  return (player1Level + player2Level) / 2
}

/**
 * Calculate ELO changes for all 4 players in a doubles match
 * @param team1Players - Array of two player levels for team 1
 * @param team2Players - Array of two player levels for team 2
 * @param team1Won - Whether team 1 won
 * @returns Object with new ratings for each player
 */
export function calculateMatchEloChanges(
  team1Players: number[],
  team2Players: number[],
  team1Won: boolean
): {
  team1NewRatings: number[]
  team2NewRatings: number[]
  team1Change: number
  team2Change: number
} {
  if (team1Players.length !== 2 || team2Players.length !== 2) {
    throw new Error('Each team must have exactly 2 players')
  }

  const team1Rating = calculateTeamRating(team1Players[0], team1Players[1])
  const team2Rating = calculateTeamRating(team2Players[0], team2Players[1])

  const team1ExpectedScore = calculateExpectedScore(team1Rating, team2Rating)
  const team2ExpectedScore = 1 - team1ExpectedScore

  const team1ActualScore = team1Won ? 1 : 0
  const team2ActualScore = team1Won ? 0 : 1

  // Calculate changes
  const team1Change = Math.round(K_FACTOR * (team1ActualScore - team1ExpectedScore))
  const team2Change = Math.round(K_FACTOR * (team2ActualScore - team2ExpectedScore))

  // Apply changes to both players on each team
  const team1NewRatings = team1Players.map(rating => rating + team1Change)
  const team2NewRatings = team2Players.map(rating => rating + team2Change)

  return {
    team1NewRatings,
    team2NewRatings,
    team1Change,
    team2Change,
  }
}

/**
 * Calculate rating difference impact
 * Higher difference = less balanced match
 */
export function calculateBalanceScore(team1Rating: number, team2Rating: number): number {
  const diff = Math.abs(team1Rating - team2Rating)
  // Normalize to 0-1 scale (0 = perfect balance, 1 = very imbalanced)
  // Assume 200 points difference is highly imbalanced
  return Math.min(diff / 200, 1)
}
