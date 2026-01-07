'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trophy, Calendar, Users } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

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

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-500',
  IN_PROGRESS: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
}

export default function TournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments')
      if (res.ok) {
        const data = await res.json()
        setTournaments(data)
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Turneringer</h1>
          <p className="text-muted-foreground mt-2">
            Administrér og deltag i turneringer
          </p>
        </div>
        <Button onClick={() => router.push('/tournaments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Ny Turnering
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Ingen turneringer</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Kom i gang ved at oprette din første turnering
              </p>
              <Button className="mt-4" onClick={() => router.push('/tournaments/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Opret Turnering
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      {tournament.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {formatLabels[tournament.format] || tournament.format}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[tournament.status]}>
                    {statusLabels[tournament.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(tournament.startDate), 'd. MMM yyyy', { locale: da })}
                      {tournament.endDate && (
                        <> - {format(new Date(tournament.endDate), 'd. MMM yyyy', { locale: da })}</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{tournament._count.matches} kampe</span>
                  </div>
                  {tournament.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tournament.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
