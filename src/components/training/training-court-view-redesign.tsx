'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Users } from 'lucide-react'

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
  benchPlayers: Player[]
  selectedBenchPlayer: string | null
  onSelectBenchPlayer: (playerId: string) => void
  trainingStatus: string
}

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
  benchPlayers,
  selectedBenchPlayer,
  onSelectBenchPlayer,
  trainingStatus,
}: TrainingCourtViewProps) {
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
    <div className="space-y-8">
      {/* Bench Section */}
      {trainingStatus === 'IN_PROGRESS' && benchPlayers.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-2 border-orange-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.1),transparent_50%)]" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
              <div>
                <h3 className="text-lg font-bold text-orange-900 tracking-tight">
                  BÆNK
                </h3>
                <p className="text-sm text-orange-700">
                  {selectedBenchPlayer ? 'Klik på en position for at indsætte' : 'Vælg en spiller'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {benchPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => onSelectBenchPlayer(player.id)}
                  className={`
                    px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                    ${selectedBenchPlayer === player.id
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-white text-orange-900 hover:bg-orange-100 border-2 border-orange-200'
                    }
                  `}
                >
                  <span className="font-bold">{player.name}</span>
                  <span className="ml-2 opacity-70 text-xs">({Math.round(player.level)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rounds */}
      <div className="space-y-12">
        {rounds.map((roundMatches, roundIndex) => {
          if (roundMatches.length === 0) return null

          return (
            <div key={roundIndex} className="space-y-6">
              {/* Round Header */}
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-3">
                  <div className="text-6xl font-black text-slate-200 leading-none select-none">
                    {roundIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      KAMP {roundIndex + 1}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {roundMatches.length} baner i spil
                    </p>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
              </div>

              {/* Match Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {roundMatches.map(match => {
                  const team1 = match.matchPlayers.filter(mp => mp.team === 1)
                  const team2 = match.matchPlayers.filter(mp => mp.team === 2)
                  const matchType = getMatchType(match.matchPlayers)
                  const isCompleted = !!match.result

                  return (
                    <div
                      key={match.id}
                      className="group relative bg-white rounded-xl border-2 border-slate-200 overflow-hidden hover:border-slate-300 transition-all hover:shadow-lg"
                    >
                      {/* Match Type Color Bar */}
                      <div
                        className="h-2"
                        style={{ backgroundColor: matchType.color }}
                      />

                      {/* Court Number Header */}
                      <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-100">
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
                      <div className="p-4 space-y-3">
                        {/* Team 1 (Blue) */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                            Hold 1
                          </div>
                          {team1.map((mp, idx) => (
                            <div
                              key={mp.player.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-medium text-slate-900 truncate">
                                {mp.player.name}
                              </span>
                              <span className="text-xs font-mono text-slate-500 ml-2 flex-shrink-0">
                                {Math.round(mp.player.level)}
                              </span>
                            </div>
                          ))}
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
                          {team2.map((mp, idx) => (
                            <div
                              key={mp.player.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-medium text-slate-900 truncate">
                                {mp.player.name}
                              </span>
                              <span className="text-xs font-mono text-slate-500 ml-2 flex-shrink-0">
                                {Math.round(mp.player.level)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Result or Actions */}
                      <div className="px-4 pb-4">
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
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-slate-900 hover:bg-slate-800"
                              onClick={() => onMatchClick(match)}
                            >
                              Resultat
                            </Button>
                            {trainingStatus === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEditMatch(match)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
