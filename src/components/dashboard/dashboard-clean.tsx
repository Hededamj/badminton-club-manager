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
    <div className="space-y-4 md:space-y-6 overflow-hidden">
      {/* Header - Compact on mobile */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#005A9C]">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Velkommen til Hareskov Badminton
        </p>
      </div>

      {/* Stats Grid - 2x2 compact on mobile */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              onClick={() => router.push(stat.link)}
              className="group bg-card border rounded-lg p-3 md:p-6 hover:shadow-md transition-all cursor-pointer touch-manipulation"
            >
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-[#005A9C]/10">
                  <Icon className="h-4 w-4 md:h-6 md:w-6 text-[#005A9C]" />
                </div>
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors" />
              </div>

              <div>
                <div className="text-xs md:text-sm text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl md:text-4xl font-bold">
                  {stat.value}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-1 md:mt-2 hidden md:block">
                {stat.subtitle}
              </p>
            </div>
          )
        })}
      </div>

      {/* Top Performers - Compact on mobile */}
      {stats?.topPerformers && stats.topPerformers.length > 0 && (
        <div className="bg-card border rounded-lg p-4 md:p-8">
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-[#005A9C]">
              Top Performers
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/statistics')}
              className="touch-manipulation"
            >
              Se alle
              <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          <div className="space-y-2 md:space-y-3">
            {stats.topPerformers.slice(0, 3).map((performer, index) => (
              <div
                key={performer.player.id}
                onClick={() => router.push(`/players/${performer.player.id}`)}
                className="group flex items-center gap-2 md:gap-4 p-2 md:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all cursor-pointer touch-manipulation"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-[#005A9C]/10 text-base md:text-lg font-bold text-[#005A9C]">
                  {index + 1}
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base group-hover:text-[#005A9C] transition-colors truncate">
                    {performer.player.name}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    ELO {Math.round(performer.player.level)}
                  </p>
                </div>

                {/* Stats - Compact on mobile */}
                <div className="flex items-center gap-3 md:gap-6 text-sm">
                  <div className="text-right">
                    <div className="text-[10px] md:text-xs text-muted-foreground">Win</div>
                    <div className="text-sm md:text-lg font-semibold">
                      {Math.round(performer.winRate)}%
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">Sejre</div>
                    <div className="text-lg font-semibold text-green-600">
                      {performer.wins}
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions - Stack on mobile, grid on desktop */}
      <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-3 max-w-full">
        <Button
          onClick={() => router.push('/trainings/new')}
          variant="outline"
          className="h-auto p-3 md:p-6 justify-start w-full touch-manipulation"
        >
          <div className="text-left">
            <div className="font-semibold text-sm md:text-base">Opret Træning</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Planlæg ny session</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/players')}
          variant="outline"
          className="h-auto p-3 md:p-6 justify-start w-full touch-manipulation"
        >
          <div className="text-left">
            <div className="font-semibold text-sm md:text-base">Spillere</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Se medlemmer</p>
          </div>
        </Button>

        <Button
          onClick={() => router.push('/statistics')}
          variant="outline"
          className="h-auto p-3 md:p-6 justify-start w-full touch-manipulation"
        >
          <div className="text-left">
            <div className="font-semibold text-sm md:text-base">Statistik</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Rankings og data</p>
          </div>
        </Button>
      </div>
    </div>
  )
}
