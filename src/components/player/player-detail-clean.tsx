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
      <div className="bg-card border rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
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

            <h1 className="text-4xl font-bold text-[#005A9C] mb-4">
              {player.name}
            </h1>

            <div className="flex items-center gap-8">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Kampe</div>
                <div className="text-2xl font-semibold">
                  {player.statistics?.totalMatches || 0}
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Sejre</div>
                <div className="text-2xl font-semibold text-green-600">
                  {player.statistics?.wins || 0}
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Nederlag</div>
                <div className="text-2xl font-semibold text-muted-foreground">
                  {player.statistics?.losses || 0}
                </div>
              </div>
            </div>
          </div>

          {/* ELO Badge */}
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-2">ELO Rating</div>
            <div className="text-6xl font-bold text-[#005A9C]">
              {Math.round(player.level)}
            </div>
          </div>
        </div>

        <Button
          onClick={onEditClick}
          variant="outline"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rediger spiller
        </Button>
      </div>

      {/* Performance Section */}
      <div className="bg-card border rounded-lg p-8">
        <h2 className="text-xl font-bold text-[#005A9C] mb-6">
          Præstation
        </h2>

        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
          {/* Win Rate */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm text-muted-foreground">Sejrsrate</span>
              <span className="text-4xl font-bold">{winRate}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#005A9C] rounded-full transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Baseret på {player.statistics?.totalMatches || 0} kampe
            </p>
          </div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Nuværende Streak
              </div>
              <div className="text-3xl font-bold">
                {player.statistics?.currentStreak > 0 && '+'}
                {player.statistics?.currentStreak || 0}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">
                Bedste Streak
              </div>
              <div className="text-3xl font-bold">
                {player.statistics?.longestWinStreak || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(player.email || player.phone) && (
        <div className="bg-card border rounded-lg p-8">
          <h2 className="text-xl font-bold text-[#005A9C] mb-6">
            Kontakt
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {player.email && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-[#005A9C]/10">
                  <Mail className="h-5 w-5 text-[#005A9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <a
                    href={`mailto:${player.email}`}
                    className="text-sm font-medium hover:text-[#005A9C] transition-colors"
                  >
                    {player.email}
                  </a>
                </div>
              </div>
            )}

            {player.phone && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-[#005A9C]/10">
                  <Phone className="h-5 w-5 text-[#005A9C]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">Telefon</div>
                  <a
                    href={`tel:${player.phone}`}
                    className="text-sm font-medium hover:text-[#005A9C] transition-colors"
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
