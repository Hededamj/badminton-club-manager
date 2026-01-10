'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Player {
  id: string
  name: string
  level: number
  paused?: boolean
}

interface MatchPlayer {
  player: Player
  team: number
  position: number
}

interface Match {
  id: string
  matchNumber: number
  matchPlayers: MatchPlayer[]
}

interface EditMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matchId: string
  trainingId: string
  currentPlayers: MatchPlayer[]
  availablePlayers: Player[]
  courtNumber: number
  matchNumber: number
  allMatches: Match[]
  onSuccess: () => void
}

export function EditMatchDialog({
  open,
  onOpenChange,
  matchId,
  trainingId,
  currentPlayers,
  availablePlayers,
  courtNumber,
  matchNumber,
  allMatches,
  onSuccess,
}: EditMatchDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Initialize player selections
  const [team1Player1, setTeam1Player1] = useState('')
  const [team1Player2, setTeam1Player2] = useState('')
  const [team2Player1, setTeam2Player1] = useState('')
  const [team2Player2, setTeam2Player2] = useState('')

  useEffect(() => {
    if (currentPlayers.length === 4) {
      const t1p1 = currentPlayers.find(mp => mp.team === 1 && mp.position === 1)
      const t1p2 = currentPlayers.find(mp => mp.team === 1 && mp.position === 2)
      const t2p1 = currentPlayers.find(mp => mp.team === 2 && mp.position === 1)
      const t2p2 = currentPlayers.find(mp => mp.team === 2 && mp.position === 2)

      setTeam1Player1(t1p1?.player.id || '')
      setTeam1Player2(t1p2?.player.id || '')
      setTeam2Player1(t2p1?.player.id || '')
      setTeam2Player2(t2p2?.player.id || '')
    }
  }, [currentPlayers])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      // Validate all positions filled
      if (!team1Player1 || !team1Player2 || !team2Player1 || !team2Player2) {
        setError('Alle positioner skal være udfyldt')
        return
      }

      // Validate no duplicate players
      const playerIds = [team1Player1, team1Player2, team2Player1, team2Player2]
      const uniqueIds = new Set(playerIds)
      if (uniqueIds.size !== 4) {
        setError('Hver spiller kan kun være med én gang')
        return
      }

      const res = await fetch(`/api/trainings/${trainingId}/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: [
            { playerId: team1Player1, team: 1, position: 1 },
            { playerId: team1Player2, team: 1, position: 2 },
            { playerId: team2Player1, team: 2, position: 1 },
            { playerId: team2Player2, team: 2, position: 2 },
          ],
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke opdatere kamp')
      }

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSaving(false)
    }
  }

  // Filter available players (exclude already selected ones in other positions and players in other matches in same round)
  const getAvailablePlayersFor = (currentValue: string) => {
    // Exclude players selected in this match
    const selectedIds = [team1Player1, team1Player2, team2Player1, team2Player2].filter(
      id => id && id !== currentValue
    )

    // Find players already in other matches in the same round
    const playersInSameRound = allMatches
      .filter(m => m.matchNumber === matchNumber && m.id !== matchId)
      .flatMap(m => m.matchPlayers.map(mp => mp.player.id))

    return availablePlayers.filter(
      p => !selectedIds.includes(p.id) && !playersInSameRound.includes(p.id) && !p.paused
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Redigér kamp - Bane {courtNumber}</DialogTitle>
          <DialogDescription>
            Vælg spillere til hver position i kampen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Team 1 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Hold 1</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team1-player1">Venstre side</Label>
                <Select value={team1Player1} onValueChange={setTeam1Player1}>
                  <SelectTrigger id="team1-player1">
                    <SelectValue placeholder="Vælg spiller" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayersFor(team1Player1).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({Math.round(player.level)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team1-player2">Højre side</Label>
                <Select value={team1Player2} onValueChange={setTeam1Player2}>
                  <SelectTrigger id="team1-player2">
                    <SelectValue placeholder="Vælg spiller" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayersFor(team1Player2).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({Math.round(player.level)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Hold 2</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team2-player1">Venstre side</Label>
                <Select value={team2Player1} onValueChange={setTeam2Player1}>
                  <SelectTrigger id="team2-player1">
                    <SelectValue placeholder="Vælg spiller" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayersFor(team2Player1).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({Math.round(player.level)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team2-player2">Højre side</Label>
                <Select value={team2Player2} onValueChange={setTeam2Player2}>
                  <SelectTrigger id="team2-player2">
                    <SelectValue placeholder="Vælg spiller" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayersFor(team2Player2).map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({Math.round(player.level)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuller
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Gemmer...' : 'Gem ændringer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
