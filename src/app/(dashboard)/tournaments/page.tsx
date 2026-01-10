'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TournamentsListRedesign } from '@/components/tournament/tournaments-list-redesign'

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
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <TournamentsListRedesign
      tournaments={tournaments}
      loading={loading}
      onCreateClick={() => router.push('/tournaments/new')}
    />
  )
}
