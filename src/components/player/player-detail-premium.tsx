'use client'

import { ArrowLeft, Mail, Phone, Pencil, TrendingUp, Zap, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Player {
  id: string
  name: string
  email: string | null
  phone: string | null
  level: number
  gender: 'MALE' | 'FEMALE' | null
  isActive: boolean
  createdAt: string
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }
}

interface PlayerDetailPremiumProps {
  player: Player
  onEditClick: () => void
}

export function PlayerDetailPremium({ player, onEditClick }: PlayerDetailPremiumProps) {
  const router = useRouter()

  const winRate = player.statistics?.totalMatches > 0
    ? Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/players')}
        className="text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbage til spillere
      </Button>

      {/* Premium Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left: Player Info */}
            <div>
              {/* Status indicators */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-block w-2 h-2 rounded-full ${player.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'}`} />
                <span className="text-sm text-slate-400">
                  {player.gender === 'MALE' && 'Mand'}
                  {player.gender === 'FEMALE' && 'Kvinde'}
                  {player.gender && ' · '}
                  {player.isActive ? 'Aktiv medlem' : 'Inaktiv'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-sm text-slate-500">
                  Medlem siden {new Date(player.createdAt).toLocaleDateString('da-DK', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              {/* Player Name */}
              <h1 className="text-5xl font-light text-white tracking-tight mb-6">
                {player.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Kampe</div>
                  <div className="text-3xl font-light text-white">
                    {player.statistics?.totalMatches || 0}
                  </div>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Sejre</div>
                  <div className="text-3xl font-light text-emerald-400">
                    {player.statistics?.wins || 0}
                  </div>
                </div>
                <div className="w-px h-12 bg-slate-700" />
                <div>
                  <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Nederlag</div>
                  <div className="text-3xl font-light text-slate-400">
                    {player.statistics?.losses || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Large ELO Display */}
            <div className="text-right">
              <div className="inline-block">
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">ELO Rating</div>
                <div className="relative">
                  <div className="text-8xl font-light bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {Math.round(player.level)}
                  </div>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <Button
              onClick={onEditClick}
              variant="outline"
              className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 hover:border-slate-500"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rediger spiller
            </Button>
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
            <h2 className="text-2xl font-light text-white">
              Præstation
            </h2>
          </div>

          <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
            {/* Win Rate */}
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm text-slate-400 uppercase tracking-wider">Sejrsrate</span>
                <span className="text-5xl font-light text-white">{winRate}%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 shadow-lg shadow-blue-500/50"
                  style={{ width: `${winRate}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-3">
                Baseret på {player.statistics?.totalMatches || 0} kampe
              </p>
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-lg bg-slate-800/50 border border-slate-700/50 p-5">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600" />
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                    Nuværende
                  </span>
                </div>
                <div className="text-4xl font-light text-white">
                  {player.statistics?.currentStreak > 0 && '+'}
                  {player.statistics?.currentStreak || 0}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-lg bg-slate-800/50 border border-slate-700/50 p-5">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-600" />
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-slate-400 uppercase tracking-wider">
                    Bedste
                  </span>
                </div>
                <div className="text-4xl font-light text-white">
                  {player.statistics?.longestWinStreak || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - Only show if email or phone exists */}
      {(player.email || player.phone) && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

          <div className="relative p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
              <h2 className="text-2xl font-light text-white">
                Kontakt
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              {player.email && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-700/50">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Email</div>
                    <a
                      href={`mailto:${player.email}`}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {player.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {player.phone && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-slate-700/50">
                    <Phone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Telefon</div>
                    <a
                      href={`tel:${player.phone}`}
                      className="text-white hover:text-emerald-400 transition-colors"
                    >
                      {player.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
