'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Trash2, Play, CheckCircle2, Trophy, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import { AddTournamentPlayersDialog } from '@/components/tournament/add-tournament-players-dialog'
import { TournamentBracket } from '@/components/tournament/tournament-bracket'

interface Tournament {
  id: string
  name: string
  startDate: string
  endDate: string | null
  format: string
  status: string
  description: string | null
  _count: {
    matches: number
  }
  tournamentPlayers: Array<{
    player: {
      id: string
      name: string
      level: number
      gender: string | null
      isActive: boolean
    }
  }>
  matches: Array<{
    id: string
    courtNumber: number
    matchNumber: number
    status: string
    matchPlayers: Array<{
      player: {
        id: string
        name: string
        level: number
      }
      team: number
    }>
    result: any
  }>
}

const formatLabels: Record<string, string> = {
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  ROUND_ROBIN: 'Round Robin',
  SWISS: 'Swiss',
}

const statusLabels: Record<string, string> = {
  PLANNED: 'Planlagt',
  IN_PROGRESS: 'I gang',
  COMPLETED: 'Afsluttet',
  CANCELLED: 'Aflyst',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  PLANNED: 'default',
  IN_PROGRESS: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'outline',
}

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showAddPlayersDialog, setShowAddPlayersDialog] = useState(false)

  useEffect(() => {
    fetchTournament()
  }, [params.id])

  const fetchTournament = async () => {
    try {
      setLoading(true)
      const id = await params.id
      const res = await fetch(`/api/tournaments/${id}`)

      if (!res.ok) {
        throw new Error('Kunne ikke hente turneringsdata')
      }

      const data = await res.json()
      setTournament(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne turnering?')) {
      return
    }

    try {
      const id = await params.id
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Kunne ikke slette turnering')
      }

      router.push('/tournaments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const id = await params.id
      const res = await fetch(`/api/tournaments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Kunne ikke opdatere status')
      }

      fetchTournament()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }

  const handleGenerateMatches = async () => {
    try {
      setGenerating(true)
      setError('')

      const id = await params.id
      const res = await fetch(`/api/tournaments/${id}/matches`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke generere kampe')
      }

      fetchTournament()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setGenerating(false)
    }
  }

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('Er du sikker på at du vil fjerne denne spiller fra turneringen?')) {
      return
    }

    try {
      const id = await params.id
      const res = await fetch(`/api/tournaments/${id}/players?playerId=${playerId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Kunne ikke fjerne spiller')
      }

      fetchTournament()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/tournaments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til turneringer
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Turnering ikke fundet'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/tournaments')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til turneringer
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {tournament.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={statusVariants[tournament.status]}>
                  {statusLabels[tournament.status]}
                </Badge>
                <span className="text-muted-foreground">
                  {formatLabels[tournament.format]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {tournament.status === 'PLANNED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={tournament._count.matches === 0}
                title={tournament._count.matches === 0 ? 'Tilføj spillere og generer kampe først' : ''}
              >
                <Play className="mr-2 h-4 w-4" />
                Start turnering
              </Button>
            )}
            {tournament.status === 'IN_PROGRESS' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('COMPLETED')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Afslut turnering
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Slet
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Format</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLabels[tournament.format]}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startdato</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {format(new Date(tournament.startDate), 'd. MMM', { locale: da })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(tournament.startDate), 'yyyy', { locale: da })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deltagere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournament.tournamentPlayers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tilmeldte spillere
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kampe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournament._count.matches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Genererede kampe
            </p>
          </CardContent>
        </Card>
      </div>

      {tournament.description && (
        <Card>
          <CardHeader>
            <CardTitle>Beskrivelse</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {tournament.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Deltagere</CardTitle>
                <CardDescription>
                  {tournament.tournamentPlayers.length} spillere tilmeldt turneringen
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddPlayersDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Tilføj spillere
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tournament.tournamentPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>Ingen spillere tilmeldt endnu</p>
                <p className="text-sm mt-1">Klik på "Tilføj spillere" for at tilmelde</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tournament.tournamentPlayers.map(({ player }) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Niveau: {Math.round(player.level)}</span>
                          {player.gender && (
                            <Badge variant="outline" className="text-xs">
                              {player.gender === 'MALE' ? 'Mand' : 'Kvinde'}
                            </Badge>
                          )}
                          {!player.isActive && (
                            <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
            <CardDescription>Turneringsinformation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Navn</span>
              <span className="text-sm font-medium">{tournament.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Format</span>
              <span className="text-sm font-medium">{formatLabels[tournament.format]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Startdato</span>
              <span className="text-sm font-medium">
                {format(new Date(tournament.startDate), 'dd. MMMM yyyy', { locale: da })}
              </span>
            </div>
            {tournament.endDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Slutdato</span>
                <span className="text-sm font-medium">
                  {format(new Date(tournament.endDate), 'dd. MMMM yyyy', { locale: da })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariants[tournament.status]}>
                {statusLabels[tournament.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {tournament._count.matches === 0 && tournament.status === 'PLANNED' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground mb-4">
                Turneringen har ingen kampe endnu. Tilføj spillere og generer kampe for at starte.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowAddPlayersDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tilføj spillere
                </Button>
                <Button onClick={handleGenerateMatches} disabled={generating || tournament.tournamentPlayers.length === 0}>
                  {generating ? 'Genererer kampe...' : 'Generer kampe'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Kampe genereres baseret på {formatLabels[tournament.format]} format
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {tournament._count.matches > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Turnering</CardTitle>
                <CardDescription>
                  {tournament._count.matches} kampe i {formatLabels[tournament.format]} format
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateMatches}
                disabled={generating}
              >
                {generating ? 'Regenererer...' : 'Regenerer kampe'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TournamentBracket
              format={tournament.format as any}
              matches={tournament.matches}
              players={tournament.tournamentPlayers}
            />
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <AddTournamentPlayersDialog
        open={showAddPlayersDialog}
        onOpenChange={setShowAddPlayersDialog}
        onSuccess={fetchTournament}
        tournamentId={tournament.id}
        existingPlayerIds={tournament.tournamentPlayers.map(tp => tp.player.id)}
      />
    </div>
  )
}
