'use client'

import { Plus, Trophy, Calendar, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

interface TournamentsListCleanProps {
  tournaments: Tournament[]
  loading: boolean
  onCreateClick: () => void
  onImportClick?: () => void
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

export function TournamentsListClean({
  tournaments,
  loading,
  onCreateClick,
  onImportClick,
}: TournamentsListCleanProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#005A9C]">Turneringer</h1>
          <p className="text-muted-foreground mt-1">
            {!loading && `${tournaments.length} ${tournaments.length === 1 ? 'turnering' : 'turneringer'}`}
          </p>
        </div>

        <div className="flex gap-2">
          {onImportClick && (
            <Button
              onClick={onImportClick}
              variant="outline"
              className="border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C]/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Importer fra Holdsport
            </Button>
          )}
          <Button
            onClick={onCreateClick}
            className="bg-[#005A9C] hover:bg-[#004A7C]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny Turnering
          </Button>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-muted border-t-[#005A9C] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Indlæser turneringer...</p>
          </div>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ingen turneringer fundet</h3>
          <p className="text-muted-foreground mb-6">
            Opret din første turnering for at komme i gang.
          </p>
          <Button
            onClick={onCreateClick}
            className="bg-[#005A9C] hover:bg-[#004A7C]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Opret Turnering
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => {
            const config = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.PLANNED
            const startDate = new Date(tournament.startDate)
            const endDate = tournament.endDate ? new Date(tournament.endDate) : null

            return (
              <div
                key={tournament.id}
                onClick={() => router.push(`/tournaments/${tournament.id}`)}
                className="group bg-card border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-lg bg-[#005A9C]`} />

                {/* Header */}
                <div className="flex items-start justify-between mb-4 mt-1">
                  <div className="p-3 rounded-lg bg-[#005A9C]/10">
                    <Trophy className="h-6 w-6 text-[#005A9C]" />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#005A9C] transition-colors">
                  {tournament.name}
                </h3>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(startDate, 'd. MMM', { locale: da })}
                    {endDate && ` - ${format(endDate, 'd. MMM', { locale: da })}`}
                  </span>
                </div>

                {/* Match Types */}
                {tournament.matchTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tournament.matchTypes.map((type) => (
                      <span
                        key={type}
                        className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {matchTypeLabels[type] || type}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t text-sm">
                  <span className="text-muted-foreground">
                    {formatLabels[tournament.format] || tournament.format}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#005A9C] transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
