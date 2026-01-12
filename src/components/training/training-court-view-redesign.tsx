'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Users, Check } from 'lucide-react'

interface Player {
  id: string
  name: string
  level: number
  gender?: 'MALE' | 'FEMALE' | null
}

interface MatchPlayer {
  player: Player
  team: number
  position: number
}

interface Match {
  id: string
  courtNumber: number
  matchNumber: number
  matchPlayers: MatchPlayer[]
  result?: {
    team1Score: number
    team2Score: number
    winningTeam: number
  } | null
}

interface TrainingCourtViewProps {
  matches: Match[]
  onMatchClick: (match: Match) => void
  onEditMatch: (match: Match) => void
  getBenchPlayers: (roundNumber: number) => Player[]
  selectedBenchPlayer: string | null
  selectedMatchPlayer: {playerId: string, matchId: string, team: number, position: number} | null
  onSelectBenchPlayer: (playerId: string) => void
  onClickPlayerPosition: (matchId: string, team: number, position: number, currentPlayerId?: string) => void
  onMoveToBench: () => void
  trainingStatus: string
}

// Track recently changed positions for highlight animation
type PositionKey = string // format: "matchId-team-position"

// Determine match type based on player genders
function getMatchType(players: MatchPlayer[]): { type: 'HD' | 'DD' | 'MD' | null; color: string; label: string } {
  const genders = players.map(mp => mp.player.gender).filter(Boolean)

  if (genders.length < 4) return { type: null, color: '#64748b', label: '–' }

  const maleCount = genders.filter(g => g === 'MALE').length
  const femaleCount = genders.filter(g => g === 'FEMALE').length

  if (maleCount === 4) return { type: 'HD', color: '#3b82f6', label: 'Herre Double' }
  if (femaleCount === 4) return { type: 'DD', color: '#ec4899', label: 'Dame Double' }
  if (maleCount === 2 && femaleCount === 2) return { type: 'MD', color: '#8b5cf6', label: 'Mix Double' }

  return { type: null, color: '#64748b', label: '–' }
}

