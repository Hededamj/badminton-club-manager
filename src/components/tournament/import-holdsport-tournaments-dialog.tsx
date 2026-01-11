'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Calendar, Users, Check, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface HoldsportTeam {
  id: string
  name: string
}

interface HoldsportTournament {
  holdsportId: string
  name: string
  date: string
  startTime: string | null
  endTime: string | null
  playerCount: number
  players: Array<{
    user_id: string
    name: string
  }>
}

interface ImportHoldsportTournamentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const formatOptions = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination' },
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'SWISS', label: 'Swiss' },
]

const matchTypeOptions = [
  { value: 'MENS_DOUBLES', label: 'Herre Double (HD)' },
  { value: 'WOMENS_DOUBLES', label: 'Dame Double (DD)' },
  { value: 'MIXED_DOUBLES', label: 'Mix Double (MD)' },
  { value: 'SINGLES', label: 'Single' },
]

export function ImportHoldsportTournamentsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportHoldsportTournamentsDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [teams, setTeams] = useState<HoldsportTeam[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [tournaments, setTournaments] = useState<HoldsportTournament[]>([])
  const [fetchingTeams, setFetchingTeams] = useState(false)
  const [fetchingTournaments, setFetchingTournaments] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [fetchAllTournaments, setFetchAllTournaments] = useState(true) // Default to all for tournaments

  // Tournament settings per activity
  const [tournamentSettings, setTournamentSettings] = useState<Record<string, {
    format: string
    matchTypes: string[]
  }>>({})

  const handleFetchTeams = async () => {
    if (!username || !password) {
      setError('Indtast brugernavn og adgangskode')
      return
    }

    try {
      setFetchingTeams(true)
      setError('')
      setTeams([])
      setSelectedTeamId('')
      setTournaments([])

      const res = await fetch(
        `/api/players/holdsport?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke hente teams')
      }

      const fetchedTeams: HoldsportTeam[] = await res.json()
      setTeams(fetchedTeams)

      if (fetchedTeams.length === 0) {
        setError('Ingen teams fundet')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setFetchingTeams(false)
    }
  }

  const handleFetchTournaments = async () => {
    if (!selectedTeamId) {
      setError('Vælg et hold først')
      return
    }

    if (!username || !password) {
      setError('Brugernavn og adgangskode mangler')
      return
    }

    try {
      setFetchingTournaments(true)
      setError('')
      setTournaments([])

      const days = fetchAllTournaments ? 90 : 30 // Fetch 90 days if "all" is selected, otherwise 30 days
      const res = await fetch(
        `/api/tournaments/holdsport?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&teamId=${selectedTeamId}&days=${days}`
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke hente aktiviteter')
      }

      const data = await res.json()
      setTournaments(data.tournaments)

      // Initialize default settings for each tournament
      const defaultSettings: Record<string, { format: string; matchTypes: string[] }> = {}
      data.tournaments.forEach((tournament: HoldsportTournament) => {
        defaultSettings[tournament.holdsportId] = {
          format: 'ROUND_ROBIN',
          matchTypes: ['MENS_DOUBLES', 'WOMENS_DOUBLES', 'MIXED_DOUBLES'],
        }
      })
      setTournamentSettings(defaultSettings)

      if (data.tournaments.length === 0) {
        setError(fetchAllTournaments ? 'Ingen planlagte aktiviteter fundet' : 'Ingen planlagte aktiviteter fundet de næste 30 dage')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setFetchingTournaments(false)
    }
  }

  const handleImportTournament = async (tournament: HoldsportTournament) => {
    if (!username || !password) {
      setError('Brugernavn og adgangskode mangler')
      return
    }

    const settings = tournamentSettings[tournament.holdsportId]
    if (!settings || !settings.format || settings.matchTypes.length === 0) {
      setError('Vælg turnerings format og kamp typer')
      return
    }

    try {
      setImporting(tournament.holdsportId)
      setError('')

      const res = await fetch('/api/tournaments/holdsport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament,
          username,
          password,
          teamId: selectedTeamId,
          format: settings.format,
          matchTypes: settings.matchTypes,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke importere turnering')
      }

      const result = await res.json()
      console.log('Import result:', result)

      // Mark as imported
      setImportedIds(prev => new Set([...prev, tournament.holdsportId]))

      // Show success message
      alert(`Turnering importeret!\\n\\n${result.matched} spillere matchet fra ${result.total} tilmeldte.\\n${result.unmatched > 0 ? `\\n${result.unmatched} spillere kunne ikke matches - de skal måske oprettes først.` : ''}`)

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setImporting(null)
    }
  }

  const updateTournamentSetting = (holdsportId: string, key: 'format' | 'matchTypes', value: any) => {
    setTournamentSettings(prev => ({
      ...prev,
      [holdsportId]: {
        ...prev[holdsportId],
        [key]: value,
      },
    }))
  }

  const toggleMatchType = (holdsportId: string, matchType: string) => {
    const current = tournamentSettings[holdsportId]?.matchTypes || []
    const updated = current.includes(matchType)
      ? current.filter(mt => mt !== matchType)
      : [...current, matchType]

    updateTournamentSetting(holdsportId, 'matchTypes', updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer turneringer fra Holdsport</DialogTitle>
          <DialogDescription>
            Hent aktiviteter fra Holdsport og opret som turneringer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Login */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold">Log ind på Holdsport</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 ml-10">
              <div className="space-y-2">
                <Label htmlFor="username">Brugernavn</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="demo"
                  disabled={fetchingTeams}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Adgangskode</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo"
                  disabled={fetchingTeams}
                />
              </div>
            </div>

            <div className="ml-10">
              <Button
                onClick={handleFetchTeams}
                disabled={fetchingTeams || !username || !password}
                className="w-full md:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                {fetchingTeams ? 'Henter teams...' : 'Hent mine teams'}
              </Button>
            </div>
          </div>

          {/* Step 2: Select team */}
          {teams.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Vælg hold</h3>
              </div>

              <div className="ml-10 space-y-3">
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg et hold" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fetchAll"
                    checked={fetchAllTournaments}
                    onCheckedChange={(checked) => setFetchAllTournaments(checked === true)}
                  />
                  <label
                    htmlFor="fetchAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vis aktiviteter fra de næste 90 dage (i stedet for 30)
                  </label>
                </div>

                <Button
                  onClick={handleFetchTournaments}
                  disabled={fetchingTournaments || !selectedTeamId}
                  className="w-full md:w-auto"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {fetchingTournaments ? 'Henter aktiviteter...' : 'Hent aktiviteter'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Import tournaments */}
          {tournaments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Importer aktiviteter som turneringer ({tournaments.length})</h3>
              </div>

              <div className="ml-10 space-y-4">
                {tournaments.map((tournament) => {
                  const isImported = importedIds.has(tournament.holdsportId)
                  const isImporting = importing === tournament.holdsportId
                  const settings = tournamentSettings[tournament.holdsportId] || { format: 'ROUND_ROBIN', matchTypes: [] }

                  return (
                    <div
                      key={tournament.holdsportId}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#005A9C]" />
                            <h4 className="font-medium">{tournament.name}</h4>
                            {isImported && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="w-3 h-3 mr-1" />
                                Importeret
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {tournament.date ? format(new Date(tournament.date), 'd. MMMM yyyy', { locale: da }) : 'Ingen dato'}
                            </span>
                            {tournament.startTime && (
                              <span>
                                Kl. {tournament.startTime}
                                {tournament.endTime && ` - ${tournament.endTime}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {tournament.playerCount} tilmeldte
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tournament Settings */}
                      {!isImported && (
                        <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                          <div className="space-y-2">
                            <Label>Turnerings Format</Label>
                            <Select
                              value={settings.format}
                              onValueChange={(value) => updateTournamentSetting(tournament.holdsportId, 'format', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {formatOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Kamp Typer</Label>
                            <div className="flex flex-wrap gap-2">
                              {matchTypeOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => toggleMatchType(tournament.holdsportId, option.value)}
                                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                                    settings.matchTypes.includes(option.value)
                                      ? 'bg-[#005A9C] text-white'
                                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleImportTournament(tournament)}
                        disabled={isImporting || isImported}
                        size="sm"
                        className="w-full"
                      >
                        {isImporting ? 'Importerer...' : isImported ? 'Importeret' : 'Importer som Turnering'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setUsername('')
                setPassword('')
                setTeams([])
                setSelectedTeamId('')
                setTournaments([])
                setImportedIds(new Set())
                setTournamentSettings({})
                setError('')
              }}
            >
              Luk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
