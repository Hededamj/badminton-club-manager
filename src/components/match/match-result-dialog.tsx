'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Minus } from 'lucide-react'

interface MatchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  matchId: string
  courtNumber: number
  team1Players: Array<{ id: string; name: string; level: number }>
  team2Players: Array<{ id: string; name: string; level: number }>
}

interface SetScore {
  team1: string
  team2: string
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
  const [sets, setSets] = useState<SetScore[]>([{ team1: '', team2: '' }, { team1: '', team2: '' }])
  const [showScores, setShowScores] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleTeamWin = (team: 1 | 2) => {
    setWinningTeam(team)
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
    setShowScores(true)
    // Pre-fill first two sets with typical winning scores
    if (winningTeam === 1) {
      setSets([{ team1: '21', team2: '15' }, { team1: '21', team2: '15' }])
    } else {
      setSets([{ team1: '15', team2: '21' }, { team1: '15', team2: '21' }])
    }
  }

  const addSet = () => {
    if (sets.length < 3) {
      setSets([...sets, { team1: '', team2: '' }])
    }
  }

  const removeSet = () => {
    if (sets.length > 1) {
      setSets(sets.slice(0, -1))
    }
  }

  const updateSetScore = (setIndex: number, team: 'team1' | 'team2', value: string) => {
    const newSets = [...sets]
    newSets[setIndex] = { ...newSets[setIndex], [team]: value }
    setSets(newSets)
  }

  const applyQuickScore = (setIndex: number, score1: number, score2: number) => {
    const newSets = [...sets]
    newSets[setIndex] = { team1: score1.toString(), team2: score2.toString() }
    setSets(newSets)
  }

  const calculateWinner = () => {
    let team1Wins = 0
    let team2Wins = 0

    for (const set of sets) {
      const s1 = parseInt(set.team1) || 0
      const s2 = parseInt(set.team2) || 0
      if (s1 > s2) team1Wins++
      else if (s2 > s1) team2Wins++
    }

    return { team1Wins, team2Wins }
  }

  const handleSubmit = async () => {
    // Validate sets
    const validSets = sets.filter(s => s.team1 !== '' && s.team2 !== '')
    if (validSets.length === 0) {
      setError('Indtast mindst ét sæt')
      return
    }

    // Convert to numbers and validate
    const setsData = validSets.map(s => ({
      team1: parseInt(s.team1) || 0,
      team2: parseInt(s.team2) || 0,
    }))

    // Check for ties in individual sets
    for (let i = 0; i < setsData.length; i++) {
      if (setsData[i].team1 === setsData[i].team2) {
        setError(`Sæt ${i + 1} kan ikke ende uafgjort`)
        return
      }
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch(`/api/matches/${matchId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sets: setsData }),
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
    setSets([{ team1: '', team2: '' }, { team1: '', team2: '' }])
    setShowScores(false)
    setError('')
  }

  const { team1Wins, team2Wins } = calculateWinner()

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
          ) : !showScores ? (
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
                  Tilføj sæt scores
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
            /* Step 3: Enter set scores */
            <div className="space-y-4">
              {/* Current result indicator */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-muted px-4 py-2 rounded-lg">
                  <span className="font-bold text-blue-600">{team1Wins}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-bold text-red-600">{team2Wins}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">sæt</p>
              </div>

              {/* Team headers */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center px-2">
                <div className="text-center">
                  <Label className="text-sm font-bold text-blue-600">Hold 1</Label>
                  <div className="text-xs text-muted-foreground truncate">
                    {team1Players.map(p => p.name.split(' ')[0]).join(' / ')}
                  </div>
                </div>
                <div className="w-8"></div>
                <div className="text-center">
                  <Label className="text-sm font-bold text-red-600">Hold 2</Label>
                  <div className="text-xs text-muted-foreground truncate">
                    {team2Players.map(p => p.name.split(' ')[0]).join(' / ')}
                  </div>
                </div>
              </div>

              {/* Set scores */}
              <div className="space-y-3">
                {sets.map((set, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-12">Sæt {index + 1}</span>
                      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="30"
                          value={set.team1}
                          onChange={(e) => updateSetScore(index, 'team1', e.target.value)}
                          className="text-center text-2xl font-bold h-14 border-2 border-blue-200 touch-manipulation"
                          placeholder="0"
                        />
                        <span className="text-muted-foreground font-bold">-</span>
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="30"
                          value={set.team2}
                          onChange={(e) => updateSetScore(index, 'team2', e.target.value)}
                          className="text-center text-2xl font-bold h-14 border-2 border-red-200 touch-manipulation"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    {/* Quick score buttons for this set */}
                    <div className="flex gap-1 ml-14">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => applyQuickScore(index, 21, 19)}
                      >
                        21-19
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => applyQuickScore(index, 21, 15)}
                      >
                        21-15
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => applyQuickScore(index, 19, 21)}
                      >
                        19-21
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs px-2"
                        onClick={() => applyQuickScore(index, 15, 21)}
                      >
                        15-21
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add/Remove set buttons */}
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeSet}
                  disabled={sets.length <= 1}
                  className="h-10"
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Fjern sæt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSet}
                  disabled={sets.length >= 3}
                  className="h-10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tilføj sæt
                </Button>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowScores(false)}
                  className="flex-1 h-14 md:h-12 text-base md:text-sm touch-manipulation"
                  disabled={submitting}
                >
                  Tilbage
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 h-14 md:h-12 text-base md:text-sm touch-manipulation"
                  disabled={submitting}
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
