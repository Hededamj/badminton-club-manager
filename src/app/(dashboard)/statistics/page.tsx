'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Users, Target, Award, Medal } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Statistics {
  overview: {
    totalPlayers: number
    activePlayers: number
    totalTrainings: number
    totalMatches: number
    completedMatches: number
    averageLevel: number
  }
  topPerformers: Array<{
    player: {
      id: string
      name: string
      level: number
    }
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }>
  recentTrainings: Array<{
    id: string
    name: string
    date: string
    trainingPlayers: any[]
    _count: {
      matches: number
    }
  }>
}

interface RankingPlayer {
  id: string
  name: string
  level: number
  rank: number
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
  } | null
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [rankings, setRankings] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('level')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchRankings()
  }, [sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/statistics/overview')
      if (res.ok) {
        const data = await res.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async () => {
    try {
      const res = await fetch(`/api/statistics/rankings?sortBy=${sortBy}&activeOnly=true`)
      if (res.ok) {
        const data = await res.json()
        setRankings(data)
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Kunne ikke hente statistik</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Statistik</h1>
        <p className="text-muted-foreground mt-2">
          Klubbens statistik, ranglister og top præstationer
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Spillere</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.activePlayers}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.overview.totalPlayers} i alt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gennemsnit ELO</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(statistics.overview.averageLevel)}</div>
            <p className="text-xs text-muted-foreground">
              Klubbens gennemsnit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kampe Spillet</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.completedMatches}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.overview.totalMatches} genereret
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Træninger</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.totalTrainings}</div>
            <p className="text-xs text-muted-foreground">
              Afholdt i klubben
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Spillere med bedst sejrsrate (min. 5 kampe)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.topPerformers.slice(0, 5).map((performer, index) => (
                <div
                  key={performer.player.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      {index === 0 && <Medal className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Medal className="h-4 w-4 text-amber-600" />}
                      {index > 2 && <span className="text-sm font-medium">{index + 1}</span>}
                    </div>
                    <div>
                      <Link
                        href={`/players/${performer.player.id}`}
                        className="font-medium hover:underline"
                      >
                        {performer.player.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        ELO: {Math.round(performer.player.level)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{Math.round(performer.winRate)}%</p>
                    <p className="text-sm text-muted-foreground">
                      {performer.wins}W-{performer.losses}L
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ELO Rangliste</CardTitle>
            <CardDescription>
              Top 10 spillere efter niveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.slice(0, 10).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      #{player.rank}
                    </span>
                    <Link
                      href={`/players/${player.id}`}
                      className="font-medium hover:underline"
                    >
                      {player.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{Math.round(player.level)}</Badge>
                    {player.statistics && (
                      <span className="text-sm text-muted-foreground">
                        {player.statistics.totalMatches} kampe
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuld Rangliste</CardTitle>
          <CardDescription>
            Alle aktive spillere sorteret efter ELO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Spiller</TableHead>
                <TableHead>ELO</TableHead>
                <TableHead>Kampe</TableHead>
                <TableHead>Sejre</TableHead>
                <TableHead>Nederlag</TableHead>
                <TableHead>Sejrsrate</TableHead>
                <TableHead>Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">#{player.rank}</TableCell>
                  <TableCell>
                    <Link
                      href={`/players/${player.id}`}
                      className="hover:underline font-medium"
                    >
                      {player.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge>{Math.round(player.level)}</Badge>
                  </TableCell>
                  <TableCell>{player.statistics?.totalMatches || 0}</TableCell>
                  <TableCell className="text-green-600">
                    {player.statistics?.wins || 0}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {player.statistics?.losses || 0}
                  </TableCell>
                  <TableCell>
                    {player.statistics?.totalMatches
                      ? `${Math.round(player.statistics.winRate)}%`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {player.statistics?.currentStreak && player.statistics.currentStreak !== 0 ? (
                      <span className={player.statistics.currentStreak > 0 ? 'text-green-600' : 'text-red-600'}>
                        {player.statistics.currentStreak > 0 ? '+' : ''}{player.statistics.currentStreak}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
