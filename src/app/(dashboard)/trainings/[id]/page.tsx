'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Trash2, Play, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface Training {
  id: string
  name: string
  date: string
  startTime: string | null
  courts: number
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

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Træning {format(new Date(training.date), 'dd. MMMM yyyy', { locale: da })}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={statusVariants[training.status]}>
                {statusLabels[training.status]}
              </Badge>
              <span className="text-muted-foreground">
                {format(new Date(training.date), 'EEEE \'kl.\' HH:mm', { locale: da })}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {training.status === 'PLANNED' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                <Play className="mr-2 h-4 w-4" />
                Start træning
              </Button>
            )}
            {training.status === 'IN_PROGRESS' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('COMPLETED')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Afslut træning
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Slet
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baner</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{training.courts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tilgængelige baner
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spillere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{training.trainingPlayers.length}</div>
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
            <div className="text-2xl font-bold">{training.matches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Genererede kampe
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

      {training.matches.length === 0 && training.status === 'PLANNED' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Ingen kampe genereret endnu. Generer kampe for at starte træningen.
              </p>
              <Button disabled>
                Generer kampe
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Kampgenerering kommer i Phase 4
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
