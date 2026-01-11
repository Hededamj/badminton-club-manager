'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TournamentsListClean } from '@/components/tournament/tournaments-list-clean'
import { ImportHoldsportTournamentsDialog } from '@/components/tournament/import-holdsport-tournaments-dialog'

interface Tournament {
  id: string
  name: string
  startDate: string
  endDate: string | null
  format: string
  matchTypes: string[]
  status: string
  description: string | null
  _count: {
    matches: number
  }
}

export default function TournamentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments')
      if (res.ok) {
        const data = await res.json()
        setTournaments(data)
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportSuccess = () => {
    fetchTournaments()
  }

  return (
    <>
      <TournamentsListClean
        tournaments={tournaments}
        loading={loading}
        onCreateClick={() => router.push('/tournaments/new')}
        onImportClick={session?.user?.role === 'ADMIN' ? () => setImportDialogOpen(true) : undefined}
      />

      {session?.user?.role === 'ADMIN' && (
        <ImportHoldsportTournamentsDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onSuccess={handleImportSuccess}
        />
      )}
    </>
  )
}
