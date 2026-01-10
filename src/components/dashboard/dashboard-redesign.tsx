'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface DashboardRedesignProps {
  stats: DashboardStats | null
}

export function DashboardRedesign({ stats }: DashboardRedesignProps) {
  const router = useRouter()

  const statCards = [
    {
      label: 'AKTIVE SPILLERE',
      value: stats?.overview.activePlayers || 0,
      subtitle: `${stats?.overview.totalPlayers || 0} i alt`,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 via-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      icon: Users,
      link: '/players',
    },
    {
      label: 'TRÆNINGER',
      value: stats?.overview.totalTrainings || 0,
      subtitle: 'Afholdte sessioner',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 via-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-900',
      icon: Trophy,
      link: '/trainings',
    },
    {
      label: 'AFHOLDTE KAMPE',
      value: stats?.overview.completedMatches || 0,
      subtitle: `${stats?.overview.totalMatches || 0} genereret`,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 via-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-900',
      icon: Target,
      link: '/statistics',
    },
    {
      label: 'GENNEMSNIT ELO',
      value: Math.round(stats?.overview.averageLevel || 1500),
      subtitle: 'Klubbens niveau',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 via-amber-50 to-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      icon: TrendingUp,
      link: '/statistics',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                DASHBOARD
              </h1>
              <p className="text-slate-300 text-lg mt-1">
                Velkommen til Hareskov Badminton
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <button
              key={card.label}
              onClick={() => router.push(card.link)}
              className="group relative overflow-hidden rounded-xl border-2 transition-all hover:shadow-xl hover:scale-[1.02] text-left"
              style={{
                borderColor: `var(--${card.borderColor})`,
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_50%)]" />

              {/* Color Bar */}
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />

              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold tracking-wider ${card.textColor} opacity-70`}>
                        {card.label}
                      </span>
                    </div>
                  </div>
                  <Icon className={`h-5 w-5 ${card.textColor} opacity-50`} />
                </div>

                <div className={`text-5xl md:text-6xl font-black ${card.textColor} leading-none mb-2`}>
                  {card.value.toLocaleString()}
                </div>

                <div className={`text-sm ${card.textColor} opacity-70 font-medium`}>
                  {card.subtitle}
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Top Performers */}
      {stats?.topPerformers && stats.topPerformers.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.08),transparent_50%)]" />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    TOP PERFORMERS
                  </h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Spillere med bedst sejrsrate denne måned
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.push('/statistics')}
                className="hidden md:flex text-slate-700 hover:text-slate-900"
              >
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {stats.topPerformers.slice(0, 3).map((performer, index) => (
                <div
                  key={performer.player.id}
                  onClick={() => router.push(`/players/${performer.player.id}`)}
                  className="group relative overflow-hidden rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer hover:shadow-lg"
                >
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center">
                    <div className={`
                      text-2xl font-black
                      ${index === 0 ? 'text-yellow-500' : ''}
                      ${index === 1 ? 'text-slate-400' : ''}
                      ${index === 2 ? 'text-orange-600' : ''}
                    `}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 pl-16">
                    <div>
                      <p className="font-bold text-lg text-slate-900 mb-1">
                        {performer.player.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-600">
                          ELO: <span className="font-mono font-bold">{Math.round(performer.player.level)}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          {performer.wins}W - {performer.losses}L
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-black text-slate-900">
                          {Math.round(performer.winRate)}%
                        </div>
                        <div className="text-xs text-slate-500 font-bold tracking-wide">
                          WIN RATE
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push('/statistics')}
              className="w-full mt-4 md:hidden text-slate-700 hover:text-slate-900"
            >
              Se alle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 border-2 border-orange-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15),transparent_50%)]" />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-10 bg-orange-500 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-orange-900 tracking-tight">
                KOM I GANG
              </h2>
              <p className="text-sm text-orange-700 mt-0.5">
                Følg disse trin for at sætte systemet op
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                number: 1,
                title: 'Tilføj spillere',
                description: 'Gå til Spillere og tilføj dine klubmedlemmer',
                link: '/players',
              },
              {
                number: 2,
                title: 'Opret en træning',
                description: 'Gå til Træninger og planlæg din første træningssession',
                link: '/trainings/new',
              },
              {
                number: 3,
                title: 'Generer kampe',
                description: 'Lad systemet automatisk fordele spillere på baner',
                link: '/trainings',
              },
            ].map((step) => (
              <button
                key={step.number}
                onClick={() => router.push(step.link)}
                className="group w-full flex items-start gap-4 p-4 rounded-xl bg-white border-2 border-orange-200 hover:border-orange-300 transition-all hover:shadow-md text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <span className="text-2xl font-black text-white">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-orange-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-orange-700">
                    {step.description}
                  </p>
                </div>
                <ChevronRight className="flex-shrink-0 h-6 w-6 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
