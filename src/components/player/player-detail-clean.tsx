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

interface PlayerDetailCleanProps {
  player: Player
  onEditClick: () => void
}

export function PlayerDetailClean({ player, onEditClick }: PlayerDetailCleanProps) {
  const router = useRouter()

  const winRate = player.statistics?.totalMatches > 0
    ? Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/players')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tilbage til spillere
      </Button>

      {/* Header Section */}
      <div className="bg-card border rounded-lg p-4 sm:p-6 md:p-8">
        {/* ELO Badge - shown at top on mobile */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${player.isActive ? 'bg-[#005A9C]' : 'bg-muted'}`} />
            <span className="text-xs text-muted-foreground">
              {player.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">ELO</div>
            <div className="text-2xl font-bold text-[#005A9C]">
              {Math.round(player.level)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            {/* Status info - hidden on mobile, shown on desktop */}
            <div className="hidden sm:flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${player.isActive ? 'bg-[#005A9C]' : 'bg-muted'}`} />
              <span className="text-sm text-muted-foreground">
                {player.gender === 'MALE' && 'Mand'}
                {player.gender === 'FEMALE' && 'Kvinde'}
                {player.gender && ' · '}
                {player.isActive ? 'Aktiv' : 'Inaktiv'}
                {' · '}
                Medlem siden {new Date(player.createdAt).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#005A9C] mb-3 sm:mb-4">
              {player.name}
            </h1>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-6 md:gap-8">
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Kampe</div>
                <div className="text-lg sm:text-2xl font-semibold">
                  {player.statistics?.totalMatches || 0}
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 md:h-12 bg-border" />
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Sejre</div>
                <div className="text-lg sm:text-2xl font-semibold text-green-600">
                  {player.statistics?.wins || 0}
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 md:h-12 bg-border" />
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Nederlag</div>
                <div className="text-lg sm:text-2xl font-semibold text-muted-foreground">
                  {player.statistics?.losses || 0}
                </div>
              </div>
            </div>
          </div>

          {/* ELO Badge - hidden on mobile, shown on desktop */}
          <div className="hidden sm:block text-right flex-shrink-0">
            <div className="text-sm text-muted-foreground mb-2">ELO Rating</div>
            <div className="text-4xl md:text-6xl font-bold text-[#005A9C]">
              {Math.round(player.level)}
            </div>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          variant="outline"
          size="sm"
          className="sm:size-default"
        >
          <Pencil className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Rediger spiller</span>
        </Button>
      </div>

      {/* Performance Section */}
      <div className="bg-card border rounded-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-lg sm:text-xl font-bold text-[#005A9C] mb-4 sm:mb-6">
          Præstation
        </h2>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-[1.5fr_1fr]">
          {/* Win Rate */}
          <div>
            <div className="flex items-baseline justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm text-muted-foreground">Sejrsrate</span>
              <span className="text-2xl sm:text-4xl font-bold">{winRate}%</span>
            </div>
            <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#005A9C] rounded-full transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
              Baseret på {player.statistics?.totalMatches || 0} kampe
            </p>
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                Nuværende Streak
              </div>
              <div className="text-xl sm:text-3xl font-bold">
                {player.statistics?.currentStreak > 0 && '+'}
                {player.statistics?.currentStreak || 0}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                Bedste Streak
              </div>
              <div className="text-xl sm:text-3xl font-bold">
                {player.statistics?.longestWinStreak || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(player.email || player.phone) && (
        <div className="bg-card border rounded-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#005A9C] mb-4 sm:mb-6">
            Kontakt
          </h2>

          <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
            {player.email && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[#005A9C]/10">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#005A9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Email</div>
                  <a
                    href={`mailto:${player.email}`}
                    className="text-xs sm:text-sm font-medium hover:text-[#005A9C] transition-colors truncate block"
                  >
                    {player.email}
                  </a>
                </div>
              </div>
            )}

            {player.phone && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[#005A9C]/10">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#005A9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Telefon</div>
                  <a
                    href={`tel:${player.phone}`}
                    className="text-xs sm:text-sm font-medium hover:text-[#005A9C] transition-colors"
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
