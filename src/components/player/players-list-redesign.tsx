'use client'

import { Plus, Search, Upload, ChevronRight, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface Player {
  id: string
  name: string
  email?: string
  level: number
  gender?: 'MALE' | 'FEMALE' | null
  isActive: boolean
  statistics?: {
    totalMatches: number
    wins: number
    losses: number
  }
}

interface PlayersListRedesignProps {
  players: Player[]
  loading: boolean
  search: string
  onSearchChange: (search: string) => void
  onAddClick: () => void
  onImportClick: () => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayersListRedesign({
  players,
  loading,
  search,
  onSearchChange,
  onAddClick,
  onImportClick,
  onEdit,
  onDelete,
}: PlayersListRedesignProps) {
  const router = useRouter()

  const getWinRate = (player: Player) => {
    if (!player.statistics?.totalMatches || player.statistics.totalMatches === 0) {
      return 0
    }
    return Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
  }

  const getGenderConfig = (gender?: 'MALE' | 'FEMALE' | null) => {
    if (gender === 'MALE') {
      return {
        label: 'Mand',
        bg: 'bg-blue-100',
        text: 'text-blue-900',
        border: 'border-blue-200',
      }
    }
    if (gender === 'FEMALE') {
      return {
        label: 'Kvinde',
        bg: 'bg-pink-100',
        text: 'text-pink-900',
        border: 'border-pink-200',
      }
    }
    return {
      label: 'Ukendt',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                SPILLERE
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Administrer klubbens spillere
              </p>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Søg efter navn eller email..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-11 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white placeholder:text-slate-400 focus:border-white/40"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onImportClick}
                className="flex-1 sm:flex-initial bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Importer fra Holdsport</span>
                <span className="sm:hidden">Importer</span>
              </Button>
              <Button
                onClick={onAddClick}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Tilføj spiller</span>
                <span className="sm:hidden">Tilføj</span>
              </Button>
            </div>
          </div>

          {/* Player Count */}
          {!loading && (
            <div className="mt-4 text-slate-300 text-sm font-medium">
              {players.length} {players.length === 1 ? 'spiller' : 'spillere'} i alt
            </div>
          )}
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Indlæser spillere...</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(148,163,184,0.1),transparent_70%)]" />
          <div className="relative text-center py-16 px-6">
            <User className="mx-auto h-20 w-20 text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              INGEN SPILLERE FUNDET
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Tilføj din første spiller for at komme i gang med at administrere klubben.
            </p>
            <Button
              onClick={onAddClick}
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tilføj spiller
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player, index) => {
            const winRate = getWinRate(player)
            const genderConfig = getGenderConfig(player.gender)
            const hasStats = player.statistics && player.statistics.totalMatches > 0

            return (
              <div
                key={player.id}
                className="group relative overflow-hidden rounded-xl bg-white border-2 border-slate-200 hover:border-slate-300 transition-all hover:shadow-xl"
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                {/* Status Indicator Bar */}
                <div
                  className={`h-2 ${
                    player.isActive
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-slate-400 to-slate-500'
                  }`}
                />

                {/* Card Content */}
                <div className="p-5">
                  {/* Header with ELO and Gender */}
                  <div className="flex items-start justify-between mb-4">
                    {/* Large ELO Number */}
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                        ELO Rating
                      </div>
                      <div className="text-5xl font-black text-slate-900 leading-none">
                        {Math.round(player.level)}
                      </div>
                    </div>

                    {/* Gender Badge */}
                    <Badge
                      className={`${genderConfig.bg} ${genderConfig.text} border-0 font-bold text-xs`}
                    >
                      {genderConfig.label}
                    </Badge>
                  </div>

                  {/* Player Name */}
                  <button
                    onClick={() => router.push(`/players/${player.id}`)}
                    className="w-full text-left group/name"
                  >
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover/name:text-blue-600 transition-colors">
                      {player.name}
                    </h3>
                  </button>

                  {/* Email - only show if exists */}
                  {player.email ? (
                    <p className="text-sm text-slate-600 mb-4 truncate">
                      {player.email}
                    </p>
                  ) : (
                    <div className="mb-4"></div>
                  )}

                  {/* Stats */}
                  {hasStats ? (
                    <div className="space-y-3 mt-4">
                      {/* Win Rate Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Win Rate
                          </span>
                          <span className="text-2xl font-black text-slate-900">
                            {winRate}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Match Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <div className="text-xs text-slate-600 font-medium">Kampe</div>
                          <div className="text-xl font-black text-slate-900">
                            {player.statistics?.totalMatches || 0}
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                          <div className="text-xs text-slate-600 font-medium">Sejre</div>
                          <div className="text-xl font-black text-green-600">
                            {player.statistics?.wins || 0}
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                          <div className="text-xs text-slate-600 font-medium">Tab</div>
                          <div className="text-xl font-black text-red-600">
                            {player.statistics?.losses || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-center py-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-medium">
                        Ingen kampe endnu
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-4">
                    <Badge
                      className={`
                        ${player.isActive ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-700'}
                        border-0 font-bold text-xs
                      `}
                    >
                      {player.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-14 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(player)
                    }}
                    className="bg-white shadow-lg hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(player)
                    }}
                    className="bg-white shadow-lg hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Click to View Arrow */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => router.push(`/players/${player.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Se detaljer
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
