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

interface TrainingsListPremiumProps {
  trainings: Training[]
  loading: boolean
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  onImportClick: () => void
}

const statusConfig = {
  PLANNED: {
    label: 'Planlagt',
    dot: 'bg-blue-500',
    shadow: 'shadow-blue-500/50',
  },
  IN_PROGRESS: {
    label: 'I gang',
    dot: 'bg-orange-500',
    shadow: 'shadow-orange-500/50',
  },
  COMPLETED: {
    label: 'Afsluttet',
    dot: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/50',
  },
  CANCELLED: {
    label: 'Aflyst',
    dot: 'bg-slate-500',
    shadow: 'shadow-slate-500/50',
  },
}

export function TrainingsListPremium({
  trainings,
  loading,
  statusFilter,
  onStatusFilterChange,
  onImportClick,
}: TrainingsListPremiumProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />

        <div className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                <h1 className="text-3xl font-light tracking-tight text-white">
                  Træninger
                </h1>
              </div>
              <p className="text-slate-400 text-sm ml-4">
                {!loading && `${trainings.length} ${trainings.length === 1 ? 'session' : 'sessioner'}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onImportClick}
                className="border-slate-600 bg-slate-800/50 backdrop-blur-sm text-slate-200 hover:bg-slate-700/50 hover:border-slate-500"
              >
                <Download className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button
                onClick={() => router.push('/trainings/new')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ny træning
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => onStatusFilterChange('all')}
              size="sm"
              className={statusFilter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30'
                : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50'
              }
            >
              Alle
            </Button>
            <Button
              variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
              onClick={() => onStatusFilterChange('PLANNED')}
              size="sm"
              className={statusFilter === 'PLANNED'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30'
                : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50'
              }
            >
              Planlagt
            </Button>
            <Button
              variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
              onClick={() => onStatusFilterChange('IN_PROGRESS')}
              size="sm"
              className={statusFilter === 'IN_PROGRESS'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30'
                : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50'
              }
            >
              I gang
            </Button>
            <Button
              variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => onStatusFilterChange('COMPLETED')}
              size="sm"
              className={statusFilter === 'COMPLETED'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30'
                : 'border-slate-600 bg-slate-800/30 text-slate-300 hover:bg-slate-700/50'
              }
            >
              Afsluttet
            </Button>
          </div>
        </div>
      </div>

      {/* Trainings List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Indlæser træninger...</p>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="relative text-center py-20 px-6">
            <CalendarIcon className="mx-auto h-16 w-16 text-slate-600 mb-6" />
            <h3 className="text-xl font-light text-slate-200 mb-3">
              Ingen træninger fundet
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Opret din første træning for at komme i gang.
            </p>
            <Button
              onClick={() => router.push('/trainings/new')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-900/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Opret træning
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((training) => {
            const config = statusConfig[training.status as keyof typeof statusConfig] || statusConfig.PLANNED
            const trainingDate = new Date(training.date)

            return (
              <div
                key={training.id}
                onClick={() => router.push(`/trainings/${training.id}`)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-900/20"
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status indicator */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${config.dot}`} />

                <div className="relative p-6">
                  <div className="flex items-start gap-6">
                    {/* Premium Date Block */}
                    <div className="text-center flex-shrink-0 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="text-3xl font-light text-white">
                        {format(trainingDate, 'd', { locale: da })}
                      </div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                        {format(trainingDate, 'MMM', { locale: da })}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {format(trainingDate, 'yyyy', { locale: da })}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-light text-white mb-2 group-hover:text-blue-300 transition-colors">
                            {training.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot} shadow-lg ${config.shadow}`} />
                            <span className="text-sm text-slate-400">
                              {config.label}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span>{training.trainingPlayers.length} spillere</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <span>{training.courts} baner</span>
                        </div>
                        {training._count.matches > 0 && (
                          <>
                            <span className="text-slate-600">·</span>
                            <span>{training._count.matches} kampe</span>
                          </>
                        )}
                      </div>
                    </div>
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
