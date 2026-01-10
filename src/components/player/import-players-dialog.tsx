'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Download } from 'lucide-react'

interface ImportPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface HoldsportTeam {
  id: string
  name: string
  primary_color: string
  secondary_color: string
  role: number
}

export function ImportPlayersDialog({ open, onOpenChange, onSuccess }: ImportPlayersDialogProps) {
  const [loading, setLoading] = useState(false)
  const [playerData, setPlayerData] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    imported: number
    updated?: number
    skipped?: number
    duplicates?: number
    errors?: string[]
  } | null>(null)
  const [error, setError] = useState('')

  // Holdsport API state
  const [holdsportUsername, setHoldsportUsername] = useState('')
  const [holdsportPassword, setHoldsportPassword] = useState('')
  const [holdsportTeams, setHoldsportTeams] = useState<HoldsportTeam[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [fetchingTeams, setFetchingTeams] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        setError('Vælg venligst en CSV eller TXT fil')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleFileImport = async () => {
    if (!selectedFile) {
      setError('Vælg venligst en fil')
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      // Read file content
      const text = await selectedFile.text()

      // Parse CSV/TXT
      const lines = text.split('\n').filter(line => line.trim())
      const players: Array<{ name: string; email?: string }> = []

      lines.forEach((line, index) => {
        // Skip header if it looks like one
        if (index === 0 && (
          line.toLowerCase().includes('navn') ||
          line.toLowerCase().includes('name') ||
          line.toLowerCase().includes('email')
        )) {
          return
        }

        // Try different separators: comma, semicolon, tab
        const parts = line.split(/[,;\t]/).map(p => p.trim()).filter(p => p)

        if (parts.length > 0) {
          const name = parts[0]
          const email = parts.length > 1 ? parts[1] : undefined

          if (name && name.length > 1) {
            players.push({ name, email })
          }
        }
      })

      // Send to API
      const res = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Import fejlede')
      }

      const data = await res.json()
      setResult(data)

      if (data.imported > 0) {
        setSelectedFile(null)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    try {
      setLoading(true)
      setError('')
      setResult(null)

      const res = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerData }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Import fejlede')
      }

      const data = await res.json()
      setResult(data)

      if (data.imported > 0) {
        setPlayerData('')
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchTeams = async () => {
    if (!holdsportUsername || !holdsportPassword) {
      setError('Indtast venligst brugernavn og adgangskode')
      return
    }

    try {
      setFetchingTeams(true)
      setError('')
      setHoldsportTeams([])
      setSelectedTeamId('')

      const res = await fetch(
        `/api/players/holdsport?username=${encodeURIComponent(holdsportUsername)}&password=${encodeURIComponent(holdsportPassword)}`
      )

      if (!res.ok) {
        const errorData = await res.json()
        const errorMsg = errorData.error || 'Kunne ikke hente teams'
        const details = errorData.details ? `\n\nDetaljer: ${errorData.details}` : ''
        throw new Error(errorMsg + details)
      }

      const teams: HoldsportTeam[] = await res.json()
      setHoldsportTeams(teams)

      if (teams.length === 0) {
        setError('Ingen teams fundet for denne bruger. Kontakt Holdsport support hvis du mener dette er en fejl.')
      }
    } catch (err) {
      console.error('Holdsport fetch error:', err)
      setError(err instanceof Error ? err.message : 'Der opstod en fejl ved forbindelse til Holdsport')
    } finally {
      setFetchingTeams(false)
    }
  }

  const handleHoldsportImport = async () => {
    console.log('=== handleHoldsportImport called ===')
    console.log('State values:', {
      selectedTeamId,
      holdsportUsername,
      holdsportPassword,
      hasUsername: !!holdsportUsername,
      hasPassword: !!holdsportPassword,
    })

    if (!selectedTeamId) {
      setError('Vælg venligst et hold')
      return
    }

    if (!holdsportUsername || !holdsportPassword) {
      console.error('Missing credentials in state!')
      setError('Brugernavn og adgangskode mangler. Indtast dem igen.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      // Get selected team name
      const selectedTeam = holdsportTeams.find(t => t.id === selectedTeamId)
      const teamName = selectedTeam?.name || 'Unavngivet hold'

      // Import team and members from Holdsport (creates team + players + associations in one call)
      const fetchRes = await fetch('/api/players/holdsport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: holdsportUsername,
          password: holdsportPassword,
          teamId: selectedTeamId,
          teamName,
        }),
      })

      if (!fetchRes.ok) {
        const errorData = await fetchRes.json()
        const errorMsg = errorData.error || 'Kunne ikke importere hold og spillere'
        const details = errorData.details ? `\n\nDetaljer: ${errorData.details}` : ''
        throw new Error(errorMsg + details)
      }

      const data = await fetchRes.json()

      // Save credentials for auto-sync
      localStorage.setItem('holdsport_username', holdsportUsername)
      localStorage.setItem('holdsport_password', holdsportPassword)
      localStorage.setItem('holdsport_teamId', selectedTeamId)

      // Set result - the API already imported to database
      setResult({
        imported: data.imported,
        updated: data.updated,
        skipped: data.skipped,
        duplicates: 0,
        errors: [],
      })

      if (data.imported > 0 || data.updated > 0) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer spillere fra Holdsport</DialogTitle>
          <DialogDescription>
            Vælg mellem at kopiere/indsætte data eller uploade en CSV fil
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="holdsport" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holdsport">Holdsport API</TabsTrigger>
            <TabsTrigger value="paste">Kopier & Indsæt</TabsTrigger>
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="holdsport" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="holdsportUsername">Holdsport Brugernavn</Label>
                  <Input
                    id="holdsportUsername"
                    value={holdsportUsername}
                    onChange={(e) => setHoldsportUsername(e.target.value)}
                    placeholder="dit-brugernavn"
                    disabled={fetchingTeams}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="holdsportPassword">Holdsport Adgangskode</Label>
                  <Input
                    id="holdsportPassword"
                    type="password"
                    value={holdsportPassword}
                    onChange={(e) => setHoldsportPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={fetchingTeams}
                  />
                </div>
              </div>

              <Button
                onClick={handleFetchTeams}
                disabled={loading || fetchingTeams || !holdsportUsername || !holdsportPassword}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                {fetchingTeams ? 'Henter teams...' : 'Hent mine teams'}
              </Button>

              {holdsportTeams.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="teamSelect">Vælg hold</Label>
                  <Select
                    value={selectedTeamId}
                    onValueChange={setSelectedTeamId}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vælg et hold" />
                    </SelectTrigger>
                    <SelectContent>
                      {holdsportTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Kun aktive spillere (role = player) bliver importeret
                  </p>
                </div>
              )}

              {holdsportTeams.length > 0 && (
                <Button
                  onClick={handleHoldsportImport}
                  disabled={loading || !selectedTeamId}
                  className="w-full"
                >
                  {loading ? 'Importerer spillere...' : 'Importer spillere fra Holdsport'}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerData">Spillerdata</Label>
              <Textarea
                id="playerData"
                value={playerData}
                onChange={(e) => setPlayerData(e.target.value)}
                placeholder="Indsæt spillere her (en pr. linje)&#10;&#10;Format:&#10;Navn&#9;Email&#10;eller bare:&#10;Navn"
                rows={10}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Hver spiller på en ny linje. Navn og email adskilt med Tab.
                Hvis kun navn, får spilleren ingen email.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={loading || !playerData.trim()}
              >
                {loading ? 'Importerer...' : 'Importer spillere'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV Fil</Label>
              <div className="flex items-center gap-3">
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('csvFile')?.click()}
                  disabled={loading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Vælg CSV fil'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Understøtter CSV filer med komma, semikolon eller tab som separator.
                Første linje med "Navn" eller "Email" springes over automatisk.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 mt-3">
                <p className="text-xs font-medium mb-1">Forventet format:</p>
                <pre className="text-xs text-muted-foreground">
Navn,Email{'\n'}
Anders Andersen,anders@mail.dk{'\n'}
Bent Hansen,bent@mail.dk
                </pre>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleFileImport}
                disabled={loading || !selectedFile}
              >
                {loading ? 'Importerer...' : 'Importer fra fil'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="rounded-md bg-primary/10 p-4 space-y-2">
            <p className="font-medium text-primary">
              ✅ Importeret {result.imported} {result.imported === 1 ? 'spiller' : 'spillere'}
              {result.updated ? `, opdateret ${result.updated}` : ''}
              {result.skipped ? `, sprunget over ${result.skipped}` : ''}
            </p>
            {result.errors && result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Fejl:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive space-y-2">
            <p className="font-semibold">⚠️ Fejl:</p>
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPlayerData('')
              setSelectedFile(null)
              setHoldsportUsername('')
              setHoldsportPassword('')
              setHoldsportTeams([])
              setSelectedTeamId('')
              setResult(null)
              setError('')
              onOpenChange(false)
            }}
            disabled={loading}
          >
            Luk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
