'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Trash2, Play, CheckCircle2, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import { MatchResultDialog } from '@/components/match/match-result-dialog'
import { CourtView } from '@/components/match/court-view'

interface Training {
  id: string
  name: string
  date: string
  startTime: string | null
  courts: number
  matchesPerCourt: number
  status: string
  trainingPlayers: Array<{
    player: {
      id: string
      name: string
      level: number
      isActive: boolean
    }
  }>
  matches: Array<{
    id: string
    courtNumber: number
    matchNumber: number
    benchedPlayers?: Array<{
      id: string
      name: string
      level: number
    }> | null
    matchPlayers: Array<{
      player: {
        id: string
        name: string
        level: number
      }
      team: number
      position: number
    }>
    result: any
  }>
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

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'graphic' | 'list'>('graphic')

  useEffect(() => {
    fetchTraining()
  }, [params.id])

  const fetchTraining = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/trainings/${params.id}`)

      if (!res.ok) {
        throw new Error('Kunne ikke hente træningsdata')
      }

      const data = await res.json()
      setTraining(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne træning?')) {
      return
    }

    try {
      const res = await fetch(`/api/trainings/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Kunne ikke slette træning')
      }

      router.push('/trainings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/trainings/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Kunne ikke opdatere status')
      }

      fetchTraining()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }

  const handleGenerateMatches = async () => {
    try {
      setGenerating(true)
      setError('')

      const res = await fetch(`/api/trainings/${params.id}/matches`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke generere kampe')
      }

      fetchTraining()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setGenerating(false)
    }
  }

  const handleMatchClick = (match: any) => {
    if (!match.result) {
      setSelectedMatch(match)
      setShowResultDialog(true)
    }
  }

  const handleResultSuccess = () => {
    setShowResultDialog(false)
    setSelectedMatch(null)
    fetchTraining()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  if (error || !training) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/trainings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til træninger
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Træning ikke fundet'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/trainings')}
          className="mb-4 -ml-4"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight">
              Træning {format(new Date(training.date), 'dd. MMMM yyyy', { locale: da })}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
              <Badge variant={statusVariants[training.status]}>
                {statusLabels[training.status]}
              </Badge>
              <span className="text-muted-foreground text-sm md:text-base">
                {format(new Date(training.date), 'EEEE \'kl.\' HH:mm', { locale: da })}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {training.status === 'PLANNED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={training.matches.length === 0}
                title={training.matches.length === 0 ? 'Generer kampe før du starter træningen' : ''}
                size="sm"
              >
                <Play className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Start træning</span>
                <span className="sm:hidden">Start</span>
              </Button>
            )}
            {training.status === 'IN_PROGRESS' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('COMPLETED')}
                size="sm"
              >
                <CheckCircle2 className="mr-1 md:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Afslut træning</span>
                <span className="sm:hidden">Afslut</span>
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} size="sm">
              <Trash2 className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Slet</span>
              <span className="sm:hidden">Slet</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Baner</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.courts}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Tilgængelige
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Spillere</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.trainingPlayers.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Tilmeldte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Kampe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.matches.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Genererede
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tilmeldte spillere</CardTitle>
            <CardDescription>
              {training.trainingPlayers.length} spillere deltager i træningen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {training.trainingPlayers.map(({ player }) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Niveau: {Math.round(player.level)}
                    </p>
                  </div>
                  {!player.isActive && (
                    <Badge variant="secondary">Inaktiv</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detaljer</CardTitle>
            <CardDescription>Træningsinformation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Navn</span>
              <span className="text-sm font-medium">{training.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Dato</span>
              <span className="text-sm font-medium">
                {format(new Date(training.date), 'dd. MMMM yyyy', { locale: da })}
              </span>
            </div>
            {training.startTime && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Starttidspunkt</span>
                <span className="text-sm font-medium">
                  {format(new Date(training.startTime), 'HH:mm', { locale: da })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariants[training.status]}>
                {statusLabels[training.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {training.matches.length === 0 && training.status === 'PLANNED' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Ingen kampe genereret endnu. Generer kampe for at starte træningen.
              </p>
              <Button onClick={handleGenerateMatches} disabled={generating}>
                {generating ? 'Genererer kampe...' : 'Generer kampe'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Algoritmen optimerer for niveaubalance, variation i partnere og modstandere
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {training.matches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base md:text-lg">Kampprogram</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {training.matches.length} kampe genereret
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-border">
                  <Button
                    variant={viewMode === 'graphic' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('graphic')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGenerateMatches}
                  disabled={generating}
                  size="sm"
                  className="hidden md:flex"
                >
                  {generating ? 'Regenererer...' : 'Regenerer kampe'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'graphic' ? (
              // Graphic view with court visualization
              <div className="space-y-6">
                {Array.from({ length: training.matchesPerCourt || 3 }, (_, matchIndex) => {
                  const roundMatches = training.matches
                    .filter(m => m.matchNumber === matchIndex + 1)
                    .sort((a, b) => a.courtNumber - b.courtNumber)

                  const benchedPlayersForRound = roundMatches
                    .flatMap(m => m.benchedPlayers || [])
                    .filter((player, index, self) =>
                      self.findIndex(p => p.id === player.id) === index
                    )

                  return (
                    <div key={matchIndex + 1} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Kamp {matchIndex + 1}</h3>
                        {benchedPlayersForRound.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {benchedPlayersForRound.length} sidder over
                          </Badge>
                        )}
                      </div>

                      {benchedPlayersForRound.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-orange-900">
                            Spillere der sidder over i denne runde:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {benchedPlayersForRound.map(player => (
                              <Badge key={player.id} variant="secondary" className="bg-white">
                                {player.name} ({Math.round(player.level)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {roundMatches.map(match => {
                          const team1 = match.matchPlayers.filter(mp => mp.team === 1).map(mp => mp.player)
                          const team2 = match.matchPlayers.filter(mp => mp.team === 2).map(mp => mp.player)

                          return (
                            <div
                              key={match.id}
                              onClick={() => handleMatchClick(match)}
                              className={`${
                                !match.result ? 'cursor-pointer' : ''
                              }`}
                            >
                              <CourtView
                                team1Players={team1}
                                team2Players={team2}
                                courtNumber={match.courtNumber}
                                result={match.result}
                                compact={false}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // List view (original)
              <div className="space-y-6">
                {Array.from({ length: training.matchesPerCourt || 3 }, (_, matchIndex) => {
                  const roundMatches = training.matches
                    .filter(m => m.matchNumber === matchIndex + 1)
                    .sort((a, b) => a.courtNumber - b.courtNumber)

                  const benchedPlayersForRound = roundMatches
                    .flatMap(m => m.benchedPlayers || [])
                    .filter((player, index, self) =>
                      self.findIndex(p => p.id === player.id) === index
                    )

                  return (
                    <div key={matchIndex + 1} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Kamp {matchIndex + 1}</h3>
                        {benchedPlayersForRound.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {benchedPlayersForRound.length} sidder over
                          </Badge>
                        )}
                      </div>

                      {benchedPlayersForRound.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-orange-900">
                            Spillere der sidder over i denne runde:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {benchedPlayersForRound.map(player => (
                              <Badge key={player.id} variant="secondary" className="bg-white">
                                {player.name} ({Math.round(player.level)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {roundMatches.map(match => {
                        const team1 = match.matchPlayers.filter(mp => mp.team === 1)
                        const team2 = match.matchPlayers.filter(mp => mp.team === 2)

                        return (
                          <div
                            key={match.id}
                            onClick={() => handleMatchClick(match)}
                            className={`border rounded-lg p-4 space-y-2 ${
                              !match.result
                                ? 'cursor-pointer hover:bg-accent transition-colors'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">
                                Bane {match.courtNumber}
                              </span>
                              {match.result ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {match.result.team1Score} - {match.result.team2Score}
                                  </Badge>
                                  <Badge>Afsluttet</Badge>
                                </div>
                              ) : (
                                <Badge variant="secondary">Afventer resultat</Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Hold 1</p>
                                {team1.map(mp => (
                                  <div key={mp.player.id} className="text-sm">
                                    {mp.player.name} ({Math.round(mp.player.level)})
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Hold 2</p>
                                {team2.map(mp => (
                                  <div key={mp.player.id} className="text-sm">
                                    {mp.player.name} ({Math.round(mp.player.level)})
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedMatch && (
        <MatchResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          onSuccess={handleResultSuccess}
          matchId={selectedMatch.id}
          courtNumber={selectedMatch.courtNumber}
          team1Players={selectedMatch.matchPlayers
            .filter((mp: any) => mp.team === 1)
            .map((mp: any) => mp.player)}
          team2Players={selectedMatch.matchPlayers
            .filter((mp: any) => mp.team === 2)
            .map((mp: any) => mp.player)}
        />
      )}
    </div>
  )
}
