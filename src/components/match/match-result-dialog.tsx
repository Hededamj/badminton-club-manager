'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MatchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  matchId: string
  team1Players: Array<{ id: string; name: string; level: number }>
  team2Players: Array<{ id: string; name: string; level: number }>
}

export function MatchResultDialog({
  open,
  onOpenChange,
  onSuccess,
  matchId,
  team1Players,
  team2Players,
}: MatchResultDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (team1Score === team2Score) {
      setError('Der kan ikke være uafgjort i badminton')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1Score, team2Score }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to record result')
      }

      onSuccess()
      onOpenChange(false)
      setTeam1Score(0)
      setTeam2Score(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Indtast resultat</DialogTitle>
          <DialogDescription>
            Indtast score for kampen. ELO ratings opdateres automatisk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hold 1</Label>
              <div className="rounded-lg border p-3 space-y-1">
                {team1Players.map(player => (
                  <div key={player.id} className="text-sm">
                    {player.name} ({Math.round(player.level)})
                  </div>
                ))}
              </div>
              <Input
                type="number"
                min="0"
                max="30"
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                placeholder="Score"
                disabled={loading}
                required
              />
            </div>

            <div className="text-center text-muted-foreground font-medium">VS</div>

            <div className="space-y-2">
              <Label>Hold 2</Label>
              <div className="rounded-lg border p-3 space-y-1">
                {team2Players.map(player => (
                  <div key={player.id} className="text-sm">
                    {player.name} ({Math.round(player.level)})
                  </div>
                ))}
              </div>
              <Input
                type="number"
                min="0"
                max="30"
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                placeholder="Score"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuller
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Gemmer...' : 'Gem resultat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
