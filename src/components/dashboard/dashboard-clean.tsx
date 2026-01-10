'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Trophy, Target, TrendingUp, ArrowRight, ChevronRight } from 'lucide-react'

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

interface DashboardCleanProps {
  stats: DashboardStats | null
}

export function DashboardClean({ stats }: DashboardCleanProps) {
  const router = useRouter()

  const statCards = [
    {
      label: 'Aktive Spillere',
      value: stats?.overview.activePlayers || 0,
      subtitle: `${stats?.overview.totalPlayers || 0} i alt`,
      icon: Users,
      link: '/players',
    },
    {
      label: 'Træninger',
      value: stats?.overview.totalTrainings || 0,
      subtitle: 'Afholdte sessioner',
      icon: Trophy,
      link: '/trainings',
    },
    {
      label: 'Afholdte Kampe',
      value: stats?.overview.completedMatches || 0,
      subtitle: `${stats?.overview.totalMatches || 0} genereret`,
      icon: Target,
      link: '/statistics',
    },
    {
      label: 'Gennemsnit ELO',
      value: Math.round(stats?.overview.averageLevel || 1500),
      subtitle: 'Klubbens niveau',
      icon: TrendingUp,
      link: '/statistics',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#005A9C]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Velkommen til Hareskov Badminton
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={() => router.push(stat.link)}
              className="group bg-card border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-[#005A9C]/10">
                  <Icon className="h-6 w-6 text-[#005A9C]" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors" />
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

      {/* Top Performers */}
      {stats?.topPerformers && stats.topPerformers.length > 0 && (
        <div className="bg-card border rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#005A9C]">
              Top Performers
            </h2>
            <Button
              variant="outline"
              onClick={() => router.push('/statistics')}
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
                className="group flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[#005A9C]/10 text-lg font-bold text-[#005A9C]">
                  {index + 1}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-[#005A9C] transition-colors">
                    {performer.player.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ELO {Math.round(performer.player.level)}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                    <div className="text-lg font-semibold">
                      {Math.round(performer.winRate)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Sejre</div>
                    <div className="text-lg font-semibold text-green-600">
                      {performer.wins}
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Button
          onClick={() => router.push('/trainings/new')}
          variant="outline"
          className="h-auto p-6 justify-start"
        >
          <div className="text-left">
            <div className="font-semibold mb-1">Opret Træning</div>
            <p className="text-xs text-muted-foreground">Planlæg ny session</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/players')}
          variant="outline"
          className="h-auto p-6 justify-start"
        >
          <div className="text-left">
            <div className="font-semibold mb-1">Administrer Spillere</div>
            <p className="text-xs text-muted-foreground">Se alle medlemmer</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/statistics')}
          variant="outline"
          className="h-auto p-6 justify-start"
        >
          <div className="text-left">
            <div className="font-semibold mb-1">Statistik</div>
            <p className="text-xs text-muted-foreground">Se rankings og data</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
