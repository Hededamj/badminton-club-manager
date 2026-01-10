'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Trophy, Target, TrendingUp, ArrowRight, ChevronRight, Medal } from 'lucide-react'

interface DashboardStats {
  overview: {
    activePlayers: number
    totalPlayers: number
    totalTrainings: number
    completedMatches: number
    totalMatches: number
    averageLevel: number
  }
  topPerformers?: Array<{
    player: {
      id: string
      name: string
      level: number
    }
    wins: number
    losses: number
    winRate: number
  }>
}

interface DashboardPremiumProps {
  stats: DashboardStats | null
}

export function DashboardPremium({ stats }: DashboardPremiumProps) {
  const router = useRouter()

  const statCards = [
    {
      label: 'Aktive Spillere',
      value: stats?.overview.activePlayers || 0,
      subtitle: `${stats?.overview.totalPlayers || 0} i alt`,
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      link: '/players',
    },
    {
      label: 'Træninger',
      value: stats?.overview.totalTrainings || 0,
      subtitle: 'Afholdte sessioner',
      icon: Trophy,
      gradient: 'from-purple-500 to-purple-600',
      link: '/trainings',
    },
    {
      label: 'Afholdte Kampe',
      value: stats?.overview.completedMatches || 0,
      subtitle: `${stats?.overview.totalMatches || 0} genereret`,
      icon: Target,
      gradient: 'from-emerald-500 to-emerald-600',
      link: '/statistics',
    },
    {
      label: 'Gennemsnit ELO',
      value: Math.round(stats?.overview.averageLevel || 1500),
      subtitle: 'Klubbens niveau',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-orange-600',
      link: '/statistics',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            <h1 className="text-3xl font-light tracking-tight text-white">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-4">
            Velkommen til Hareskov Badminton
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={() => router.push(stat.link)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient}`} />

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-10`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>

                <div className="mb-1">
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    {stat.label}
                  </div>
                  <div className="text-4xl font-light text-white">
                    {stat.value}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Top Performers */}
      {stats?.topPerformers && stats.topPerformers.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full" />
                <h2 className="text-2xl font-light text-white">
                  Top Performers
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/statistics')}
                className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500"
              >
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {stats.topPerformers.slice(0, 5).map((performer, index) => (
                <div
                  key={performer.player.id}
                  onClick={() => router.push(`/players/${performer.player.id}`)}
                  className="group relative overflow-hidden rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {index < 3 ? (
                        <Medal className={`h-6 w-6 mx-auto ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-slate-300' :
                          'text-orange-400'
                        }`} />
                      ) : (
                        <span className="text-2xl font-light text-slate-500">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-light text-white group-hover:text-blue-300 transition-colors">
                        {performer.player.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        ELO {Math.round(performer.player.level)}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Win Rate</div>
                        <div className="text-lg font-light text-white">
                          {Math.round(performer.winRate)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Sejre</div>
                        <div className="text-lg font-light text-emerald-400">
                          {performer.wins}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Button
          onClick={() => router.push('/trainings/new')}
          className="h-auto p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-900/20 transition-all"
        >
          <div className="text-left w-full">
            <div className="text-lg font-light text-white mb-1">Opret Træning</div>
            <p className="text-xs text-slate-400">Planlæg ny session</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/players')}
          className="h-auto p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-900/20 transition-all"
        >
          <div className="text-left w-full">
            <div className="text-lg font-light text-white mb-1">Administrer Spillere</div>
            <p className="text-xs text-slate-400">Se alle medlemmer</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/statistics')}
          className="h-auto p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 hover:shadow-xl hover:shadow-blue-900/20 transition-all"
        >
          <div className="text-left w-full">
            <div className="text-lg font-light text-white mb-1">Statistik</div>
            <p className="text-xs text-slate-400">Se rankings og data</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
