'use client'

import { Plus, Trophy, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface Tournament {
  id: string
  name: string
  startDate: string
  endDate: string | null
  format: string
  matchTypes: string[]
  status: string
  description: string | null
  _count: {
    matches: number
  }
}

interface TournamentsListRedesignProps {
  tournaments: Tournament[]
  loading: boolean
  onCreateClick: () => void
}

const formatLabels: Record<string, string> = {
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  ROUND_ROBIN: 'Round Robin',
  SWISS: 'Swiss',
}

const matchTypeLabels: Record<string, string> = {
  MENS_DOUBLES: 'HD',
  WOMENS_DOUBLES: 'DD',
  MIXED_DOUBLES: 'MD',
  SINGLES: 'Single',
}

const matchTypeConfig: Record<string, { color: string; bg: string; text: string }> = {
  MENS_DOUBLES: {
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
  },
  WOMENS_DOUBLES: {
    color: 'from-pink-500 to-pink-600',
    bg: 'bg-pink-100',
    text: 'text-pink-900',
  },
  MIXED_DOUBLES: {
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
  },
  SINGLES: {
    color: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
  },
}

const statusConfig = {
  PLANNED: {
    label: 'Planlagt',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 via-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
  },
  IN_PROGRESS: {
    label: 'I gang',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 via-amber-50 to-orange-100',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-900',
  },
  COMPLETED: {
    label: 'Afsluttet',
    color: 'from-slate-400 to-slate-500',
    bgColor: 'from-slate-50 via-slate-50 to-slate-100',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
  },
  CANCELLED: {
    label: 'Aflyst',
    color: 'from-red-400 to-red-500',
    bgColor: 'from-red-50 via-rose-50 to-red-100',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
  },
}

export function TournamentsListRedesign({
  tournaments,
  loading,
  onCreateClick,
}: TournamentsListRedesignProps) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-12 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  TURNERINGER
                </h1>
                <p className="text-slate-300 text-sm md:text-base mt-1">
                  Administrér og deltag i turneringer
                </p>
              </div>
            </div>

            <Button
              onClick={onCreateClick}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Ny Turnering</span>
              <span className="sm:hidden">Ny</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Indlæser turneringer...</p>
          </div>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 border-slate-200">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
          <div className="relative text-center py-16 px-6">
            <Trophy className="mx-auto h-20 w-20 text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              INGEN TURNERINGER
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Kom i gang ved at oprette din første turnering
            </p>
            <Button
              onClick={onCreateClick}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Opret Turnering
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament, index) => {
            const config = statusConfig[tournament.status as keyof typeof statusConfig]
            const startDate = new Date(tournament.startDate)
            const endDate = tournament.endDate ? new Date(tournament.endDate) : null

            return (
              <button
                key={tournament.id}
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
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
                  {/* Header with Trophy and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${config.color}`}>
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <Badge className={`${config.textColor} opacity-80 border-0 font-bold text-xs`}>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Tournament Name */}
                  <h3 className={`text-xl font-black ${config.textColor} mb-2 line-clamp-2`}>
                    {tournament.name}
                  </h3>

                  {/* Format */}
                  <p className={`text-sm ${config.textColor} opacity-70 font-medium mb-4`}>
                    {formatLabels[tournament.format] || tournament.format}
                  </p>

                  {/* Dates */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className={`h-4 w-4 ${config.textColor} opacity-70`} />
                    <span className={`text-sm ${config.textColor} font-medium`}>
                      {format(startDate, 'd. MMM yyyy', { locale: da })}
                      {endDate && ` - ${format(endDate, 'd. MMM yyyy', { locale: da })}`}
                    </span>
                  </div>

                  {/* Match Types */}
                  {tournament.matchTypes && tournament.matchTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tournament.matchTypes.map((type) => {
                        const typeConfig = matchTypeConfig[type] || matchTypeConfig.SINGLES
                        return (
                          <Badge
                            key={type}
                            className={`${typeConfig.bg} ${typeConfig.text} border-0 font-bold text-xs`}
                          >
                            {matchTypeLabels[type] || type}
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  {/* Matches Count */}
                  <div className={`text-sm ${config.textColor} opacity-70 mb-3`}>
                    <span className="font-bold">{tournament._count.matches}</span> kampe
                  </div>

                  {/* Description */}
                  {tournament.description && (
                    <p className={`text-sm ${config.textColor} opacity-70 line-clamp-2`}>
                      {tournament.description}
                    </p>
                  )}

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