export function TrainingCourtViewRedesign({
  matches,
  onMatchClick,
  onEditMatch,
  getBenchPlayers,
  selectedBenchPlayer,
  selectedMatchPlayer,
  onSelectBenchPlayer,
  onClickPlayerPosition,
  onMoveToBench,
  trainingStatus,
}: TrainingCourtViewProps) {
  // Track highlighted players for animation
  const [highlightedPlayers, setHighlightedPlayers] = useState<Set<string>>(new Set())
  const prevMatchesRef = useRef<string>('')

  // Detect player changes and highlight them
  useEffect(() => {
    const currentMatchesJson = JSON.stringify(
      matches.map(m => m.matchPlayers.map(mp => `${m.id}-${mp.team}-${mp.position}-${mp.player.id}`))
    )

    if (prevMatchesRef.current && prevMatchesRef.current !== currentMatchesJson) {
      // Find which players changed
      const prevPositions = new Map<string, string>()
      const currentPositions = new Map<string, string>()

      try {
        const prevMatches = JSON.parse(prevMatchesRef.current) as string[][]
        prevMatches.flat().forEach(pos => {
          const parts = pos.split('-')
          const key = `${parts[0]}-${parts[1]}-${parts[2]}`
          prevPositions.set(key, parts[3])
        })
      } catch {}

      matches.forEach(m => {
        m.matchPlayers.forEach(mp => {
          const key = `${m.id}-${mp.team}-${mp.position}`
          currentPositions.set(key, mp.player.id)
        })
      })

      // Find changed positions
      const changedPlayerIds = new Set<string>()
      currentPositions.forEach((playerId, key) => {
        const prevPlayerId = prevPositions.get(key)
        if (prevPlayerId !== playerId) {
          changedPlayerIds.add(playerId)
        }
      })

      if (changedPlayerIds.size > 0) {
        setHighlightedPlayers(changedPlayerIds)
        // Clear highlight after animation
        setTimeout(() => setHighlightedPlayers(new Set()), 800)
      }
    }

    prevMatchesRef.current = currentMatchesJson
  }, [matches])

  // Group matches by round (matchNumber)
  const matchesPerRound = 3
  const rounds: Match[][] = []

  for (let i = 1; i <= matchesPerRound; i++) {
    const roundMatches = matches
      .filter(m => m.matchNumber === i)
      .sort((a, b) => a.courtNumber - b.courtNumber)
    rounds.push(roundMatches)
  }

  return (
    <div>
      {/* Rounds */}
      <div className="space-y-8">
        {rounds.map((roundMatches, roundIndex) => {
          if (roundMatches.length === 0) return null

          const roundNumber = roundIndex + 1
          const benchPlayers = getBenchPlayers(roundNumber)

          return (
            <div key={roundIndex} className="py-6 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-50 border-2 border-slate-200 space-y-6">
              {/* Round Header */}
              <div className="flex items-center gap-4 px-4 md:px-6">
                <div className="flex items-baseline gap-3">
                  <div className="text-6xl font-black text-slate-200 leading-none select-none">
                    {roundNumber}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      KAMP {roundNumber}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {roundMatches.length} baner i spil
                    </p>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
              </div>

              {/* Bench Section for this round */}
              {trainingStatus === 'IN_PROGRESS' && (benchPlayers.length > 0 || selectedMatchPlayer) && (
                <div className="bg-card border rounded-lg p-4 md:p-6 shadow-lg mx-4 md:mx-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-[#005A9C]">
                        Bænk - Runde {roundNumber}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {selectedMatchPlayer
                          ? 'Spilleren vil blive flyttet til bænken for denne runde'
                          : selectedBenchPlayer
                            ? 'Klik på en position for at indsætte'
                            : `${benchPlayers.length} spillere på bænken`}
                      </p>
                    </div>
                    {selectedMatchPlayer && (
                      <Button
                        onClick={onMoveToBench}
                        size="lg"
                        className="bg-[#005A9C] hover:bg-[#004A7C] active:bg-[#003A6C] text-white font-bold shadow-lg touch-manipulation"
                      >
                        <span className="hidden sm:inline">Sæt på bænk</span>
                        <span className="sm:hidden">Bænk</span>
                      </Button>
                    )}
                  </div>
                  {benchPlayers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {benchPlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => onSelectBenchPlayer(player.id)}
                          className={`
                            px-3 md:px-4 py-3 rounded-lg font-medium text-sm transition-all min-h-[48px] touch-manipulation
                            ${selectedBenchPlayer === player.id
                              ? 'bg-[#005A9C] text-white shadow-lg scale-105'
                              : 'bg-card border hover:bg-muted active:bg-muted'
                            }
                          `}
                        >
                          <span className="font-bold">{player.name}</span>
                          <span className="ml-2 opacity-70 text-xs">({Math.round(player.level)})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {benchPlayers.length === 0 && !selectedMatchPlayer && (
                    <p className="text-sm text-muted-foreground italic">Ingen spillere på bænken i denne runde</p>
                  )}
                </div>
              )}

              {/* Match Grid - Horizontal scroll */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {/* Left spacer for alignment */}
                <div className="flex-shrink-0 w-4 md:w-6" />
                {roundMatches.map(match => {
                  const team1 = match.matchPlayers.filter(mp => mp.team === 1)
                  const team2 = match.matchPlayers.filter(mp => mp.team === 2)
                  const matchType = getMatchType(match.matchPlayers)
                  const isCompleted = !!match.result

                  return (
                    <div
                      key={match.id}
                      className="group relative bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-slate-300 transition-all hover:shadow-lg flex-shrink-0 w-[300px] md:w-[240px] snap-start"
                    >
                      {/* Match Type Color Bar */}
                      <div
                        className="h-2"
                        style={{ backgroundColor: matchType.color }}
                      />

                      {/* Court Number Header */}
                      <div className="px-5 pt-4 pb-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">
                              BANE
                            </span>
                            <span className="text-xl font-black text-slate-900">
                              {match.courtNumber}
                            </span>
                          </div>
                          {matchType.type && (
                            <Badge
                              className="text-xs font-bold border-0 text-white"
                              style={{ backgroundColor: matchType.color }}
                            >
                              {matchType.type}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Match Content */}
                      <div className="p-5 space-y-3">
                        {/* Team 1 (Blue) */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                            Hold 1
                          </div>
                          {[1, 2].map(position => {
                            const mp = team1.find(p => p.position === position)
                            const isSelected = selectedMatchPlayer?.playerId === mp?.player.id
                            const isHighlighted = mp && highlightedPlayers.has(mp.player.id)
                            return (
                              <div
                                key={position}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (trainingStatus === 'IN_PROGRESS' && !isCompleted) {
                                    onClickPlayerPosition(match.id, 1, position, mp?.player.id)
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded transition-all min-h-[44px] touch-manipulation ${
                                  isHighlighted
                                    ? 'bg-green-200 border-2 border-green-500 animate-pulse'
                                    : trainingStatus === 'IN_PROGRESS' && !isCompleted
                                    ? isSelected
                                      ? 'cursor-pointer bg-blue-200 border-2 border-blue-500 shadow-md'
                                      : mp
                                      ? 'cursor-pointer hover:bg-blue-50 active:bg-blue-100 border-2 border-transparent hover:border-blue-300'
                                      : selectedBenchPlayer || selectedMatchPlayer
                                      ? 'cursor-pointer hover:bg-green-100 active:bg-green-200 border-2 border-dashed border-gray-300'
                                      : 'border-2 border-transparent'
                                    : 'border-2 border-transparent'
                                }`}
                              >
                                {mp ? (
                                  <div className="flex items-center justify-between w-full">
                                    {isHighlighted && (
                                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-slate-900 text-sm leading-tight break-words flex-1 mr-2">
                                      {mp.player.name}
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">
                                      {Math.round(mp.player.level)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">Tom position</span>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-xs font-black text-slate-400">VS</span>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Team 2 (Red) */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-red-600 uppercase tracking-wide">
                            Hold 2
                          </div>
                          {[1, 2].map(position => {
                            const mp = team2.find(p => p.position === position)
                            const isSelected = selectedMatchPlayer?.playerId === mp?.player.id
                            const isHighlighted = mp && highlightedPlayers.has(mp.player.id)
                            return (
                              <div
                                key={position}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (trainingStatus === 'IN_PROGRESS' && !isCompleted) {
                                    onClickPlayerPosition(match.id, 2, position, mp?.player.id)
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded transition-all min-h-[44px] touch-manipulation ${
                                  isHighlighted
                                    ? 'bg-green-200 border-2 border-green-500 animate-pulse'
                                    : trainingStatus === 'IN_PROGRESS' && !isCompleted
                                    ? isSelected
                                      ? 'cursor-pointer bg-red-200 border-2 border-red-500 shadow-md'
                                      : mp
                                      ? 'cursor-pointer hover:bg-red-50 active:bg-red-100 border-2 border-transparent hover:border-red-300'
                                      : selectedBenchPlayer || selectedMatchPlayer
                                      ? 'cursor-pointer hover:bg-green-100 active:bg-green-200 border-2 border-dashed border-gray-300'
                                      : 'border-2 border-transparent'
                                    : 'border-2 border-transparent'
                                }`}
                              >
                                {mp ? (
                                  <div className="flex items-center justify-between w-full">
                                    {isHighlighted && (
                                      <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                    )}
                                    <span className="font-medium text-slate-900 text-sm leading-tight break-words flex-1 mr-2">
                                      {mp.player.name}
                                    </span>
                                    <span className="text-xs font-mono text-slate-500 flex-shrink-0">
                                      {Math.round(mp.player.level)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">Tom position</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Result or Actions */}
                      <div className="px-5 pb-5">
                        {isCompleted ? (
                          <div className="bg-slate-100 rounded-lg p-3 text-center">
                            <div className="text-2xl font-black text-slate-900">
                              {match.result!.team1Score} - {match.result!.team2Score}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              {match.result!.winningTeam === 1 ? 'Hold 1 vandt' : 'Hold 2 vandt'}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="lg"
                              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 font-semibold text-base py-6 touch-manipulation"
                              onClick={() => onMatchClick(match)}
                            >
                              Resultat
                            </Button>
                            {trainingStatus === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEditMatch(match)}
                                className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rediger spillere
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {/* Right spacer for alignment */}
                <div className="flex-shrink-0 w-4 md:w-6" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
