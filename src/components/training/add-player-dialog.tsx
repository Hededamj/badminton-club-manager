'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Search, Loader2 } from 'lucide-react'

interface Player {
  id: string
  name: string
  level: number
  isActive: boolean
}

interface AddPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainingId: string
  existingPlayerIds: string[]
  onSuccess: () => void
}

export function AddPlayerDialog({
  open,
  onOpenChange,
  trainingId,
  existingPlayerIds,
  onSuccess,
}: AddPlayerDialogProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchPlayers()
    }
  }, [open])

  async function fetchPlayers() {
    try {
      setLoading(true)
      setError('')

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

  // Filter players: exclude those already in training and filter by search
  const availablePlayers = players
    .filter(p => !existingPlayerIds.includes(p.id))
    .filter(p => p.isActive)
    .filter(p =>
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'da'))

  async function handleAddPlayer() {
    if (!selectedPlayerId) {
      setError('Vælg en spiller')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch(`/api/trainings/${trainingId}/add-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayerId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke tilføje spiller')
      }

      // Reset state
      setSelectedPlayerId(null)
      setSearch('')
      setError('')

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tilføj spiller til træning</DialogTitle>
          <DialogDescription>
            Vælg en eksisterende klubspiller der skal tilføjes til træningen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Søg efter spiller..."
              className="pl-9"
              disabled={loading}
            />
          </div>

          {/* Player list */}
          <div className="border rounded-lg max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availablePlayers.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {search
                  ? 'Ingen spillere matcher søgningen'
                  : 'Alle spillere er allerede tilmeldt træningen'
                }
              </div>
            ) : (
              <div className="divide-y">
                {availablePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                      selectedPlayerId === player.id
                        ? 'bg-primary/10 border-l-4 border-l-primary'
                        : ''
                    }`}
                    disabled={submitting}
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Niveau: {Math.round(player.level)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Annuller
          </Button>
          <Button
            onClick={handleAddPlayer}
            disabled={submitting || !selectedPlayerId}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {submitting ? 'Tilføjer...' : 'Tilføj spiller'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
