'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trophy, Target, TrendingUp, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/statistics/overview')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Velkommen til Hareskov Badminton
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/players')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktive Spillere
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.activePlayers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.totalPlayers || 0} i alt
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/trainings')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Træninger
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.totalTrainings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Afholdte sessioner
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/statistics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Afholdte Kampe
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.completedMatches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.totalMatches || 0} genereret
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/statistics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gennemsnit ELO
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats?.overview.averageLevel || 1500)}</div>
            <p className="text-xs text-muted-foreground">
              Klubbens niveau
            </p>
          </CardContent>
        </Card>
      </div>

      {stats?.topPerformers && stats.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Spillere med bedst sejrsrate denne måned
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => router.push('/statistics')}>
                Se alle
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topPerformers.slice(0, 3).map((performer: any) => (
                <div
                  key={performer.player.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => router.push(`/players/${performer.player.id}`)}
                >
                  <div>
                    <p className="font-medium">{performer.player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ELO: {Math.round(performer.player.level)} • {performer.wins}W-{performer.losses}L
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{Math.round(performer.winRate)}%</p>
                    <p className="text-sm text-muted-foreground">Win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kom i gang</CardTitle>
          <CardDescription>
            Følg disse trin for at sætte systemet op
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div>
              <h3 className="font-medium">Tilføj spillere</h3>
              <p className="text-sm text-muted-foreground">
                Gå til Spillere og tilføj dine klubmedlemmer
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div>
              <h3 className="font-medium">Opret en træning</h3>
              <p className="text-sm text-muted-foreground">
                Gå til Træninger og planlæg din første træningssession
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div>
              <h3 className="font-medium">Generer kampe</h3>
              <p className="text-sm text-muted-foreground">
                Lad systemet automatisk fordele spillere på baner
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
