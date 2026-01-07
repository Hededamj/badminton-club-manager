'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Player {
  id: string
  name: string
  level: number
}

interface Match {
  id: string
  courtNumber: number
  matchNumber: number
  status: string
  matchPlayers: Array<{
    player: Player
    team: number
  }>
  result?: {
    team1Score: number
    team2Score: number
    winningTeam: number
  } | null
}

interface TournamentBracketProps {
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN' | 'SWISS'
  matches: Match[]
  players: Array<{ player: Player }>
}

export function TournamentBracket({ format, matches, players }: TournamentBracketProps) {
  if (format === 'SINGLE_ELIMINATION') {
    return <SingleEliminationBracket matches={matches} />
  }

  if (format === 'DOUBLE_ELIMINATION') {
    return <DoubleEliminationBracket matches={matches} />
  }

  if (format === 'ROUND_ROBIN') {
    return <RoundRobinStandings matches={matches} players={players} />
  }

  if (format === 'SWISS') {
    return <SwissStandings matches={matches} players={players} />
  }

  return null
}

// Single Elimination Bracket
function SingleEliminationBracket({ matches }: { matches: Match[] }) {
  // Calculate number of rounds based on number of matches
  // For single elimination: total matches = players - 1
  // Round 1 has n/2 matches, Round 2 has n/4, etc.
  const totalMatches = matches.length
  const rounds = Math.ceil(Math.log2(totalMatches + 1))

  // Group matches by round
  const matchesByRound: Match[][] = []
  let matchIndex = 0

  for (let round = 0; round < rounds; round++) {
    const matchesInRound = Math.ceil(totalMatches / Math.pow(2, round)) - matchesByRound.reduce((sum, r) => sum + r.length, 0)
    matchesByRound[round] = matches.slice(matchIndex, matchIndex + Math.max(1, matchesInRound))
    matchIndex += matchesInRound
  }

  const roundNames = ['Første runde', 'Kvartfinale', 'Semifinale', 'Finale']

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Single Elimination Bracket</h3>
      <div className="flex gap-8 overflow-x-auto pb-4">
        {matchesByRound.map((roundMatches, roundIndex) => {
          const roundName = roundNames[rounds - roundIndex - 1] || `Runde ${roundIndex + 1}`

          return (
            <div key={roundIndex} className="flex flex-col gap-4 min-w-[300px]">
              <h4 className="text-sm font-semibold text-muted-foreground text-center">
                {roundName}
              </h4>
              <div className="flex flex-col gap-6">
                {roundMatches.map((match) => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Double Elimination Bracket
function DoubleEliminationBracket({ matches }: { matches: Match[] }) {
  // Split matches into winners and losers bracket
  // For simplicity, assume first half is winners, second half is losers
  const midpoint = Math.ceil(matches.length / 2)
  const winnersBracket = matches.slice(0, midpoint)
  const losersBracket = matches.slice(midpoint)

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Winners Bracket</h3>
        <SingleEliminationBracket matches={winnersBracket} />
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Losers Bracket</h3>
        <SingleEliminationBracket matches={losersBracket} />
      </div>
    </div>
  )
}

// Round Robin Standings
function RoundRobinStandings({ matches, players }: { matches: Match[], players: Array<{ player: Player }> }) {
  // Calculate standings
  const standings = players.map(({ player }) => {
    const playerMatches = matches.filter(m =>
      m.matchPlayers.some(mp => mp.player.id === player.id)
    )

    let wins = 0
    let losses = 0
    let points = 0

    playerMatches.forEach(match => {
      if (!match.result) return

      const playerTeam = match.matchPlayers.find(mp => mp.player.id === player.id)?.team
      if (!playerTeam) return

      if (match.result.winningTeam === playerTeam) {
        wins++
        points += 2
      } else {
        losses++
      }
    })

    return {
      player,
      played: playerMatches.length,
      wins,
      losses,
      points,
    }
  })

  // Sort by points (descending), then wins, then level
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.wins !== a.wins) return b.wins - a.wins
    return b.player.level - a.player.level
  })

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Round Robin Stillinger</h3>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-semibold text-sm">Placering</th>
              <th className="text-left p-3 font-semibold text-sm">Spiller</th>
              <th className="text-center p-3 font-semibold text-sm">Spillet</th>
              <th className="text-center p-3 font-semibold text-sm">Vundet</th>
              <th className="text-center p-3 font-semibold text-sm">Tabt</th>
              <th className="text-center p-3 font-semibold text-sm">Point</th>
              <th className="text-center p-3 font-semibold text-sm">Niveau</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr
                key={standing.player.id}
                className={`border-t ${index < 3 ? 'bg-primary/5' : ''}`}
              >
                <td className="p-3 font-bold">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `${index + 1}.`}
                </td>
                <td className="p-3 font-medium">{standing.player.name}</td>
                <td className="p-3 text-center">{standing.played}</td>
                <td className="p-3 text-center text-green-600 font-semibold">{standing.wins}</td>
                <td className="p-3 text-center text-red-600">{standing.losses}</td>
                <td className="p-3 text-center font-bold">{standing.points}</td>
                <td className="p-3 text-center text-muted-foreground">
                  {Math.round(standing.player.level)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alle kampe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {matches.map((match, index) => (
            <div key={match.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Kamp {index + 1}</span>
                {match.result ? (
                  <Badge variant="outline">
                    {match.result.team1Score} - {match.result.team2Score}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Ikke spillet</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  {match.matchPlayers.filter(mp => mp.team === 1).map(mp => (
                    <div key={mp.player.id}>{mp.player.name}</div>
                  ))}
                </div>
                <div>
                  {match.matchPlayers.filter(mp => mp.team === 2).map(mp => (
                    <div key={mp.player.id}>{mp.player.name}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Swiss System Standings
function SwissStandings({ matches, players }: { matches: Match[], players: Array<{ player: Player }> }) {
  // Swiss system is similar to Round Robin but uses standings component
  return <RoundRobinStandings matches={matches} players={players} />
}

// Bracket Match Component
function BracketMatch({ match }: { match: Match }) {
  const team1 = match.matchPlayers.filter(mp => mp.team === 1)
  const team2 = match.matchPlayers.filter(mp => mp.team === 2)
  const hasResult = !!match.result
  const winner = hasResult ? match.result!.winningTeam : null

  return (
    <Card className={hasResult ? 'border-primary/50' : ''}>
      <CardContent className="p-4 space-y-2">
        {/* Team 1 */}
        <div
          className={`p-2 rounded border ${
            winner === 1 ? 'bg-green-50 border-green-500 font-semibold' : 'bg-background'
          }`}
        >
          {team1.length > 0 ? (
            <div className="space-y-0.5">
              {team1.map(mp => (
                <div key={mp.player.id} className="text-sm flex items-center justify-between">
                  <span>{mp.player.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {Math.round(mp.player.level)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">TBD</div>
          )}
        </div>

        {/* Score */}
        {hasResult && (
          <div className="text-center py-1">
            <Badge variant="outline" className="font-mono">
              {match.result!.team1Score} - {match.result!.team2Score}
            </Badge>
          </div>
        )}

        {/* Team 2 */}
        <div
          className={`p-2 rounded border ${
            winner === 2 ? 'bg-green-50 border-green-500 font-semibold' : 'bg-background'
          }`}
        >
          {team2.length > 0 ? (
            <div className="space-y-0.5">
              {team2.map(mp => (
                <div key={mp.player.id} className="text-sm flex items-center justify-between">
                  <span>{mp.player.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {Math.round(mp.player.level)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">TBD</div>
          )}
        </div>

        {!hasResult && (
          <div className="text-center pt-1">
            <Badge variant="secondary" className="text-xs">Afventer resultat</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
