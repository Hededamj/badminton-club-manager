'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Player {
  id: string
  name: string
  level: number
  email: string | null
}

export default function NewTrainingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    courts: 3,
    matchesPerCourt: 3,
  })

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const res = await fetch('/api/players?activeOnly=true')
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedPlayerIds.length < 4) {
      setError('Vælg mindst 4 spillere til træningen')
      return
    }

    if (!formData.date) {
      setError('Vælg en dato for træningen')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          playerIds: selectedPlayerIds,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to create training')
      }

      const training = await res.json()
      router.push(`/trainings/${training.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/trainings')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til træninger
        </Button>

        <h1 className="text-4xl font-bold tracking-tight">Opret træning</h1>
        <p className="text-muted-foreground mt-2">
          Planlæg en ny træningssession med spillere
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Træningsdetaljer</CardTitle>
              <CardDescription>
                Grundlæggende information om træningen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Navn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="F.eks. Onsdag træning"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Dato *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courts">Antal baner *</Label>
                <Input
                  id="courts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.courts}
                  onChange={(e) =>
                    setFormData({ ...formData, courts: parseInt(e.target.value) })
                  }
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Antal baner tilgængelige til træningen (1-10)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="matchesPerCourt">Kampe pr. bane *</Label>
                <Input
                  id="matchesPerCourt"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.matchesPerCourt}
                  onChange={(e) =>
                    setFormData({ ...formData, matchesPerCourt: parseInt(e.target.value) })
                  }
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Antal kampe der skal spilles på hver bane
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vælg spillere ({selectedPlayerIds.length})</CardTitle>
              <CardDescription>
                Vælg spillere der skal deltage i træningen (min. 4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {players.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ingen aktive spillere tilgængelige
                  </p>
                ) : (
                  players.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer
                        transition-colors hover:bg-accent
                        ${
                          selectedPlayerIds.includes(player.id)
                            ? 'bg-primary/10 border-primary'
                            : 'border-border'
                        }
                      `}
                    >
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Niveau: {Math.round(player.level)}
                        </p>
                      </div>
                      {selectedPlayerIds.includes(player.id) && (
                        <Badge>Valgt</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/trainings')}
            disabled={loading}
          >
            Annuller
          </Button>
          <Button type="submit" disabled={loading || selectedPlayerIds.length < 4}>
            {loading ? 'Opretter...' : 'Opret træning'}
          </Button>
        </div>
      </form>
    </div>
  )
}
