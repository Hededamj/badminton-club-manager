'use client'

import { Plus, Search, Upload, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface PlayersListMinimalProps {
  players: Player[]
  loading: boolean
  search: string
  onSearchChange: (search: string) => void
  onAddClick: () => void
  onImportClick: () => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayersListMinimal({
  players,
  loading,
  search,
  onSearchChange,
  onAddClick,
  onImportClick,
  onEdit,
  onDelete,
}: PlayersListMinimalProps) {
  const router = useRouter()

  const getWinRate = (player: Player) => {
    if (!player.statistics?.totalMatches || player.statistics.totalMatches === 0) {
      return 0
    }
    return Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Spillere
        </h1>
        <p className="text-slate-600">
          {!loading && `${players.length} ${players.length === 1 ? 'spiller' : 'spillere'}`}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Søg efter navn..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:border-slate-400"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onImportClick}
            className="border-slate-200 hover:bg-slate-50"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button
            onClick={onAddClick}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny spiller
          </Button>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Indlæser...</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-24 border border-slate-200 rounded-lg bg-white">
          <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Ingen spillere fundet
          </h3>
          <p className="text-slate-500 mb-6">
            Tilføj din første spiller for at komme i gang.
          </p>
          <Button onClick={onAddClick} className="bg-slate-900 hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Tilføj spiller
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const winRate = getWinRate(player)
            const hasStats = player.statistics && player.statistics.totalMatches > 0

            return (
              <button
                key={player.id}
                onClick={() => router.push(`/players/${player.id}`)}
                className="group bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-sm transition-all text-left"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {player.gender === 'MALE' && <span>Mand</span>}
                      {player.gender === 'FEMALE' && <span>Kvinde</span>}
                      {player.gender && <span>·</span>}
                      <span className={player.isActive ? 'text-emerald-600' : 'text-slate-400'}>
                        {player.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>

                  {/* ELO Badge */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">ELO</div>
                    <div className="text-2xl font-semibold text-slate-900">
                      {Math.round(player.level)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {hasStats ? (
                  <div className="space-y-4">
                    {/* Win Rate */}
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm text-slate-600">Sejrsrate</span>
                        <span className="text-xl font-medium text-slate-900">{winRate}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-slate-500">Kampe</div>
                        <div className="font-medium text-slate-900">
                          {player.statistics?.totalMatches || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Sejre</div>
                        <div className="font-medium text-emerald-600">
                          {player.statistics?.wins || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Nederlag</div>
                        <div className="font-medium text-slate-400">
                          {player.statistics?.losses || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-slate-100 rounded bg-slate-50">
                    <p className="text-sm text-slate-500">
                      Ingen kampe endnu
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
