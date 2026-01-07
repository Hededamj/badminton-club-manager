'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, TrendingUp, Trophy, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Player {
  id: string
  name: string
  email: string | null
  phone: string | null
  level: number
  isActive: boolean
  createdAt: string
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }
}

export default function PlayerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/players/${params.id}`)

        if (!res.ok) {
          throw new Error('Kunne ikke hente spillerdata')
        }

        const data = await res.json()
        setPlayer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Der opstod en fejl')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/players')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til spillere
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Spiller ikke fundet'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const winRate = player.statistics?.totalMatches > 0
    ? Math.round((player.statistics.wins / player.statistics.totalMatches) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => router.push('/players')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til spillere
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{player.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {player.isActive ? (
                <Badge variant="default">Aktiv</Badge>
              ) : (
                <Badge variant="secondary">Inaktiv</Badge>
              )}
              <span className="text-muted-foreground">
                Medlem siden {new Date(player.createdAt).toLocaleDateString('da-DK', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau (ELO)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(player.level)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Beregnet fra kampresultater
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kampe spillet</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{player.statistics?.totalMatches || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {player.statistics?.wins || 0} sejre, {player.statistics?.losses || 0} nederlag
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sejrsrate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseret på {player.statistics?.totalMatches || 0} kampe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuværende streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {player.statistics?.currentStreak > 0 && '+'}
              {player.statistics?.currentStreak || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Længste: {player.statistics?.longestWinStreak || 0} sejre
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktinformation</CardTitle>
            <CardDescription>Spillerens kontaktoplysninger</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {player.email ? (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${player.email}`} className="text-sm hover:underline">
                  {player.email}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ingen email registreret</span>
              </div>
            )}

            {player.phone ? (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${player.phone}`} className="text-sm hover:underline">
                  {player.phone}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Ingen telefon registreret</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistik oversigt</CardTitle>
            <CardDescription>Spillerens præstationer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Totale kampe</span>
              <span className="text-sm font-medium">{player.statistics?.totalMatches || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sejre</span>
              <span className="text-sm font-medium text-green-600">{player.statistics?.wins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nederlag</span>
              <span className="text-sm font-medium text-red-600">{player.statistics?.losses || 0}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-sm font-medium">Sejrsrate</span>
              <span className="text-sm font-bold">{winRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
