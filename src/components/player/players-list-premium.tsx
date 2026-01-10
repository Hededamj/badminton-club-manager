'use client'

import { Plus, Search, Upload, ChevronRight, Pencil, Trash2, User, TrendingUp } from 'lucide-react'
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

interface PlayersListPremiumProps {
  players: Player[]
  loading: boolean
  search: string
  onSearchChange: (search: string) => void
  onAddClick: () => void
  onImportClick: () => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayersListPremium({
  players,
  loading,
  search,
  onSearchChange,
  onAddClick,
  onImportClick,
  onEdit,
  onDelete,
}: PlayersListPremiumProps) {
  const router = useRouter()

  const getWinRate = (player: Player) => {
    if (!player.statistics?.totalMatches || player.statistics.totalMatches === 0) {
      return 0
    }
    return Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                <h1 className="text-3xl font-light tracking-tight text-white">
                  Spillere
                </h1>
              </div>
              <p className="text-slate-400 text-sm ml-4">
                {!loading && `${players.length} ${players.length === 1 ? 'medlem' : 'medlemmer'}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onImportClick}
                className="border-slate-600 bg-slate-800/50 backdrop-blur-sm text-slate-200 hover:bg-slate-700/50 hover:border-slate-500"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button
                onClick={onAddClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ny spiller
              </Button>
            </div>
          </div>

          {/* Premium Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Søg efter spillere..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-11 bg-slate-800/50 backdrop-blur-sm border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Indlæser spillere...</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="relative text-center py-20 px-6">
            <User className="mx-auto h-16 w-16 text-slate-600 mb-6" />
            <h3 className="text-xl font-light text-slate-200 mb-3">
              Ingen spillere fundet
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Tilføj din første spiller for at komme i gang.
            </p>
            <Button
              onClick={onAddClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tilføj spiller
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const winRate = getWinRate(player)
            const hasStats = player.statistics && player.statistics.totalMatches > 0

            return (
              <div
                key={player.id}
                onClick={() => router.push(`/players/${player.id}`)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/20"
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Premium status indicator */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${player.isActive ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-slate-600'}`} />

                <div className="relative p-6">
                  {/* Header with ELO */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-white mb-1 group-hover:text-blue-300 transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {player.gender === 'MALE' && <span>Mand</span>}
                        {player.gender === 'FEMALE' && <span>Kvinde</span>}
                        {player.gender && <span>·</span>}
                        <span className={player.isActive ? 'text-emerald-400' : 'text-slate-500'}>
                          {player.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>

                    {/* Premium ELO Badge */}
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">ELO</div>
                      <div className="text-3xl font-light text-white bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        {Math.round(player.level)}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  {hasStats ? (
                    <div className="space-y-4">
                      {/* Win Rate with premium bar */}
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-xs text-slate-400 uppercase tracking-wider">Sejrsrate</span>
                          <span className="text-2xl font-light text-white">{winRate}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                            style={{ width: `${winRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Match Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Kampe</div>
                          <div className="text-lg font-light text-white">
                            {player.statistics?.totalMatches || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Sejre</div>
                          <div className="text-lg font-light text-emerald-400">
                            {player.statistics?.wins || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Nederlag</div>
                          <div className="text-lg font-light text-slate-400">
                            {player.statistics?.losses || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-slate-700/30 rounded-lg bg-slate-800/30">
                      <p className="text-xs text-slate-500">
                        Ingen kampe endnu
                      </p>
                    </div>
                  )}
                </div>

                {/* Premium hover indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
