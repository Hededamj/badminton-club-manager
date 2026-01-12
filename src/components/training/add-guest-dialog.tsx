'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus } from 'lucide-react'

interface AddGuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trainingId: string
  onSuccess: () => void
}

export function AddGuestDialog({
  open,
  onOpenChange,
  trainingId,
  onSuccess,
}: AddGuestDialogProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('1500')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Indtast gæstens navn')
      return
    }

    const levelNum = parseInt(level)
    if (isNaN(levelNum) || levelNum < 0 || levelNum > 3000) {
      setError('Niveau skal være mellem 0 og 3000')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const res = await fetch(`/api/trainings/${trainingId}/add-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          level: levelNum,
          gender: gender || null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke tilføje gæst')
      }

      // Reset form
      setName('')
      setLevel('1500')
      setGender('')
      setError('')

      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tilføj Gæst</DialogTitle>
          <DialogDescription>
            Tilføj en gæstespiller til træningen. De kan konverteres til permanente spillere senere.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="F.eks. Lars Gæst"
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau</Label>
              <Input
                id="level"
                type="number"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="1500"
                disabled={submitting}
                min="0"
                max="3000"
              />
              <p className="text-xs text-muted-foreground">
                Standard niveau er 1500. Juster efter spillerens erfaring.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Køn (valgfrit)</Label>
              <Select value={gender || 'NONE'} onValueChange={(value) => setGender(value === 'NONE' ? '' : value as 'MALE' | 'FEMALE')}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Vælg køn (valgfrit)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Ikke angivet</SelectItem>
                  <SelectItem value="MALE">Mand</SelectItem>
                  <SelectItem value="FEMALE">Kvinde</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Hjælper matchmaking algoritmen med at danne bedre kampe.
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
              disabled={submitting}
            >
              Annuller
            </Button>
            <Button type="submit" disabled={submitting}>
              <UserPlus className="mr-2 h-4 w-4" />
              {submitting ? 'Tilføjer...' : 'Tilføj Gæst'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
