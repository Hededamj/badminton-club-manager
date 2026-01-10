'use client'

import { ArrowLeft, Mail, Phone, Pencil } from 'lucide-react'
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

interface PlayerDetailMinimalProps {
  player: Player
  onEditClick: () => void
}

export function PlayerDetailMinimal({ player, onEditClick }: PlayerDetailMinimalProps) {
  const router = useRouter()

  const winRate = player.statistics?.totalMatches > 0
    ? Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/players')}
        className="hover:bg-slate-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbage til spillere
      </Button>

      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-block w-2 h-2 rounded-full ${player.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-sm text-slate-600">
                {player.gender === 'MALE' && 'Mand'}
                {player.gender === 'FEMALE' && 'Kvinde'}
                {player.gender && ' · '}
                {player.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>

            <h1 className="text-4xl font-semibold text-slate-900 mb-2">
              {player.name}
            </h1>

            <p className="text-slate-500">
              Medlem siden {new Date(player.createdAt).toLocaleDateString('da-DK', {
                year: 'numeric',
                month: 'long'
              })}
            </p>
          </div>

          {/* ELO Badge */}
          <div className="text-right">
            <div className="text-sm text-slate-500 mb-1">ELO Rating</div>
            <div className="text-6xl font-semibold text-slate-900">
              {Math.round(player.level)}
            </div>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          variant="outline"
          className="border-slate-200 hover:bg-slate-50"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rediger spiller
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm text-slate-600 mb-2">Kampe</div>
          <div className="text-3xl font-semibold text-slate-900">
            {player.statistics?.totalMatches || 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm text-slate-600 mb-2">Sejre</div>
          <div className="text-3xl font-semibold text-emerald-600">
            {player.statistics?.wins || 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="text-sm text-slate-600 mb-2">Nederlag</div>
          <div className="text-3xl font-semibold text-slate-400">
            {player.statistics?.losses || 0}
          </div>
        </div>
      </div>

      {/* Performance Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Præstation
        </h2>

        <div className="space-y-8">
          {/* Win Rate */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm text-slate-600">Sejrsrate</span>
              <span className="text-4xl font-semibold text-slate-900">{winRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Baseret på {player.statistics?.totalMatches || 0} kampe
            </p>
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
            <div>
              <div className="text-sm text-slate-600 mb-2">Nuværende streak</div>
              <div className="text-3xl font-semibold text-slate-900">
                {player.statistics?.currentStreak > 0 && '+'}
                {player.statistics?.currentStreak || 0}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-600 mb-2">Bedste streak</div>
              <div className="text-3xl font-semibold text-slate-900">
                {player.statistics?.longestWinStreak || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information - Only show if email or phone exists */}
      {(player.email || player.phone) && (
        <div className="bg-white border border-slate-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Kontakt
          </h2>

          <div className="space-y-4">
            {/* Email */}
            {player.email && (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-500 mb-1">Email</div>
                  <a
                    href={`mailto:${player.email}`}
                    className="text-slate-900 hover:text-slate-700 transition-colors"
                  >
                    {player.email}
                  </a>
                </div>
              </div>
            )}

            {/* Phone */}
            {player.phone && (
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100">
                  <Phone className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-500 mb-1">Telefon</div>
                  <a
                    href={`tel:${player.phone}`}
                    className="text-slate-900 hover:text-slate-700 transition-colors"
                  >
                    {player.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
