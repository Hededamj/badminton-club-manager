'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload } from 'lucide-react'

interface ImportPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportPlayersDialog({ open, onOpenChange, onSuccess }: ImportPlayersDialogProps) {
  const [loading, setLoading] = useState(false)
  const [playerData, setPlayerData] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<{
    imported: number
    errors?: string[]
  } | null>(null)
  const [error, setError] = useState('')

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer spillere fra Holdsport</DialogTitle>
          <DialogDescription>
            Vælg mellem at kopiere/indsætte data eller uploade en CSV fil
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">Kopier & Indsæt</TabsTrigger>
            <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          </TabsList>

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
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPlayerData('')
              setSelectedFile(null)
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
