'use client'

import { Plus, Search, Upload, ChevronRight, Pencil, Trash2, User } from 'lucide-react'
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

interface PlayersListCleanProps {
  players: Player[]
  loading: boolean
  search: string
  onSearchChange: (search: string) => void
  onAddClick: () => void
  onImportClick: () => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayersListClean({
  players,
  loading,
  search,
  onSearchChange,
  onAddClick,
  onImportClick,
  onEdit,
  onDelete,
}: PlayersListCleanProps) {
  const router = useRouter()

  const getWinRate = (player: Player) => {
    if (!player.statistics?.totalMatches || player.statistics.totalMatches === 0) {
      return 0
    }
    return Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#005A9C]">Spillere</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {!loading && `${players.length} ${players.length === 1 ? 'spiller' : 'spillere'}`}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onImportClick}
            size="sm"
            className="sm:size-default"
          >
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
          <Button
            onClick={onAddClick}
            size="sm"
            className="bg-[#005A9C] hover:bg-[#004A7C] sm:size-default"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tilføj spiller</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Søg efter spillere..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-muted border-t-[#005A9C] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Indlæser spillere...</p>
          </div>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen spillere fundet</h3>
          <p className="text-muted-foreground mb-6">
            Tilføj din første spiller for at komme i gang.
          </p>
          <Button
            onClick={onAddClick}
            className="bg-[#005A9C] hover:bg-[#004A7C]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tilføj spiller
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {players.map((player) => {
            const winRate = getWinRate(player)
            const hasStats = player.statistics && player.statistics.totalMatches > 0

            return (
              <div
                key={player.id}
                className="group relative bg-card border rounded-lg p-4 sm:p-5 hover:shadow-md transition-all"
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg ${
                  player.isActive ? 'bg-[#005A9C]' : 'bg-muted'
                }`} />

                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 mt-1 sm:mt-2">
                  <button
                    onClick={() => router.push(`/players/${player.id}`)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <h3 className="font-semibold text-base sm:text-lg mb-0.5 sm:mb-1 group-hover:text-[#005A9C] transition-colors truncate">
                      {player.name}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      {player.gender === 'MALE' && <span>Mand</span>}
                      {player.gender === 'FEMALE' && <span>Kvinde</span>}
                      {player.gender && <span>·</span>}
                      <span className={player.isActive ? 'text-[#005A9C]' : ''}>
                        {player.isActive ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </button>

                  {/* ELO */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">ELO</div>
                    <div className="text-lg sm:text-2xl font-bold text-[#005A9C]">
                      {Math.round(player.level)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {hasStats ? (
                  <div className="space-y-2 sm:space-y-3">
                    {/* Win Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2 text-xs sm:text-sm">
                        <span className="text-muted-foreground">Sejrsrate</span>
                        <span className="font-semibold">{winRate}%</span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#005A9C] rounded-full transition-all"
                          style={{ width: `${winRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm pt-2 border-t">
                      <div>
                        <div className="text-muted-foreground text-xs">Kampe</div>
                        <div className="font-semibold">{player.statistics?.totalMatches || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Sejre</div>
                        <div className="font-semibold text-green-600">{player.statistics?.wins || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Nederlag</div>
                        <div className="font-semibold text-muted-foreground">{player.statistics?.losses || 0}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 sm:py-4 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Ingen kampe endnu
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(player)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(player)
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/players/${player.id}`)}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-[#005A9C]"
                  >
                    Se detaljer
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
