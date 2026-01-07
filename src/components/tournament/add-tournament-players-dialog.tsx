'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus } from 'lucide-react'

interface Player {
  id: string
  name: string
  level: number
  isActive: boolean
  gender: string | null
}

interface AddTournamentPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  tournamentId: string
  existingPlayerIds: string[]
}

export function AddTournamentPlayersDialog({
  open,
  onOpenChange,
  onSuccess,
  tournamentId,
  existingPlayerIds,
}: AddTournamentPlayersDialogProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      fetchPlayers()
    }
  }, [open])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/players')

      if (!res.ok) {
        throw new Error('Kunne ikke hente spillere')
      }

      const data = await res.json()
      setPlayers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayerIds)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      newSelected.add(playerId)
    }
    setSelectedPlayerIds(newSelected)
  }

  const handleSave = async () => {
    if (selectedPlayerIds.size === 0) {
      setError('Vælg mindst én spiller')
      return
    }

    try {
      setSaving(true)
      setError('')

      const res = await fetch(`/api/tournaments/${tournamentId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerIds: Array.from(selectedPlayerIds),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke tilføje spillere')
      }

      onSuccess()
      onOpenChange(false)
      setSelectedPlayerIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSaving(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    // Filter out already added players
    if (existingPlayerIds.includes(player.id)) return false

    // Filter by search query
    if (searchQuery) {
      return player.name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  const activePlayers = filteredPlayers.filter(p => p.isActive)
  const inactivePlayers = filteredPlayers.filter(p => !p.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tilføj spillere til turnering</DialogTitle>
          <DialogDescription>
            Vælg spillere der skal deltage i turneringen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søg efter spillere..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedPlayerIds.size > 0 && (
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm font-medium mb-2">
                {selectedPlayerIds.size} {selectedPlayerIds.size === 1 ? 'spiller' : 'spillere'} valgt
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Indlæser spillere...</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4">
              {activePlayers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Aktive spillere</h3>
                  <div className="space-y-2">
                    {activePlayers.map((player) => {
                      const isSelected = selectedPlayerIds.has(player.id)
                      return (
                        <div
                          key={player.id}
                          onClick={() => handleTogglePlayer(player.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Niveau: {Math.round(player.level)}</span>
                                {player.gender && (
                                  <Badge variant="outline" className="text-xs">
                                    {player.gender === 'MALE' ? 'M' : 'K'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {inactivePlayers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Inaktive spillere</h3>
                  <div className="space-y-2 opacity-60">
                    {inactivePlayers.map((player) => {
                      const isSelected = selectedPlayerIds.has(player.id)
                      return (
                        <div
                          key={player.id}
                          onClick={() => handleTogglePlayer(player.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Niveau: {Math.round(player.level)}</span>
                                {player.gender && (
                                  <Badge variant="outline" className="text-xs">
                                    {player.gender === 'MALE' ? 'M' : 'K'}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredPlayers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'Ingen spillere fundet'
                    : 'Alle spillere er allerede tilføjet til turneringen'}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuller
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || selectedPlayerIds.size === 0}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {saving ? 'Tilføjer...' : `Tilføj ${selectedPlayerIds.size > 0 ? selectedPlayerIds.size : ''} ${selectedPlayerIds.size === 1 ? 'spiller' : 'spillere'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
