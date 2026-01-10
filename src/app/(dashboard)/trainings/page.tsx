'use client'

import { useEffect, useState } from 'react'
import { TrainingsListMinimal } from '@/components/training/trainings-list-minimal'
import { ImportHoldsportTrainingsDialog } from '@/components/training/import-holdsport-trainings-dialog'

interface Training {
  id: string
  name: string
  date: string
  courts: number
  status: string
  trainingPlayers: Array<{
    player: {
      id: string
      name: string
      level: number
    }
  }>
  _count: {
    matches: number
  }
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showImportDialog, setShowImportDialog] = useState(false)

  const fetchTrainings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/trainings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTrainings(data)
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrainings()
  }, [statusFilter])

  return (
    <>
      <TrainingsListMinimal
        trainings={trainings}
        loading={loading}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onImportClick={() => setShowImportDialog(true)}
      />

      <ImportHoldsportTrainingsDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={fetchTrainings}
      />
    </>
  )
}
