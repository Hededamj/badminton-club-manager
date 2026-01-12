'use client'

import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon, Users, Download, ChevronRight, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface TrainingsListCleanProps {
  trainings: Training[]
  loading: boolean
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  onImportClick: () => void
}

const statusConfig = {
  PLANNED: {
    label: 'Planlagt',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  IN_PROGRESS: {
    label: 'I gang',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  COMPLETED: {
    label: 'Afsluttet',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  CANCELLED: {
    label: 'Aflyst',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
}

export function TrainingsListClean({
  trainings,
  loading,
  statusFilter,
  onStatusFilterChange,
  onImportClick,
}: TrainingsListCleanProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#005A9C]">Træninger</h1>
          <p className="text-muted-foreground mt-1">
            {!loading && `${trainings.length} ${trainings.length === 1 ? 'session' : 'sessioner'}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onImportClick}
          >
            <Download className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button
            onClick={() => router.push('/trainings/new')}
            className="bg-[#005A9C] hover:bg-[#004A7C]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny træning
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={statusFilter === 'ALL' ? 'default' : 'outline'}
          onClick={() => onStatusFilterChange('ALL')}
          size="sm"
          className={statusFilter === 'ALL' ? 'bg-[#005A9C] hover:bg-[#004A7C]' : ''}
        >
          Alle
        </Button>
        <Button
          variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
          onClick={() => onStatusFilterChange('PLANNED')}
          size="sm"
          className={statusFilter === 'PLANNED' ? 'bg-[#005A9C] hover:bg-[#004A7C]' : ''}
        >
          Planlagt
        </Button>
        <Button
          variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
          onClick={() => onStatusFilterChange('IN_PROGRESS')}
          size="sm"
          className={statusFilter === 'IN_PROGRESS' ? 'bg-[#005A9C] hover:bg-[#004A7C]' : ''}
        >
          I gang
        </Button>
        <Button
          variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
          onClick={() => onStatusFilterChange('COMPLETED')}
          size="sm"
          className={statusFilter === 'COMPLETED' ? 'bg-[#005A9C] hover:bg-[#004A7C]' : ''}
        >
          Afsluttet
        </Button>
      </div>

      {/* Trainings List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-muted border-t-[#005A9C] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Indlæser træninger...</p>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen træninger fundet</h3>
          <p className="text-muted-foreground mb-6">
            Opret din første træning for at komme i gang.
          </p>
          <Button
            onClick={() => router.push('/trainings/new')}
            className="bg-[#005A9C] hover:bg-[#004A7C]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Opret træning
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {trainings.map((training) => {
            const config = statusConfig[training.status as keyof typeof statusConfig] || statusConfig.PLANNED
            const trainingDate = new Date(training.date)

            return (
              <div
                key={training.id}
                onClick={() => router.push(`/trainings/${training.id}`)}
                className="group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer touch-manipulation"
              >
                {/* Status bar */}
                <div className={`h-1.5 ${
                  training.status === 'IN_PROGRESS' ? 'bg-orange-500' :
                  training.status === 'COMPLETED' ? 'bg-green-500' :
                  training.status === 'CANCELLED' ? 'bg-muted' :
                  'bg-[#005A9C]'
                }`} />

                <div className="p-4">
                  {/* Date and Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                        <div className="text-2xl font-bold text-[#005A9C]">
                          {format(trainingDate, 'd', { locale: da })}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {format(trainingDate, 'MMM', { locale: da })}
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#005A9C] transition-colors flex-shrink-0 mt-1" />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm mb-3 group-hover:text-[#005A9C] transition-colors line-clamp-2">
                    {training.name}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{training.trainingPlayers.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      <span>{training.courts} baner</span>
                    </div>
                    {training._count.matches > 0 && (
                      <span className="ml-auto">{training._count.matches} kampe</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
