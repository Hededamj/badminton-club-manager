'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MatchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  matchId: string
  courtNumber: number
  team1Players: Array<{ id: string; name: string; level: number }>
  team2Players: Array<{ id: string; name: string; level: number }>
}

export function MatchResultDialog({
  open,
  onOpenChange,
  onSuccess,
  matchId,
  courtNumber,
  team1Players,
  team2Players,
}: MatchResultDialogProps) {
  const [winningTeam, setWinningTeam] = useState<1 | 2 | null>(null)
  const [team1Score, setTeam1Score] = useState('')
  const [team2Score, setTeam2Score] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleTeamWin = (team: 1 | 2) => {
    setWinningTeam(team)
    // Don't auto-fill scores - let user choose to add details or save quickly
  }

  const handleQuickSave = async () => {
    if (!winningTeam) return

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winningTeam }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke gemme resultat')
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddScores = () => {
    // Auto-fill common badminton scores when user wants to add details
    if (winningTeam === 1) {
      setTeam1Score('21')
      setTeam2Score('19')
    } else {
      setTeam1Score('19')
      setTeam2Score('21')
    }
  }

  const handleSubmit = async () => {
    const score1 = parseInt(team1Score)
    const score2 = parseInt(team2Score)

    if (!score1 || !score2 || score1 < 0 || score2 < 0) {
      setError('Indtast gyldige point')
      return
    }

    if (score1 === score2) {
      setError('Der kan ikke være uafgjort i badminton')
      return
    }

    // Validate that the winning team actually has more points
    if ((score1 > score2 && winningTeam !== 1) || (score2 > score1 && winningTeam !== 2)) {
      if (!confirm('Point passer ikke med vindende hold. Fortsæt alligevel?')) {
        return
      }
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1Score: score1, team2Score: score2 }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke gemme resultat')
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset form
    setWinningTeam(null)
    setTeam1Score('')
    setTeam2Score('')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg md:text-xl pr-6">
            Indtast resultat - Bane {courtNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-2">
          {/* Step 1: Select winning team */}
          {!winningTeam ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground font-medium">
                Hvilket hold vandt?
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => handleTeamWin(1)}
                  className="w-full h-auto py-8 md:py-6 text-left bg-blue-500 hover:bg-blue-600 shadow-lg touch-manipulation"
                  size="lg"
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-bold text-xl md:text-lg">Hold 1 (Blå)</div>
                    <div className="text-base md:text-sm opacity-90 space-y-1">
                      {team1Players.map(mp => (
                        <div key={mp.id}>
                          {mp.name} <span className="text-sm md:text-xs">({Math.round(mp.level)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleTeamWin(2)}
                  className="w-full h-auto py-8 md:py-6 text-left bg-red-500 hover:bg-red-600 shadow-lg touch-manipulation"
                  size="lg"
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="font-bold text-xl md:text-lg">Hold 2 (Rød)</div>
                    <div className="text-base md:text-sm opacity-90 space-y-1">
                      {team2Players.map(mp => (
                        <div key={mp.id}>
                          {mp.name} <span className="text-sm md:text-xs">({Math.round(mp.level)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : !team1Score && !team2Score ? (
            /* Step 2: Quick save or add details */
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${winningTeam === 1 ? 'bg-blue-500' : 'bg-red-500'}`} />
                  <p className="text-sm font-semibold">
                    {winningTeam === 1 ? 'Hold 1 (Blå)' : 'Hold 2 (Rød)'} vandt
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleQuickSave}
                  className="w-full h-16 md:h-14 text-lg md:text-base touch-manipulation"
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? 'Gemmer...' : '✓ Gem resultat'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleAddScores}
                  className="w-full h-14 md:h-12 text-base md:text-sm touch-manipulation"
                  disabled={submitting}
                >
                  Tilføj score detaljer
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setWinningTeam(null)}
                  className="w-full h-12 text-sm touch-manipulation"
                  disabled={submitting}
                >
                  Tilbage
                </Button>
              </div>
            </div>
          ) : (
            /* Step 3: Enter scores (optional) */
            <div className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${winningTeam === 1 ? 'bg-blue-500' : 'bg-red-500'}`} />
                  <p className="text-sm font-semibold">
                    {winningTeam === 1 ? 'Hold 1 (Blå)' : 'Hold 2 (Rød)'} vandt
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team1Score" className="text-center block font-bold text-blue-600 text-sm md:text-base">
                    Hold 1 (Blå)
                  </Label>
                  <Input
                    id="team1Score"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    max="30"
                    value={team1Score}
                    onChange={(e) => setTeam1Score(e.target.value)}
                    className="text-center text-4xl md:text-3xl font-bold h-24 md:h-20 border-2 border-blue-300 touch-manipulation"
                    placeholder="0"
                    autoFocus
                  />
                  <div className="text-xs text-muted-foreground text-center space-y-0.5">
                    {team1Players.map(mp => (
                      <div key={mp.id}>{mp.name.split(' ')[0]}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team2Score" className="text-center block font-bold text-red-600 text-sm md:text-base">
                    Hold 2 (Rød)
                  </Label>
                  <Input
                    id="team2Score"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    max="30"
                    value={team2Score}
                    onChange={(e) => setTeam2Score(e.target.value)}
                    className="text-center text-4xl md:text-3xl font-bold h-24 md:h-20 border-2 border-red-300 touch-manipulation"
                    placeholder="0"
                  />
                  <div className="text-xs text-muted-foreground text-center space-y-0.5">
                    {team2Players.map(mp => (
                      <div key={mp.id}>{mp.name.split(' ')[0]}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick score buttons */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs text-muted-foreground text-center font-medium">Hurtig score</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="h-14 md:h-12 text-base md:text-sm touch-manipulation"
                    onClick={() => {
                      if (winningTeam === 1) {
                        setTeam1Score('21')
                        setTeam2Score('19')
                      } else {
                        setTeam1Score('19')
                        setTeam2Score('21')
                      }
                    }}
                  >
                    21-19
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 md:h-12 text-base md:text-sm touch-manipulation"
                    onClick={() => {
                      if (winningTeam === 1) {
                        setTeam1Score('21')
                        setTeam2Score('15')
                      } else {
                        setTeam1Score('15')
                        setTeam2Score('21')
                      }
                    }}
                  >
                    21-15
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 md:h-12 text-base md:text-sm touch-manipulation"
                    onClick={() => {
                      if (winningTeam === 1) {
                        setTeam1Score('21')
                        setTeam2Score('18')
                      } else {
                        setTeam1Score('18')
                        setTeam2Score('21')
                      }
                    }}
                  >
                    21-18
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTeam1Score('')
                    setTeam2Score('')
                  }}
                  className="flex-1 h-14 md:h-12 text-base md:text-sm touch-manipulation"
                  disabled={submitting}
                >
                  Tilbage
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 h-14 md:h-12 text-base md:text-sm touch-manipulation"
                  disabled={submitting || !team1Score || !team2Score}
                >
                  {submitting ? 'Gemmer...' : 'Gem resultat ✓'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
