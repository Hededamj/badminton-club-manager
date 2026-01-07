'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface DeletePlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  player: any
}

export function DeletePlayerDialog({ open, onOpenChange, onSuccess, player }: DeletePlayerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/players/${player.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete player')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Slet spiller</DialogTitle>
              <DialogDescription>
                Er du sikker på at du vil slette denne spiller?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="font-medium">{player.name}</p>
            {player.email && (
              <p className="text-sm text-muted-foreground">{player.email}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Niveau: {Math.round(player.level)} • {player.statistics?.totalMatches || 0} kampe
            </p>
          </div>

          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
            <p className="text-sm text-destructive font-medium">
              Advarsel: Denne handling kan ikke fortrydes
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Alle spillerens data, inklusiv statistikker og kamphistorik, vil blive permanent slettet.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuller
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Sletter...' : 'Slet spiller'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
