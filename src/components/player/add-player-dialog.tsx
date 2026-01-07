'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface AddPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPlayerDialog({ open, onOpenChange, onSuccess }: AddPlayerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tilføj spiller</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-muted-foreground">
          Formular kommer snart...
        </div>
      </DialogContent>
    </Dialog>
  )
}
