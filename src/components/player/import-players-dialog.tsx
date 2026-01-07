'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ImportPlayersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportPlayersDialog({ open, onOpenChange, onSuccess }: ImportPlayersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer fra Holdsport</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-muted-foreground">
          Import formular kommer snart...
        </div>
      </DialogContent>
    </Dialog>
  )
}
