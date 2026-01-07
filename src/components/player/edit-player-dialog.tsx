'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createPlayerSchema, type CreatePlayerInput } from '@/lib/validators/player'

interface EditPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  player: any
}

export function EditPlayerDialog({ open, onOpenChange, onSuccess, player }: EditPlayerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
  })

  const isActive = watch('isActive')

  useEffect(() => {
    if (player && open) {
      reset({
        name: player.name,
        email: player.email || '',
        phone: player.phone || '',
        level: player.level,
        isActive: player.isActive,
      })
    }
  }, [player, open, reset])

  const onSubmit = async (data: CreatePlayerInput) => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`/api/players/${player.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update player')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rediger spiller</DialogTitle>
          <DialogDescription>
            Opdater spillerens oplysninger
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Spillerens fulde navn"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="spiller@example.dk"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="12345678"
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Niveau (ELO)</Label>
            <Input
              id="level"
              type="number"
              {...register('level', { valueAsNumber: true })}
              placeholder="1500"
              disabled={loading}
            />
            {errors.level && (
              <p className="text-sm text-destructive">{errors.level.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Standardværdi er 1500. Justeres automatisk efter kampe.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Aktiv spiller</Label>
              <p className="text-sm text-muted-foreground">
                Inaktive spillere vises ikke i matchmaking
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuller
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Gemmer...' : 'Gem ændringer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
