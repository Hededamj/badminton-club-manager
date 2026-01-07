'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon, Users, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface Training {
  id: string
  name: string
  date: string
  courts: number
  status: string
  trainingPlayers: Array<{
    player: {
      id: string
      name: string
      level: number
    }
  }>
  _count: {
    matches: number
  }
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

export default function TrainingsPage() {
  const router = useRouter()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchTrainings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.append('status', statusFilter)

      const res = await fetch(`/api/trainings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTrainings(data)
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainings()
  }, [statusFilter])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Træninger</h1>
        <p className="text-muted-foreground mt-2">
          Administrer træningssessioner og kampe
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="ALL">Alle træninger</option>
            <option value="PLANNED">Planlagt</option>
            <option value="IN_PROGRESS">I gang</option>
            <option value="COMPLETED">Afsluttet</option>
            <option value="CANCELLED">Aflyst</option>
          </select>
        </div>

        <Button onClick={() => router.push('/trainings/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Opret træning
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Indlæser...</p>
        </div>
      ) : trainings.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Ingen træninger fundet. Opret din første træning for at komme i gang.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <Card
              key={training.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/trainings/${training.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      {format(new Date(training.date), 'dd MMM yyyy', { locale: da })}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(training.date), 'EEEE', { locale: da })}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariants[training.status]}>
                    {statusLabels[training.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Baner:</span>
                    <span className="font-medium">{training.courts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Spillere:
                    </span>
                    <span className="font-medium">{training.trainingPlayers.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kampe:</span>
                    <span className="font-medium">{training._count.matches}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
