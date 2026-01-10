'use client'

import { ArrowLeft, Mail, Phone, TrendingUp, Trophy, Award, Pencil, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

interface PlayerDetailRedesignProps {
  player: Player
  onEditClick: () => void
}

export function PlayerDetailRedesign({ player, onEditClick }: PlayerDetailRedesignProps) {
  const router = useRouter()

  const winRate = player.statistics?.totalMatches > 0
    ? Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
    : 0

  const getGenderConfig = (gender?: 'MALE' | 'FEMALE' | null) => {
    if (gender === 'MALE') {
      return {
        label: 'Mand',
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-100',
        text: 'text-blue-900',
      }
    }
    if (gender === 'FEMALE') {
      return {
        label: 'Kvinde',
        gradient: 'from-pink-500 to-pink-600',
        bg: 'bg-pink-100',
        text: 'text-pink-900',
      }
    }
    return {
      label: 'Ukendt',
      gradient: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
    }
  }

  const genderConfig = getGenderConfig(player.gender)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/players')}
        className="hover:bg-slate-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbage til spillere
      </Button>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.15),transparent_50%)]" />

        <div className="relative p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-start">
            {/* Left: Player Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge
                  className={`${player.isActive ? 'bg-green-500' : 'bg-slate-500'} text-white border-0 font-bold`}
                >
                  {player.isActive ? 'Aktiv' : 'Inaktiv'}
                </Badge>
                <Badge className={`${genderConfig.bg} ${genderConfig.text} border-0 font-bold`}>
                  {genderConfig.label}
                </Badge>
                <span className="text-slate-400 text-sm font-medium">
                  Medlem siden {new Date(player.createdAt).toLocaleDateString('da-DK', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>

              {/* Player Name */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6">
                {player.name}
              </h1>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Kampe
                  </div>
                  <div className="text-3xl font-black">
                    {player.statistics?.totalMatches || 0}
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Sejre
                  </div>
                  <div className="text-3xl font-black text-green-400">
                    {player.statistics?.wins || 0}
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Nederlag
                  </div>
                  <div className="text-3xl font-black text-red-400">
                    {player.statistics?.losses || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Large ELO Display */}
            <div className="md:text-right">
              <div className="inline-block">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">
                  ELO Rating
                </div>
                <div className="relative">
                  <div className="text-8xl md:text-9xl font-black text-white leading-none">
                    {Math.round(player.level)}
                  </div>
                  <div className={`absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r ${genderConfig.gradient} rounded-full`} />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-8">
            <Button
              onClick={onEditClick}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rediger spiller
            </Button>
          </div>
        </div>
      </div>

      {/* Win Rate Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                PRÆSTATION
              </h2>
              <p className="text-sm text-slate-600">
                Sejrsrate og streaks
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Win Rate */}
            <div>
              <div className="flex items-end justify-between mb-3">
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Sejrsrate
                </span>
                <span className="text-5xl font-black text-slate-900">
                  {winRate}%
                </span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                  style={{ width: `${winRate}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Baseret på {player.statistics?.totalMatches || 0} kampe
              </p>
            </div>

            {/* Streaks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Nuværende
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {player.statistics?.currentStreak > 0 && '+'}
                  {player.statistics?.currentStreak || 0}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Bedste
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-900">
                  {player.statistics?.longestWinStreak || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Total Matches */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Kampe
              </span>
            </div>
            <div className="text-5xl font-black text-blue-900 mb-1">
              {player.statistics?.totalMatches || 0}
            </div>
            <p className="text-sm text-blue-700 font-medium">
              Total kampe spillet
            </p>
          </div>
        </div>

        {/* Wins */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                Sejre
              </span>
            </div>
            <div className="text-5xl font-black text-green-900 mb-1">
              {player.statistics?.wins || 0}
            </div>
            <p className="text-sm text-green-700 font-medium">
              Vundne kampe
            </p>
          </div>
        </div>

        {/* Losses */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 via-rose-50 to-red-100 border-2 border-red-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                Nederlag
              </span>
            </div>
            <div className="text-5xl font-black text-red-900 mb-1">
              {player.statistics?.losses || 0}
            </div>
            <p className="text-sm text-red-700 font-medium">
              Tabte kampe
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information - Only show if email or phone exists */}
      {(player.email || player.phone) && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.08),transparent_50%)]" />

          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-10 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  KONTAKT
                </h2>
                <p className="text-sm text-slate-600">
                  Spillerens kontaktoplysninger
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Email */}
              {player.email && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Email
                    </div>
                    <a
                      href={`mailto:${player.email}`}
                      className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {player.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {player.phone && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-green-100">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Telefon
                    </div>
                    <a
                      href={`tel:${player.phone}`}
                      className="text-sm font-medium text-slate-900 hover:text-green-600 transition-colors truncate block"
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
