'use client'

import Link from 'next/link'
import { Trophy, TrendingUp, Users, Target, Award, Medal, Crown, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Statistics {
  overview: {
    totalPlayers: number
    activePlayers: number
    totalTrainings: number
    totalMatches: number
    completedMatches: number
    averageLevel: number
  }
  topPerformers: Array<{
    player: {
      id: string
      name: string
      level: number
    }
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }>
  recentTrainings: Array<{
    id: string
    name: string
    date: string
    trainingPlayers: any[]
    _count: {
      matches: number
    }
  }>
}

interface RankingPlayer {
  id: string
  name: string
  level: number
  rank: number
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
  } | null
}

interface StatisticsRedesignProps {
  statistics: Statistics
  rankings: RankingPlayer[]
}

export function StatisticsRedesign({ statistics, rankings }: StatisticsRedesignProps) {
  const topThree = rankings.slice(0, 3)
  const restOfTop10 = rankings.slice(3, 10)

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-yellow-500 to-blue-500 rounded-full" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                STATISTIK & RANGLISTE
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Klubbens statistik, ranglister og top præstationer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Players */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Spillere
              </span>
            </div>
            <div className="text-5xl font-black text-blue-900 mb-1">
              {statistics.overview.activePlayers}
            </div>
            <p className="text-sm text-blue-700 font-medium">
              {statistics.overview.totalPlayers} i alt
            </p>
          </div>
        </div>

        {/* Average ELO */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                Gns. ELO
              </span>
            </div>
            <div className="text-5xl font-black text-purple-900 mb-1">
              {Math.round(statistics.overview.averageLevel)}
            </div>
            <p className="text-sm text-purple-700 font-medium">
              Klubbens gennemsnit
            </p>
          </div>
        </div>

        {/* Matches */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Kampe
              </span>
            </div>
            <div className="text-5xl font-black text-green-900 mb-1">
              {statistics.overview.completedMatches}
            </div>
            <p className="text-sm text-green-700 font-medium">
              {statistics.overview.totalMatches} genereret
            </p>
          </div>
        </div>

        {/* Trainings */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-2 border-orange-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-orange-600" />
              <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                Træninger
              </span>
            </div>
            <div className="text-5xl font-black text-orange-900 mb-1">
              {statistics.overview.totalTrainings}
            </div>
            <p className="text-sm text-orange-700 font-medium">
              Afholdt i klubben
            </p>
          </div>
        </div>
      </div>

      {/* Podium - Top 3 */}
      {topThree.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(251,191,36,0.1),transparent_60%)]" />

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-10 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  TOP 3 RANGLISTE
                </h2>
                <p className="text-sm text-slate-600">
                  Klubbens bedste spillere efter ELO rating
                </p>
              </div>
            </div>

            {/* Podium Display */}
            <div className="grid md:grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="order-1 md:order-1">
                  <Link href={`/players/${topThree[1].id}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 border-2 border-slate-300 hover:border-slate-400 transition-all hover:shadow-xl cursor-pointer">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.3),transparent_50%)]" />
                      <div className="h-2 bg-gradient-to-r from-slate-400 to-slate-500" />

                      <div className="relative p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg">
                            <Medal className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        <div className="text-6xl font-black text-slate-400 mb-2">
                          #2
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {topThree[1].name}
                        </h3>

                        <div className="inline-block px-4 py-2 rounded-lg bg-slate-200 mb-3">
                          <div className="text-3xl font-black text-slate-900">
                            {Math.round(topThree[1].level)}
                          </div>
                          <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                            ELO
                          </div>
                        </div>

                        {topThree[1].statistics && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="font-bold text-slate-900">{topThree[1].statistics.wins}</div>
                              <div className="text-xs text-slate-600">Sejre</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{Math.round(topThree[1].statistics.winRate)}%</div>
                              <div className="text-xs text-slate-600">Win Rate</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 1st Place - Taller */}
              {topThree[0] && (
                <div className="order-2 md:order-2">
                  <Link href={`/players/${topThree[0].id}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100 border-2 border-yellow-400 hover:border-yellow-500 transition-all hover:shadow-2xl cursor-pointer">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.4),transparent_50%)]" />
                      <div className="h-2 bg-gradient-to-r from-yellow-500 to-amber-600" />

                      <div className="relative p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-2xl">
                            <Crown className="h-10 w-10 text-white" />
                          </div>
                        </div>

                        <div className="text-7xl font-black text-yellow-600 mb-2">
                          #1
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-yellow-700 transition-colors">
                          {topThree[0].name}
                        </h3>

                        <div className="inline-block px-6 py-3 rounded-lg bg-yellow-200 mb-4">
                          <div className="text-4xl font-black text-yellow-900">
                            {Math.round(topThree[0].level)}
                          </div>
                          <div className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
                            ELO
                          </div>
                        </div>

                        {topThree[0].statistics && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-2xl font-black text-slate-900">{topThree[0].statistics.wins}</div>
                              <div className="text-xs text-slate-600 font-bold uppercase">Sejre</div>
                            </div>
                            <div>
                              <div className="text-2xl font-black text-slate-900">{Math.round(topThree[0].statistics.winRate)}%</div>
                              <div className="text-xs text-slate-600 font-bold uppercase">Win Rate</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="order-3 md:order-3">
                  <Link href={`/players/${topThree[2].id}`}>
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 hover:border-amber-400 transition-all hover:shadow-xl cursor-pointer">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.3),transparent_50%)]" />
                      <div className="h-2 bg-gradient-to-r from-amber-600 to-orange-600" />

                      <div className="relative p-6 text-center">
                        <div className="flex justify-center mb-4">
                          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg">
                            <Medal className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        <div className="text-6xl font-black text-amber-600 mb-2">
                          #3
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-700 transition-colors">
                          {topThree[2].name}
                        </h3>

                        <div className="inline-block px-4 py-2 rounded-lg bg-amber-200 mb-3">
                          <div className="text-3xl font-black text-amber-900">
                            {Math.round(topThree[2].level)}
                          </div>
                          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                            ELO
                          </div>
                        </div>

                        {topThree[2].statistics && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="font-bold text-slate-900">{topThree[2].statistics.wins}</div>
                              <div className="text-xs text-slate-600">Sejre</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{Math.round(topThree[2].statistics.winRate)}%</div>
                              <div className="text-xs text-slate-600">Win Rate</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Performers by Win Rate */}
      {statistics.topPerformers && statistics.topPerformers.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.08),transparent_50%)]" />

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  TOP PERFORMERS
                </h2>
                <p className="text-sm text-slate-600">
                  Bedst sejrsrate (min. 5 kampe)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {statistics.topPerformers.slice(0, 5).map((performer, index) => (
                <Link key={performer.player.id} href={`/players/${performer.player.id}`}>
                  <div className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100">
                      {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                      {index === 1 && <Medal className="h-6 w-6 text-slate-400" />}
                      {index === 2 && <Medal className="h-6 w-6 text-amber-600" />}
                      {index > 2 && <span className="text-xl font-black text-slate-600">#{index + 1}</span>}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors truncate">
                        {performer.player.name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>ELO: <span className="font-mono font-bold">{Math.round(performer.player.level)}</span></span>
                        <span className="text-slate-400">•</span>
                        <span>{performer.wins}W - {performer.losses}L</span>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-3xl font-black text-green-600">
                        {Math.round(performer.winRate)}%
                      </div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Win Rate
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                FULD RANGLISTE
              </h2>
              <p className="text-sm text-slate-600">
                Alle aktive spillere sorteret efter ELO
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {rankings.map((player) => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="text-lg font-black text-slate-400">
                      #{player.rank}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                      {player.name}
                    </span>
                  </div>

                  {/* ELO */}
                  <div className="flex-shrink-0">
                    <Badge className="bg-blue-100 text-blue-900 font-black text-base px-3 py-1">
                      {Math.round(player.level)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  {player.statistics && (
                    <>
                      <div className="hidden md:block flex-shrink-0 w-20 text-center text-sm">
                        <span className="text-slate-600">{player.statistics.totalMatches} kampe</span>
                      </div>
                      <div className="hidden lg:flex flex-shrink-0 gap-4">
                        <div className="text-center text-sm">
                          <div className="font-bold text-green-600">{player.statistics.wins}</div>
                          <div className="text-xs text-slate-500">W</div>
                        </div>
                        <div className="text-center text-sm">
                          <div className="font-bold text-red-600">{player.statistics.losses}</div>
                          <div className="text-xs text-slate-500">L</div>
                        </div>
                        <div className="text-center text-sm">
                          <div className="font-bold text-slate-900">{Math.round(player.statistics.winRate)}%</div>
                          <div className="text-xs text-slate-500">Rate</div>
                        </div>
                      </div>
                      {player.statistics.currentStreak !== 0 && (
                        <div className="flex-shrink-0">
                          <Badge className={`${player.statistics.currentStreak > 0 ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'} font-bold`}>
                            {player.statistics.currentStreak > 0 ? '+' : ''}{player.statistics.currentStreak}
                            <Zap className="ml-1 h-3 w-3 inline" />
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
