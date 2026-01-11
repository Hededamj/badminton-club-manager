'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Calendar, Users, Check } from 'lucide-react'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface HoldsportTeam {
  id: string
  name: string
}

interface HoldsportTraining {
  holdsportId: string
  name: string
  date: string
  startTime: string | null
  endTime: string | null
  playerCount: number
  players: Array<{
    user_id: string
    first_name: string
    last_name: string
  }>
}

interface ImportHoldsportTrainingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportHoldsportTrainingsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportHoldsportTrainingsDialogProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [teams, setTeams] = useState<HoldsportTeam[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [trainings, setTrainings] = useState<HoldsportTraining[]>([])
  const [fetchingTeams, setFetchingTeams] = useState(false)
  const [fetchingTrainings, setFetchingTrainings] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [fetchAllTrainings, setFetchAllTrainings] = useState(false)

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
      setTrainings([])

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

  const handleFetchTrainings = async () => {
    if (!selectedTeamId) {
      setError('Vælg et hold først')
      return
    }

    if (!username || !password) {
      setError('Brugernavn og adgangskode mangler')
      return
    }

    try {
      setFetchingTrainings(true)
      setError('')
      setTrainings([])

      const days = fetchAllTrainings ? 60 : 7 // Fetch 60 days if "all" is selected, otherwise 7 days
      const res = await fetch(
        `/api/trainings/holdsport?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&teamId=${selectedTeamId}&days=${days}`
      )

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke hente træninger')
      }

      const data = await res.json()
      setTrainings(data.trainings)

      if (data.trainings.length === 0) {
        setError(fetchAllTrainings ? 'Ingen planlagte træninger fundet' : 'Ingen planlagte træninger fundet de næste 7 dage')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setFetchingTrainings(false)
    }
  }

  const handleImportTraining = async (training: HoldsportTraining) => {
    if (!username || !password) {
      setError('Brugernavn og adgangskode mangler')
      return
    }

    try {
      setImporting(training.holdsportId)
      setError('')

      const res = await fetch('/api/trainings/holdsport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          training,
          username,
          password,
          teamId: selectedTeamId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke importere træning')
      }

      const result = await res.json()
      console.log('Import result:', result)

      // Save credentials for auto-sync
      localStorage.setItem('holdsport_username', username)
      localStorage.setItem('holdsport_password', password)
      localStorage.setItem('holdsport_teamId', selectedTeamId)

      // Mark as imported
      setImportedIds(prev => new Set([...prev, training.holdsportId]))

      // Show success message
      alert(`Træning importeret!\n\n${result.matched} spillere matchet fra ${result.total} tilmeldte.\n${result.unmatched > 0 ? `\n${result.unmatched} spillere kunne ikke matches - de skal måske oprettes først.` : ''}`)

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setImporting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer træninger fra Holdsport</DialogTitle>
          <DialogDescription>
            Hent planlagte træninger fra Holdsport
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
                    checked={fetchAllTrainings}
                    onCheckedChange={(checked) => setFetchAllTrainings(checked === true)}
                  />
                  <label
                    htmlFor="fetchAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Hent alle træninger (kan tage længere tid)
                  </label>
                </div>

                <Button
                  onClick={handleFetchTrainings}
                  disabled={fetchingTrainings || !selectedTeamId}
                  className="w-full md:w-auto"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {fetchingTrainings ? 'Henter træninger...' : fetchAllTrainings ? 'Hent alle planlagte træninger' : 'Hent træninger (7 dage)'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Import trainings */}
          {trainings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Importer træninger ({trainings.length})</h3>
              </div>

              <div className="ml-10 space-y-3">
                {trainings.map((training) => {
                  const isImported = importedIds.has(training.holdsportId)
                  const isImporting = importing === training.holdsportId

                  return (
                    <div
                      key={training.holdsportId}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{training.name}</h4>
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
                              {training.date ? format(new Date(training.date), 'd. MMMM yyyy', { locale: da }) : 'Ingen dato'}
                            </span>
                            {training.startTime && (
                              <span>
                                Kl. {training.startTime}
                                {training.endTime && ` - ${training.endTime}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {training.playerCount} tilmeldte
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleImportTraining(training)}
                          disabled={isImporting || isImported}
                          size="sm"
                        >
                          {isImporting ? 'Importerer...' : isImported ? 'Importeret' : 'Importer'}
                        </Button>
                      </div>
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
                setTrainings([])
                setImportedIds(new Set())
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
