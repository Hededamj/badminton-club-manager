'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PlayerDetailClean } from '@/components/player/player-detail-clean'
import { EditPlayerDialog } from '@/components/player/edit-player-dialog'

interface Player {
  id: string
  name: string
  email: string | null
  phone: string | null
  level: number
  gender: 'MALE' | 'FEMALE' | null
  isActive: boolean
  createdAt: string
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }
}

export default function PlayerDetailPage() {
  const params = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/players/${params.id}`)

        if (!res.ok) {
          throw new Error('Kunne ikke hente spillerdata')
        }

        const data = await res.json()
        setPlayer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Der opstod en fejl')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPlayer()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Indlæser spiller...</p>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium mb-4">{error || 'Spiller ikke fundet'}</p>
      </div>
    )
  }

  const handleEditSuccess = async () => {
    // Refresh player data after edit
    if (params.id) {
      try {
        const res = await fetch(`/api/players/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setPlayer(data)
        }
      } catch (err) {
        console.error('Failed to refresh player data:', err)
      }
    }
    setEditDialogOpen(false)
  }

  return (
    <>
      <PlayerDetailClean
        player={player}
        onEditClick={() => setEditDialogOpen(true)}
      />

      {player && (
        <EditPlayerDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          player={player}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
