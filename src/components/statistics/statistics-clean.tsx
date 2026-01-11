'use client'

import Link from 'next/link'
import { Trophy, TrendingUp, Users, Target, ChevronRight, Medal, Crown } from 'lucide-react'

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

interface StatisticsCleanProps {
  statistics: Statistics
  rankings: RankingPlayer[]
}

export function StatisticsClean({ statistics, rankings }: StatisticsCleanProps) {
  const topThree = rankings.slice(0, 3)

  const statCards = [
    {
      label: 'Aktive Spillere',
      value: statistics.overview.activePlayers,
      subtitle: `${statistics.overview.totalPlayers} i alt`,
      icon: Users,
    },
    {
      label: 'Gennemsnit ELO',
      value: Math.round(statistics.overview.averageLevel),
      subtitle: 'Klubbens niveau',
      icon: TrendingUp,
    },
    {
      label: 'Afholdte Kampe',
      value: statistics.overview.completedMatches,
      subtitle: `${statistics.overview.totalMatches} genereret`,
      icon: Target,
    },
    {
      label: 'Træninger',
      value: statistics.overview.totalTrainings,
      subtitle: 'Afholdt i klubben',
      icon: Trophy,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#005A9C]">Statistik & Rangliste</h1>
        <p className="text-muted-foreground mt-1">
          Klubbens statistik, ranglister og top præstationer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-card border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-[#005A9C]/10">
                  <Icon className="h-6 w-6 text-[#005A9C]" />
                </div>
              </div>

              <div className="mb-1">
                <div className="text-sm text-muted-foreground mb-2">
                  {stat.label}
                </div>
                <div className="text-4xl font-bold">
                  {stat.value}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {stat.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="bg-card border rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#005A9C]">
              Top 3 Rangliste
            </h2>
            <p className="text-muted-foreground text-sm">
              Klubbens bedste spillere efter ELO rating
            </p>
          </div>

          {/* Podium Display */}
          <div className="grid md:grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-1 md:order-1">
                <Link href={`/players/${topThree[1].id}`}>
                  <div className="group bg-card border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer">
                    {/* Silver Medal */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted">
                        <Medal className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-5xl font-bold text-muted-foreground mb-2">
                        #2
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-[#005A9C] transition-colors">
                        {topThree[1].name}
                      </h3>

                      <div className="inline-block px-4 py-2 rounded-lg bg-muted mb-3">
                        <div className="text-2xl font-bold">
                          {Math.round(topThree[1].level)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ELO
                        </div>
                      </div>

                      {topThree[1].statistics && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="font-semibold">{topThree[1].statistics.wins}</div>
                            <div className="text-xs text-muted-foreground">Sejre</div>
                          </div>
                          <div>
                            <div className="font-semibold">{Math.round(topThree[1].statistics.winRate)}%</div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
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
                  <div className="group bg-card border-2 border-[#005A9C] rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
                    {/* Gold Crown */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[#005A9C]">
                        <Crown className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-6xl font-bold text-[#005A9C] mb-2">
                        #1
                      </div>

                      <h3 className="text-xl font-bold mb-4 group-hover:text-[#005A9C] transition-colors">
                        {topThree[0].name}
                      </h3>

                      <div className="inline-block px-6 py-3 rounded-lg bg-[#005A9C]/10 mb-4">
                        <div className="text-3xl font-bold text-[#005A9C]">
                          {Math.round(topThree[0].level)}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">
                          ELO
                        </div>
                      </div>

                      {topThree[0].statistics && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xl font-bold">{topThree[0].statistics.wins}</div>
                            <div className="text-xs text-muted-foreground">Sejre</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold">{Math.round(topThree[0].statistics.winRate)}%</div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
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
                  <div className="group bg-card border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer">
                    {/* Bronze Medal */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted">
                        <Medal className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-5xl font-bold text-muted-foreground mb-2">
                        #3
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-[#005A9C] transition-colors">
                        {topThree[2].name}
                      </h3>

                      <div className="inline-block px-4 py-2 rounded-lg bg-muted mb-3">
                        <div className="text-2xl font-bold">
                          {Math.round(topThree[2].level)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ELO
                        </div>
                      </div>

                      {topThree[2].statistics && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="font-semibold">{topThree[2].statistics.wins}</div>
                            <div className="text-xs text-muted-foreground">Sejre</div>
                          </div>
                          <div>
                            <div className="font-semibold">{Math.round(topThree[2].statistics.winRate)}%</div>
                            <div className="text-xs text-muted-foreground">Win Rate</div>
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
      )}

      {/* Top Performers by Win Rate */}
      {statistics.topPerformers && statistics.topPerformers.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#005A9C]">
              Top Performers
            </h2>
            <p className="text-muted-foreground text-sm">
              Bedst sejrsrate (min. 5 kampe)
            </p>
          </div>

          <div className="space-y-3">
            {statistics.topPerformers.slice(0, 5).map((performer, index) => (
              <Link key={performer.player.id} href={`/players/${performer.player.id}`}>
                <div className="group flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[#005A9C]/10">
                    {index === 0 && <Crown className="h-5 w-5 text-[#005A9C]" />}
                    {index === 1 && <Medal className="h-5 w-5 text-muted-foreground" />}
                    {index === 2 && <Medal className="h-5 w-5 text-muted-foreground" />}
                    {index > 2 && <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold group-hover:text-[#005A9C] transition-colors truncate">
                      {performer.player.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>ELO {Math.round(performer.player.level)}</span>
                      <span>•</span>
                      <span>{performer.wins}W - {performer.losses}L</span>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-[#005A9C]">
                      {Math.round(performer.winRate)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Win Rate
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="bg-card border rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#005A9C]">
            Fuld Rangliste
          </h2>
          <p className="text-muted-foreground text-sm">
            Alle aktive spillere sorteret efter ELO
          </p>
        </div>

        <div className="space-y-2">
          {rankings.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-base font-bold text-muted-foreground">
                    #{player.rank}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span className="font-semibold group-hover:text-[#005A9C] transition-colors truncate block">
                    {player.name}
                  </span>
                </div>

                {/* ELO */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-[#005A9C]/10 text-[#005A9C]">
                    {Math.round(player.level)}
                  </span>
                </div>

                {/* Stats */}
                {player.statistics && (
                  <>
                    <div className="hidden md:block flex-shrink-0 text-sm text-muted-foreground">
                      {player.statistics.totalMatches} kampe
                    </div>
                    <div className="hidden lg:flex flex-shrink-0 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{player.statistics.wins}</div>
                        <div className="text-xs text-muted-foreground">W</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">{player.statistics.losses}</div>
                        <div className="text-xs text-muted-foreground">L</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{Math.round(player.statistics.winRate)}%</div>
                        <div className="text-xs text-muted-foreground">Rate</div>
                      </div>
                    </div>
                    {player.statistics.currentStreak !== 0 && (
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                          player.statistics.currentStreak > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {player.statistics.currentStreak > 0 ? '+' : ''}{player.statistics.currentStreak}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
