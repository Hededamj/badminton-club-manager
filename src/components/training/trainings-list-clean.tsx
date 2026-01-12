'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon, Users, Download, ChevronRight, Activity, LayoutGrid, List, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, isPast, isToday } from 'date-fns'
import { da } from 'date-fns/locale'
import { cn } from '@/lib/utils'

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
    color: 'text-[#005A9C]',
    bg: 'bg-[#005A9C]/10',
  },
  IN_PROGRESS: {
    label: 'I gang',
    color: 'text-[#005A9C]',
    bg: 'bg-[#005A9C]/20',
  },
  COMPLETED: {
    label: 'Afsluttet',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Split trainings into upcoming and past
  const isTrainingPast = (training: Training) => {
    const trainingDate = new Date(training.date)
    return training.status === 'COMPLETED' || training.status === 'CANCELLED' || (isPast(trainingDate) && !isToday(trainingDate))
  }

  const upcomingTrainings = trainings.filter(t => !isTrainingPast(t))
  const pastTrainings = trainings.filter(t => isTrainingPast(t))

  // Render training card (grid view)
  const renderTrainingCard = (training: Training, isPast: boolean) => {
    const config = statusConfig[training.status as keyof typeof statusConfig] || statusConfig.PLANNED
    const trainingDate = new Date(training.date)

    return (
      <div
        key={training.id}
        onClick={() => router.push(`/trainings/${training.id}`)}
        className={cn(
          "group bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer touch-manipulation",
          isPast && "opacity-75"
        )}
      >
        {/* Status bar */}
        <div className={cn(
          "h-1.5",
          training.status === 'IN_PROGRESS' ? 'bg-[#005A9C]' :
          isPast ? 'bg-muted' : 'bg-[#005A9C]/50'
        )} />

        <div className="p-4">
          {/* Date and Status */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                <div className={cn(
                  "text-2xl font-bold",
                  isPast ? "text-muted-foreground" : "text-[#005A9C]"
                )}>
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
          <h3 className={cn(
            "font-semibold text-sm mb-3 transition-colors line-clamp-2",
            isPast ? "group-hover:text-muted-foreground" : "group-hover:text-[#005A9C]"
          )}>
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
  }

  // Render training row (list view)
  const renderTrainingRow = (training: Training, isPast: boolean) => {
    const config = statusConfig[training.status as keyof typeof statusConfig] || statusConfig.PLANNED
    const trainingDate = new Date(training.date)

    return (
      <tr
        key={training.id}
        onClick={() => router.push(`/trainings/${training.id}`)}
        className={cn(
          "border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group",
          isPast && "opacity-75"
        )}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-center px-2 py-1 rounded bg-muted/50 min-w-[45px]",
            )}>
              <div className={cn(
                "text-lg font-bold",
                isPast ? "text-muted-foreground" : "text-[#005A9C]"
              )}>
                {format(trainingDate, 'd', { locale: da })}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">
                {format(trainingDate, 'MMM', { locale: da })}
              </div>
            </div>
            <div>
              <div className={cn(
                "font-medium",
                isPast ? "group-hover:text-muted-foreground" : "group-hover:text-[#005A9C]"
              )}>
                {training.name}
              </div>
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color} mt-1`}>
                {config.label}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center text-sm hidden sm:table-cell">
          <span className="font-medium">{training.trainingPlayers.length}</span>
        </td>
        <td className="px-4 py-3 text-center text-sm hidden md:table-cell">
          {training.courts}
        </td>
        <td className="px-4 py-3 text-center text-sm hidden md:table-cell">
          {training._count.matches}
        </td>
        <td className="px-4 py-3">
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#005A9C] transition-colors ml-auto" />
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#005A9C]">Træninger</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {!loading && `${upcomingTrainings.length} kommende · ${pastTrainings.length} afholdte`}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onImportClick}
            size="sm"
            className="sm:size-default"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
          <Button
            onClick={() => router.push('/trainings/new')}
            size="sm"
            className="bg-[#005A9C] hover:bg-[#004A7C] sm:size-default"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Ny træning</span>
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center border rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded transition-colors touch-manipulation",
              viewMode === 'grid'
                ? "bg-[#005A9C] text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Kort visning"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded transition-colors touch-manipulation",
              viewMode === 'list'
                ? "bg-[#005A9C] text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Liste visning"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
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
        <div className="space-y-8">
          {/* Upcoming Trainings */}
          {upcomingTrainings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-[#005A9C]" />
                <h2 className="text-lg font-semibold">Kommende træninger</h2>
                <span className="text-sm text-muted-foreground">({upcomingTrainings.length})</span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {upcomingTrainings.map((training) => renderTrainingCard(training, false))}
                </div>
              ) : (
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-4 py-3 text-sm font-medium">Træning</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden sm:table-cell">Spillere</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden md:table-cell">Baner</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden md:table-cell">Kampe</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingTrainings.map((training) => renderTrainingRow(training, false))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Past Trainings */}
          {pastTrainings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-muted-foreground">Afholdte træninger</h2>
                <span className="text-sm text-muted-foreground">({pastTrainings.length})</span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pastTrainings.map((training) => renderTrainingCard(training, true))}
                </div>
              ) : (
                <div className="bg-card border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left px-4 py-3 text-sm font-medium">Træning</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden sm:table-cell">Spillere</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden md:table-cell">Baner</th>
                          <th className="text-center px-4 py-3 text-sm font-medium hidden md:table-cell">Kampe</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastTrainings.map((training) => renderTrainingRow(training, true))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state for both sections */}
          {upcomingTrainings.length === 0 && pastTrainings.length === 0 && (
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
          )}
        </div>
      )}
    </div>
  )
}
