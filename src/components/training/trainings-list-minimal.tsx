'use client'

import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon, Users, Download, ChevronRight } from 'lucide-react'
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

interface TrainingsListMinimalProps {
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
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'I gang',
    color: 'text-orange-600',
    dot: 'bg-orange-500',
  },
  COMPLETED: {
    label: 'Afsluttet',
    color: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Aflyst',
    color: 'text-slate-400',
    dot: 'bg-slate-400',
  },
}

export function TrainingsListMinimal({
  trainings,
  loading,
  statusFilter,
  onStatusFilterChange,
  onImportClick,
}: TrainingsListMinimalProps) {
  const router = useRouter()

  return (
    <div className="max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Træninger
        </h1>
        <p className="text-slate-600">
          {!loading && `${trainings.length} ${trainings.length === 1 ? 'træning' : 'træninger'}`}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('all')}
            className={statusFilter === 'all' ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}
            size="sm"
          >
            Alle
          </Button>
          <Button
            variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('PLANNED')}
            className={statusFilter === 'PLANNED' ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}
            size="sm"
          >
            Planlagt
          </Button>
          <Button
            variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('IN_PROGRESS')}
            className={statusFilter === 'IN_PROGRESS' ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}
            size="sm"
          >
            I gang
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => onStatusFilterChange('COMPLETED')}
            className={statusFilter === 'COMPLETED' ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}
            size="sm"
          >
            Afsluttet
          </Button>
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="outline"
            onClick={onImportClick}
            className="border-slate-200 hover:bg-slate-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button
            onClick={() => router.push('/trainings/new')}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny træning
          </Button>
        </div>
      </div>

      {/* Trainings List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Indlæser...</p>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="text-center py-24 border border-slate-200 rounded-lg bg-white">
          <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Ingen træninger fundet
          </h3>
          <p className="text-slate-500 mb-6">
            Opret din første træning for at komme i gang.
          </p>
          <Button
            onClick={() => router.push('/trainings/new')}
            className="bg-slate-900 hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Opret træning
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => {
            const config = statusConfig[training.status as keyof typeof statusConfig] || statusConfig.PLANNED
            const trainingDate = new Date(training.date)

            return (
              <button
                key={training.id}
                onClick={() => router.push(`/trainings/${training.id}`)}
                className="w-full bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-sm transition-all text-left group"
              >
                <div className="flex items-start gap-6">
                  {/* Date Block */}
                  <div className="text-center flex-shrink-0">
                    <div className="text-3xl font-semibold text-slate-900">
                      {format(trainingDate, 'd', { locale: da })}
                    </div>
                    <div className="text-sm text-slate-500 uppercase">
                      {format(trainingDate, 'MMM', { locale: da })}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(trainingDate, 'yyyy', { locale: da })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
                          {training.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${config.dot}`} />
                          <span className={`text-sm font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{training.trainingPlayers.length} spillere</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span>{training.courts} baner</span>
                      </div>
                      {training._count.matches > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">•</span>
                          <span>{training._count.matches} kampe</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
