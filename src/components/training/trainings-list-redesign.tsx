'use client'

import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon, Users, Download, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface TrainingsListRedesignProps {
  trainings: Training[]
  loading: boolean
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  onImportClick: () => void
}

const statusConfig = {
  PLANNED: {
    label: 'Planlagt',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 via-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
  },
  IN_PROGRESS: {
    label: 'I gang',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 via-amber-50 to-orange-100',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-900',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
  },
  COMPLETED: {
    label: 'Afsluttet',
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 via-emerald-50 to-green-100',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-900',
  },
  CANCELLED: {
    label: 'Aflyst',
    color: 'from-slate-400 to-slate-500',
    bgColor: 'from-slate-50 via-slate-50 to-slate-100',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
  },
}

export function TrainingsListRedesign({
  trainings,
  loading,
  statusFilter,
  onStatusFilterChange,
  onImportClick,
}: TrainingsListRedesignProps) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,146,60,0.15),transparent_50%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 to-orange-500 rounded-full" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                TRÆNINGER
              </h1>
              <p className="text-slate-300 text-sm md:text-base mt-1">
                Administrer træningssessioner og kampe
              </p>
            </div>
          </div>

          {/* Actions and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg px-4 py-2.5 text-white font-medium text-sm focus:outline-none focus:border-white/40 transition-colors"
              >
                <option value="ALL" className="text-slate-900">Alle træninger</option>
                <option value="PLANNED" className="text-slate-900">Planlagt</option>
                <option value="IN_PROGRESS" className="text-slate-900">I gang</option>
                <option value="COMPLETED" className="text-slate-900">Afsluttet</option>
                <option value="CANCELLED" className="text-slate-900">Aflyst</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onImportClick}
                className="flex-1 sm:flex-initial bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Importer fra Holdsport</span>
                <span className="sm:hidden">Importer</span>
              </Button>
              <Button
                onClick={() => router.push('/trainings/new')}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Opret træning</span>
                <span className="sm:hidden">Opret</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Training Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Indlæser træninger...</p>
          </div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(148,163,184,0.1),transparent_70%)]" />
          <div className="relative text-center py-16 px-6">
            <CalendarIcon className="mx-auto h-20 w-20 text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              INGEN TRÆNINGER FUNDET
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Opret din første træning for at komme i gang med at administrere kampe og spillere.
            </p>
            <Button
              onClick={() => router.push('/trainings/new')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Opret træning
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {trainings.map((training, index) => {
            const config = statusConfig[training.status as keyof typeof statusConfig]
            const trainingDate = new Date(training.date)
            const dayOfMonth = format(trainingDate, 'd')
            const month = format(trainingDate, 'MMM', { locale: da })
            const dayOfWeek = format(trainingDate, 'EEEE', { locale: da })
            const year = format(trainingDate, 'yyyy')

            return (
              <button
                key={training.id}
                onClick={() => router.push(`/trainings/${training.id}`)}
                className="group relative overflow-hidden rounded-xl border-2 transition-all hover:shadow-xl hover:scale-[1.02] text-left"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.bgColor}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_50%)]" />

                {/* Status Color Bar */}
                <div className={`h-2 bg-gradient-to-r ${config.color}`} />

                {/* Content */}
                <div className="relative p-5">
                  {/* Header with Date and Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Large Date Display */}
                    <div className="flex items-baseline gap-2">
                      <div className={`text-5xl font-black ${config.textColor} leading-none`}>
                        {dayOfMonth}
                      </div>
                      <div className="flex flex-col">
                        <div className={`text-sm font-bold ${config.textColor} uppercase`}>
                          {month}
                        </div>
                        <div className={`text-xs ${config.textColor} opacity-70`}>
                          {year}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`${config.badgeBg} ${config.badgeText} border-0 font-bold text-xs`}>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Training Name */}
                  <h3 className={`text-lg font-bold ${config.textColor} mb-1 line-clamp-2`}>
                    {training.name}
                  </h3>

                  {/* Day of Week */}
                  <p className={`text-sm ${config.textColor} opacity-70 font-medium capitalize mb-4`}>
                    {dayOfWeek}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`${config.textColor} opacity-70 text-xs font-bold uppercase tracking-wide`}>
                        Baner
                      </span>
                      <span className={`${config.textColor} font-black text-base`}>
                        {training.courts}
                      </span>
                    </div>

                    <div className={`w-px h-4 ${config.textColor} opacity-20`} />

                    <div className="flex items-center gap-1.5">
                      <Users className={`h-3.5 w-3.5 ${config.textColor} opacity-70`} />
                      <span className={`${config.textColor} font-black text-base`}>
                        {training.trainingPlayers.length}
                      </span>
                    </div>

                    <div className={`w-px h-4 ${config.textColor} opacity-20`} />

                    <div className="flex items-center gap-1.5">
                      <span className={`${config.textColor} opacity-70 text-xs font-bold uppercase tracking-wide`}>
                        Kampe
                      </span>
                      <span className={`${config.textColor} font-black text-base`}>
                        {training._count.matches}
                      </span>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className={`h-6 w-6 ${config.textColor}`} />
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
