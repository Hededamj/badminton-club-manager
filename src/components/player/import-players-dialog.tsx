'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ImportPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportPlayersDialog({ open, onOpenChange, onSuccess }: ImportPlayersDialogProps) {
  const [loading, setLoading] = useState(false)
  const [playerData, setPlayerData] = useState('')
  const [result, setResult] = useState<{
    imported: number
    errors?: string[]
  } | null>(null)
  const [error, setError] = useState('')

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
            Kopier spillerlisten fra Holdsport og indsæt den herunder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPlayerData('')
                setResult(null)
                setError('')
                onOpenChange(false)
              }}
              disabled={loading}
            >
              Luk
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || !playerData.trim()}
            >
              {loading ? 'Importerer...' : 'Importer spillere'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
