'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Trash2, Play, CheckCircle2, Grid3x3, List, RefreshCw, Pause, PlayCircle, Edit, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'
import { MatchResultDialog } from '@/components/match/match-result-dialog'
import { EditMatchDialog } from '@/components/match/edit-match-dialog'
import { CourtView } from '@/components/match/court-view'
import { TrainingCourtViewRedesign } from '@/components/training/training-court-view-redesign'
import { AddGuestDialog } from '@/components/training/add-guest-dialog'
import { AddPlayerDialog } from '@/components/training/add-player-dialog'

interface Training {
  id: string
  name: string
  date: string
  startTime: string | null
  courts: number
  matchesPerCourt: number
  status: string
  holdsportId: string | null
  trainingPlayers: Array<{
    id: string
    paused: boolean
    pausedAt: string | null
    player: {
      id: string
      name: string
      level: number
      isActive: boolean
    }
  }>
  matches: Array<{
    id: string
    courtNumber: number
    matchNumber: number
    benchedPlayers?: Array<{
      id: string
      name: string
      level: number
    }> | null
    matchPlayers: Array<{
      player: {
        id: string
        name: string
        level: number
        gender?: 'MALE' | 'FEMALE' | null
      }
      team: number
      position: number
    }>
    result: any
  }>
}

const statusLabels: Record<string, string> = {
  PLANNED: 'Planlagt',
  IN_PROGRESS: 'I gang',
  COMPLETED: 'Afsluttet',
  CANCELLED: 'Aflyst',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  PLANNED: 'default',
  IN_PROGRESS: 'secondary',
  COMPLETED: 'outline',
  CANCELLED: 'outline',
}

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [pausingPlayerId, setPausingPlayerId] = useState<string | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [matchToEdit, setMatchToEdit] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'graphic' | 'list'>('graphic')
  const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<string | null>(null)
  const [selectedMatchPlayer, setSelectedMatchPlayer] = useState<{playerId: string, matchId: string, team: number, position: number} | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [showAddGuestDialog, setShowAddGuestDialog] = useState(false)
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false)
  const [highlightedPlayers, setHighlightedPlayers] = useState<Set<string>>(new Set())
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    fetchTraining()
  }, [params.id])

  // Reset sync ref when training id changes
  useEffect(() => {
    hasSyncedRef.current = false
  }, [params.id])

  // Auto-sync with Holdsport when page loads
  useEffect(() => {
    const autoSync = async () => {
      if (!training?.holdsportId || syncing || hasSyncedRef.current) {
        return
      }

      // Don't auto-sync completed trainings
      const allMatchesHaveResults = training.matches.length > 0 && training.matches.every(m => m.result !== null)
      if (allMatchesHaveResults) {
        return
      }

      // Check if we have saved credentials
      const username = localStorage.getItem('holdsport_username')
      const password = localStorage.getItem('holdsport_password')
      const teamId = localStorage.getItem('holdsport_teamId')

      if (!username || !password || !teamId) {
        return // No credentials, skip auto-sync
      }

      console.log('Auto-syncing with Holdsport...')
      hasSyncedRef.current = true

      try {
        setSyncing(true)
        const res = await fetch(`/api/trainings/${training.id}/sync-holdsport`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, teamId }),
        })

        if (res.ok) {
          const data = await res.json()
          console.log('Auto-sync complete:', data)
          if (data.added > 0 || data.removed > 0) {
            fetchTraining() // Refresh if there were changes
          }
        }
      } catch (err) {
        console.error('Auto-sync failed:', err)
        // Fail silently - user can still manually sync
      } finally {
        setSyncing(false)
      }
    }

    autoSync()
  }, [training?.id, training?.holdsportId, training?.status])

  const fetchTraining = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/trainings/${params.id}`)

      if (!res.ok) {
        throw new Error('Kunne ikke hente træningsdata')
      }

      const data = await res.json()
      setTraining(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setLoading(false)
    }
  }

  // Silent refresh without showing loading state
  const refreshTraining = async () => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const res = await fetch(`/api/trainings/${params.id}?_=${Date.now()}`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Kunne ikke hente træningsdata')
      }

      const data = await res.json()
      setTraining(data)
    } catch (err) {
      console.error('Error refreshing training:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Er du sikker på at du vil slette denne træning?')) {
      return
    }

    try {
      const res = await fetch(`/api/trainings/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Kunne ikke slette træning')
      }

      router.push('/trainings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    }
  }


  const handleGenerateMatches = async () => {
    try {
      setGenerating(true)
      setError('')

      const res = await fetch(`/api/trainings/${params.id}/matches`, {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke generere kampe')
      }

      fetchTraining()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setGenerating(false)
    }
  }

  const handlePausePlayer = async (playerId: string, currentPaused: boolean) => {
    try {
      setPausingPlayerId(playerId)
      setError('')

      const res = await fetch(`/api/trainings/${params.id}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused: !currentPaused }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke opdatere spillerstatus')
      }

      fetchTraining()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setPausingPlayerId(null)
    }
  }

  const handleEditMatch = (match: any) => {
    setMatchToEdit(match)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    fetchTraining()
  }

  const handleRemovePlayerFromMatch = async (matchId: string, playerId: string) => {
    if (!training) return

    try {
      setSwapping(true)
      setError('')

      const match = training.matches.find(m => m.id === matchId)
      if (!match) return

      // Get remaining players (exclude the one being removed)
      const remainingPlayers = match.matchPlayers
        .filter(mp => mp.player.id !== playerId)
        .map(mp => ({
          playerId: mp.player.id,
          team: mp.team,
          position: mp.position,
        }))

      const res = await fetch(`/api/trainings/${training.id}/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: remainingPlayers }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke fjerne spiller')
      }

      const data = await res.json()

      // Optimistic update: only update the specific match instead of refetching everything
      setTraining(prev => {
        if (!prev) return prev
        return {
          ...prev,
          matches: prev.matches.map(m =>
            m.id === matchId ? data.match : m
          )
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
      // On error, refetch to ensure consistency
      fetchTraining()
    } finally {
      setSwapping(false)
    }
  }

  const handleSelectBenchPlayer = (playerId: string) => {
    // Deselect any match player when selecting bench player
    setSelectedMatchPlayer(null)
    setSelectedBenchPlayer(selectedBenchPlayer === playerId ? null : playerId)
  }

  const handleSelectMatchPlayer = (playerId: string, matchId: string, team: number, position: number) => {
    // Deselect any bench player when selecting match player
    setSelectedBenchPlayer(null)

    // If clicking the same player, deselect
    if (selectedMatchPlayer?.playerId === playerId) {
      setSelectedMatchPlayer(null)
      return
    }

    setSelectedMatchPlayer({ playerId, matchId, team, position })
  }

  const handleMoveToBench = async () => {
    if (!selectedMatchPlayer || !training) return

    try {
      setSwapping(true)
      setError('')

      const match = training.matches.find(m => m.id === selectedMatchPlayer.matchId)
      if (!match) return

      const playerName = match.matchPlayers.find(mp => mp.player.id === selectedMatchPlayer.playerId)?.player.name

      // Remove the selected player from the match
      const remainingPlayers = match.matchPlayers
        .filter(mp => mp.player.id !== selectedMatchPlayer.playerId)
        .map(mp => ({
          playerId: mp.player.id,
          team: mp.team,
          position: mp.position,
        }))

      const res = await fetch(`/api/trainings/${training.id}/matches/${selectedMatchPlayer.matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: remainingPlayers }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke flytte spiller til bænk')
      }

      const responseData = await res.json()

      // Update training state with the updated match from API response
      setTraining(prev => {
        if (!prev) return prev

        const updatedMatches = prev.matches.map(m => {
          if (m.id === selectedMatchPlayer.matchId) {
            return responseData.match
          }
          return m
        })

        return {
          ...prev,
          matches: updatedMatches
        }
      })

      setSelectedMatchPlayer(null)
    } catch (err) {
      console.error('Error moving to bench:', err)
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
      refreshTraining()
    } finally {
      setSwapping(false)
    }
  }

  const handleClickPlayerPosition = async (
    matchId: string,
    team: number,
    position: number,
    currentPlayerId?: string
  ) => {
    if (!training) return

    // If a bench player is selected, add them to this position
    if (selectedBenchPlayer) {
      await handleAddPlayerToMatch(matchId, team, position)
      return
    }

    // If a match player is selected, swap them
    if (selectedMatchPlayer) {
      await handleSwapPlayers(matchId, team, position, currentPlayerId)
      return
    }

    // If clicking an occupied position with no selection, select that player
    if (currentPlayerId) {
      handleSelectMatchPlayer(currentPlayerId, matchId, team, position)
    }
  }

  const handleSwapPlayers = async (
    targetMatchId: string,
    targetTeam: number,
    targetPosition: number,
    targetPlayerId?: string
  ) => {
    if (!selectedMatchPlayer || !training) return

    // Prevent multiple swaps at once
    if (swapping) return
    setSwapping(true)

    const previousTraining = training // Save for rollback
    setError('')

    // If swapping within the same match
    if (selectedMatchPlayer.matchId === targetMatchId) {
      const match = training.matches.find(m => m.id === targetMatchId)
      if (!match) {
        setSwapping(false)
        return
      }

      // Build optimistic update for UI
      const optimisticMatchPlayers = match.matchPlayers.map(mp => {
        if (mp.player.id === selectedMatchPlayer.playerId) {
          return { ...mp, team: targetTeam, position: targetPosition }
        }
        if (targetPlayerId && mp.player.id === targetPlayerId) {
          return { ...mp, team: selectedMatchPlayer.team, position: selectedMatchPlayer.position }
        }
        return mp
      })

      // Optimistic UI update BEFORE API call
      setTraining(prev => {
        if (!prev) return prev
        return {
          ...prev,
          matches: prev.matches.map(m =>
            m.id === targetMatchId ? { ...m, matchPlayers: optimisticMatchPlayers } : m
          )
        }
      })
      setSelectedMatchPlayer(null)

      // Highlight the swapped players
      const playersToHighlight = new Set<string>([selectedMatchPlayer.playerId])
      if (targetPlayerId) playersToHighlight.add(targetPlayerId)
      setHighlightedPlayers(playersToHighlight)
      setTimeout(() => setHighlightedPlayers(new Set()), 800)

      // API call in background
      const updatedPlayers = optimisticMatchPlayers.map(mp => ({
        playerId: mp.player.id,
        team: mp.team,
        position: mp.position,
      }))

      try {
        const res = await fetch(`/api/trainings/${training.id}/matches/${targetMatchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: updatedPlayers }),
        })

        if (!res.ok) {
          throw new Error('Kunne ikke bytte spillere')
        }
      } catch (err) {
        // Rollback on error
        setTraining(previousTraining)
        setError('Kunne ikke gemme ændringen')
      } finally {
        setSwapping(false)
      }
    } else {
      // Swapping between different matches - need to update both matches
      const sourceMatch = training.matches.find(m => m.id === selectedMatchPlayer.matchId)
      const targetMatch = training.matches.find(m => m.id === targetMatchId)

      if (!sourceMatch || !targetMatch) {
        setSwapping(false)
        return
      }

      // Update source match: remove selected player, add target player if exists
      let sourcePlayers = sourceMatch.matchPlayers
        .filter(mp => mp.player.id !== selectedMatchPlayer.playerId)
        .map(mp => ({
          playerId: mp.player.id,
          team: mp.team,
          position: mp.position,
        }))

      if (targetPlayerId) {
        sourcePlayers.push({
          playerId: targetPlayerId,
          team: selectedMatchPlayer.team,
          position: selectedMatchPlayer.position,
        })
      }

      setSelectedMatchPlayer(null)

      try {
        // To avoid validation errors, we need to update in 3 steps:
        // Step 1: Remove selectedPlayer from source match (without adding targetPlayer yet)
        const sourcePlayersWithoutSelected = sourceMatch.matchPlayers
          .filter(mp => mp.player.id !== selectedMatchPlayer.playerId)
          .map(mp => ({
            playerId: mp.player.id,
            team: mp.team,
            position: mp.position,
          }))

        const sourceRes1 = await fetch(`/api/trainings/${training.id}/matches/${selectedMatchPlayer.matchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: sourcePlayersWithoutSelected }),
        })

        if (!sourceRes1.ok) {
          throw new Error('Kunne ikke fjerne spiller fra kildekamp')
        }

        // Step 2: Update target match (remove targetPlayer if exists, add selectedPlayer)
        let targetPlayers = targetMatch.matchPlayers
          .filter(mp => !targetPlayerId || mp.player.id !== targetPlayerId)
          .map(mp => ({
            playerId: mp.player.id,
            team: mp.team,
            position: mp.position,
          }))

        targetPlayers.push({
          playerId: selectedMatchPlayer.playerId,
          team: targetTeam,
          position: targetPosition,
        })

        const targetRes = await fetch(`/api/trainings/${training.id}/matches/${targetMatchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: targetPlayers }),
        })

        if (!targetRes.ok) {
          throw new Error('Kunne ikke opdatere målkamp')
        }

        // Step 3: Add targetPlayer to source match (if there is one)
        if (targetPlayerId) {
          const sourceRes2 = await fetch(`/api/trainings/${training.id}/matches/${selectedMatchPlayer.matchId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ players: sourcePlayers }),
          })

          if (!sourceRes2.ok) {
            throw new Error('Kunne ikke tilføje spiller til kildekamp')
          }
        }

        // Refresh to get updated data
        refreshTraining()
      } catch (err) {
        setTraining(previousTraining)
        setError('Kunne ikke gemme ændringen')
        fetchTraining()
      } finally {
        setSwapping(false)
      }
    }
  }

  const handleAddPlayerToMatch = async (
    matchId: string,
    team: number,
    position: number
  ) => {
    if (!training || !selectedBenchPlayer) return

    // Prevent multiple operations at once
    if (swapping) return
    setSwapping(true)

    const previousTraining = training // Save for rollback
    setError('')

    const match = training.matches.find(m => m.id === matchId)
    if (!match) {
      setSwapping(false)
      return
    }

    // Find the player being added from training players
    const playerToAdd = training.trainingPlayers.find(tp => tp.player.id === selectedBenchPlayer)?.player
    if (!playerToAdd) {
      setSwapping(false)
      return
    }

    // Build optimistic match players
    let optimisticMatchPlayers = [...match.matchPlayers]
    const occupiedIndex = optimisticMatchPlayers.findIndex(
      mp => mp.team === team && mp.position === position
    )

    if (occupiedIndex >= 0) {
      // Replace player at position
      optimisticMatchPlayers[occupiedIndex] = {
        ...optimisticMatchPlayers[occupiedIndex],
        player: playerToAdd
      }
    } else {
      // Add new player
      optimisticMatchPlayers.push({
        player: playerToAdd,
        team,
        position,
      })
    }

    // Optimistic UI update BEFORE API call
    setTraining(prev => {
      if (!prev) return prev
      return {
        ...prev,
        matches: prev.matches.map(m =>
          m.id === matchId ? { ...m, matchPlayers: optimisticMatchPlayers } : m
        )
      }
    })
    setSelectedBenchPlayer(null)

    // Highlight the added player
    setHighlightedPlayers(new Set([selectedBenchPlayer]))
    setTimeout(() => setHighlightedPlayers(new Set()), 800)

    // API call in background
    const playersForApi = optimisticMatchPlayers.map(mp => ({
      playerId: mp.player.id,
      team: mp.team,
      position: mp.position,
    }))

    try {
      const res = await fetch(`/api/trainings/${training.id}/matches/${matchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersForApi }),
      })

      if (!res.ok) {
        throw new Error('Kunne ikke tilføje spiller')
      }
    } catch (err) {
      // Rollback on error
      setTraining(previousTraining)
      setError('Kunne ikke gemme ændringen')
    } finally {
      setSwapping(false)
    }
  }

  const handleSyncWithHoldsport = async () => {
    try {
      setSyncing(true)
      setError('')

      // Get credentials from localStorage or prompt
      let username = localStorage.getItem('holdsport_username')
      let password = localStorage.getItem('holdsport_password')
      let teamId = localStorage.getItem('holdsport_teamId')

      if (!username || !password || !teamId) {
        username = prompt('Holdsport brugernavn (email):')
        password = prompt('Holdsport adgangskode:')
        teamId = prompt('Holdsport team ID:')

        if (!username || !password || !teamId) {
          throw new Error('Manglende Holdsport credentials')
        }

        // Save for next time
        localStorage.setItem('holdsport_username', username)
        localStorage.setItem('holdsport_password', password)
        localStorage.setItem('holdsport_teamId', teamId)
      }

      const res = await fetch(`/api/trainings/${params.id}/sync-holdsport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, teamId }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Kunne ikke synkronisere med Holdsport')
      }

      const data = await res.json()
      alert(`Synkronisering færdig!\n\nTilføjet: ${data.added} spillere\nFjernet: ${data.removed} spillere\nTotal: ${data.total} spillere`)
      fetchTraining()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Der opstod en fejl')
    } finally {
      setSyncing(false)
    }
  }

  const handleMatchClick = (match: any) => {
    if (!match.result) {
      setSelectedMatch(match)
      setShowResultDialog(true)
    }
  }

  const handleResultSuccess = () => {
    setShowResultDialog(false)
    setSelectedMatch(null)
    fetchTraining()
  }

  const getBenchPlayers = (roundNumber?: number) => {
    if (!training) return []

    // If roundNumber is specified, only look at matches in that round
    const matchesToCheck = roundNumber
      ? training.matches.filter(m => m.matchNumber === roundNumber)
      : training.matches

    // Get all players currently in matches for this round
    const playersInMatches = new Set(
      matchesToCheck.flatMap(m => m.matchPlayers.map(mp => mp.player.id))
    )

    // Get players who are available but not in matches for this round (and not paused)
    const availablePlayers = training.trainingPlayers
      .filter(tp => !tp.paused && !playersInMatches.has(tp.player.id))
      .map(tp => tp.player)

    return availablePlayers
  }

  // Compute automatic status based on matches
  const getTrainingStatus = (): 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' => {
    if (!training) return 'PLANNED'

    if (training.matches.length === 0) {
      return 'PLANNED'
    }

    const allMatchesHaveResults = training.matches.every(m => m.result !== null)
    if (allMatchesHaveResults) {
      return 'COMPLETED'
    }

    return 'IN_PROGRESS'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Indlæser...</p>
      </div>
    )
  }

  if (error || !training) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/trainings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til træninger
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error || 'Træning ikke fundet'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/trainings')}
          className="mb-4 -ml-4"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight">
              {training.name} - {format(new Date(training.date), 'd. MMM yyyy', { locale: da })}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
              <Badge variant={statusVariants[getTrainingStatus()]}>
                {statusLabels[getTrainingStatus()]}
              </Badge>
              <span className="text-muted-foreground text-sm md:text-base">
                {format(new Date(training.date), 'EEEE', { locale: da })}
                {training.startTime && <> kl. {format(new Date(training.startTime), 'HH:mm', { locale: da })}</>}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {training.holdsportId && getTrainingStatus() !== 'COMPLETED' && (
              <Button
                variant="outline"
                onClick={handleSyncWithHoldsport}
                disabled={syncing}
                size="sm"
              >
                <RefreshCw className={`mr-1 md:mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Synkroniserer...' : 'Sync Holdsport'}</span>
                <span className="sm:hidden">Sync</span>
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} size="sm">
              <Trash2 className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Slet</span>
              <span className="sm:hidden">Slet</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:gap-4 grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Baner</CardTitle>
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.courts}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Tilgængelige
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Spillere</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.trainingPlayers.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Tilmeldte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Kampe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{training.matches.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Genererede
            </p>
          </CardContent>
        </Card>
      </div>


      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {training.matches.length === 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Tilmeldte spillere</CardTitle>
                  <CardDescription>
                    {training.trainingPlayers.length} spillere deltager i træningen
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setShowAddPlayerDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Tilføj Spiller</span>
                    <span className="sm:hidden">Spiller</span>
                  </Button>
                  <Button
                    onClick={() => setShowAddGuestDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Tilføj Gæst</span>
                    <span className="sm:hidden">Gæst</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {training.trainingPlayers.map((tp) => (
                  <div
                    key={tp.player.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-opacity ${
                      tp.paused ? 'opacity-50 bg-muted/50' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tp.player.name}</p>
                        {tp.paused && (
                          <Badge variant="outline" className="text-xs">
                            Pauseret
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Niveau: {Math.round(tp.player.level)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!tp.player.isActive && (
                        <Badge variant="secondary">Inaktiv</Badge>
                      )}
                      {getTrainingStatus() === 'IN_PROGRESS' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePausePlayer(tp.player.id, tp.paused)}
                          disabled={pausingPlayerId === tp.player.id}
                        >
                          {tp.paused ? (
                            <PlayCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Pause className="h-4 w-4 text-orange-600" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {getTrainingStatus() === 'PLANNED' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  {training.holdsportId && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        {syncing ? (
                          <>🔄 Synkroniserer spillerliste med Holdsport...</>
                        ) : (
                          <>✓ Spillerliste synkroniseret med Holdsport. Klik for at opdatere igen.</>
                        )}
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleSyncWithHoldsport}
                        disabled={syncing}
                        size="sm"
                        className="border-blue-300 dark:border-blue-700"
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Synkroniserer...' : 'Synkroniser igen'}
                      </Button>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-4">
                    Ingen kampe genereret endnu. Generer kampe for at starte træningen.
                  </p>
                  <Button onClick={handleGenerateMatches} disabled={generating}>
                    {generating ? 'Genererer kampe...' : 'Generer kampe'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Algoritmen optimerer for niveaubalance, variation i partnere og modstandere
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {training.matches.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base md:text-lg">Kampprogram</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {training.matches.length} kampe genereret
                    {selectedBenchPlayer && ' • Klik på en spiller for at bytte'}
                  </CardDescription>
                </div>
              <div className="flex gap-2">
                <div className="flex rounded-lg border border-border">
                  <Button
                    variant={viewMode === 'graphic' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('graphic')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleGenerateMatches}
                  disabled={generating}
                  size="sm"
                  className="hidden md:flex"
                >
                  {generating ? 'Regenererer...' : 'Regenerer kampe'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'graphic' ? (
              // New redesigned graphic view
              <TrainingCourtViewRedesign
                matches={training.matches}
                onMatchClick={handleMatchClick}
                onEditMatch={handleEditMatch}
                getBenchPlayers={getBenchPlayers}
                selectedBenchPlayer={selectedBenchPlayer}
                selectedMatchPlayer={selectedMatchPlayer}
                onSelectBenchPlayer={handleSelectBenchPlayer}
                onClickPlayerPosition={handleClickPlayerPosition}
                onMoveToBench={handleMoveToBench}
                trainingStatus={getTrainingStatus()}
                highlightedPlayers={highlightedPlayers}
              />
            ) : (
              // List view (original)
              <div className="space-y-6">
                {Array.from({ length: training.matchesPerCourt || 3 }, (_, matchIndex) => {
                  const roundMatches = training.matches
                    .filter(m => m.matchNumber === matchIndex + 1)
                    .sort((a, b) => a.courtNumber - b.courtNumber)

                  const benchedPlayersForRound = roundMatches
                    .flatMap(m => m.benchedPlayers || [])
                    .filter((player, index, self) =>
                      self.findIndex(p => p.id === player.id) === index
                    )

                  const availableBenchPlayers = getBenchPlayers(matchIndex + 1)

                  return (
                    <div key={matchIndex + 1} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Kamp {matchIndex + 1}</h3>
                        {availableBenchPlayers.length > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {availableBenchPlayers.length} på bænken
                          </Badge>
                        )}
                      </div>

                      {/* Bench section for this round in list view */}
                      {getTrainingStatus() === 'IN_PROGRESS' && availableBenchPlayers.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-orange-900 mb-2">
                            Spillere på bænken - Klik for at vælge:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableBenchPlayers.map(player => (
                              <Button
                                key={player.id}
                                variant={selectedBenchPlayer === player.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSelectBenchPlayer(player.id)}
                                disabled={swapping}
                                className={`touch-manipulation ${
                                  selectedBenchPlayer === player.id
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-white hover:bg-orange-100'
                                }`}
                              >
                                {player.name} ({Math.round(player.level)})
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {roundMatches.map(match => {
                        const team1 = match.matchPlayers.filter(mp => mp.team === 1)
                        const team2 = match.matchPlayers.filter(mp => mp.team === 2)

                        // Determine match type
                        const allPlayers = [...team1, ...team2].map(mp => mp.player)
                        const genders = allPlayers.map(p => p.gender).filter(Boolean)
                        let matchType = null
                        let matchTypeColor = '#64748b'

                        if (genders.length === 4) {
                          const maleCount = genders.filter(g => g === 'MALE').length
                          const femaleCount = genders.filter(g => g === 'FEMALE').length

                          if (maleCount === 4) {
                            matchType = 'HD'
                            matchTypeColor = '#3b82f6'
                          } else if (femaleCount === 4) {
                            matchType = 'DD'
                            matchTypeColor = '#ec4899'
                          } else if (maleCount === 2 && femaleCount === 2) {
                            matchType = 'MD'
                            matchTypeColor = '#8b5cf6'
                          }
                        }

                        return (
                          <div
                            key={match.id}
                            onClick={() => handleMatchClick(match)}
                            className={`border rounded-lg p-4 space-y-2 ${
                              !match.result
                                ? 'cursor-pointer hover:bg-accent transition-colors'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Bane {match.courtNumber}
                                </span>
                                {matchType && (
                                  <Badge
                                    className="text-white border-0"
                                    style={{ backgroundColor: matchTypeColor }}
                                  >
                                    {matchType}
                                  </Badge>
                                )}
                              </div>
                              {match.result ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {match.result.team1Score} - {match.result.team2Score}
                                  </Badge>
                                  <Badge>Afsluttet</Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Afventer resultat</Badge>
                                  {getTrainingStatus() === 'IN_PROGRESS' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditMatch(match)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Hold 1</p>
                                {[1, 2].map(position => {
                                  const mp = team1.find(p => p.position === position)
                                  return (
                                    <div
                                      key={position}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (getTrainingStatus() === 'IN_PROGRESS' && !match.result) {
                                          if (mp && !selectedBenchPlayer) {
                                            handleRemovePlayerFromMatch(match.id, mp.player.id)
                                          } else if (selectedBenchPlayer) {
                                            handleAddPlayerToMatch(match.id, 1, position)
                                          }
                                        }
                                      }}
                                      className={`text-sm p-1 rounded ${
                                        getTrainingStatus() === 'IN_PROGRESS' && !match.result
                                          ? mp
                                            ? 'cursor-pointer hover:bg-red-100 hover:line-through'
                                            : selectedBenchPlayer
                                            ? 'cursor-pointer hover:bg-green-100 border-2 border-dashed border-gray-300'
                                            : ''
                                          : ''
                                      }`}
                                    >
                                      {mp ? (
                                        `${mp.player.name} (${Math.round(mp.player.level)})`
                                      ) : (
                                        <span className="text-gray-400 italic">Tom position</span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Hold 2</p>
                                {[1, 2].map(position => {
                                  const mp = team2.find(p => p.position === position)
                                  return (
                                    <div
                                      key={position}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (getTrainingStatus() === 'IN_PROGRESS' && !match.result) {
                                          if (mp && !selectedBenchPlayer) {
                                            handleRemovePlayerFromMatch(match.id, mp.player.id)
                                          } else if (selectedBenchPlayer) {
                                            handleAddPlayerToMatch(match.id, 2, position)
                                          }
                                        }
                                      }}
                                      className={`text-sm p-1 rounded ${
                                        getTrainingStatus() === 'IN_PROGRESS' && !match.result
                                          ? mp
                                            ? 'cursor-pointer hover:bg-red-100 hover:line-through'
                                            : selectedBenchPlayer
                                            ? 'cursor-pointer hover:bg-green-100 border-2 border-dashed border-gray-300'
                                            : ''
                                          : ''
                                      }`}
                                    >
                                      {mp ? (
                                        `${mp.player.name} (${Math.round(mp.player.level)})`
                                      ) : (
                                        <span className="text-gray-400 italic">Tom position</span>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                      {benchedPlayersForRound.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-orange-900">
                            Spillere der sidder over i denne runde:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {benchedPlayersForRound.map(player => (
                              <Badge key={player.id} variant="secondary" className="bg-white">
                                {player.name} ({Math.round(player.level)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )
              })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Tilmeldte spillere</CardTitle>
                <CardDescription>
                  {training.trainingPlayers.length} spillere deltager i træningen
                  {training.trainingPlayers.filter(tp => tp.paused).length > 0 && (
                    <> • {training.trainingPlayers.filter(tp => tp.paused).length} pauseret</>
                  )}
                </CardDescription>
              </div>
              {(getTrainingStatus() === 'PLANNED' || getTrainingStatus() === 'IN_PROGRESS') && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setShowAddPlayerDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Tilføj Spiller</span>
                    <span className="sm:hidden">Spiller</span>
                  </Button>
                  <Button
                    onClick={() => setShowAddGuestDialog(true)}
                    size="sm"
                    variant="outline"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Tilføj Gæst</span>
                    <span className="sm:hidden">Gæst</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {training.trainingPlayers.map((tp) => (
                <div
                  key={tp.player.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-2 rounded-lg border transition-opacity gap-2 ${
                    tp.paused ? 'opacity-50 bg-muted/50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{tp.player.name}</p>
                      {tp.paused && (
                        <Badge variant="outline" className="text-xs">
                          Pauseret
                        </Badge>
                      )}
                      {!tp.player.isActive && (
                        <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Niveau: {Math.round(tp.player.level)}
                    </p>
                  </div>
                  {getTrainingStatus() === 'IN_PROGRESS' && (
                    <div className="flex items-center justify-end sm:justify-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePausePlayer(tp.player.id, tp.paused)}
                        disabled={pausingPlayerId === tp.player.id}
                        title={tp.paused ? 'Genoptag spiller' : 'Pausér spiller'}
                        className="h-9"
                      >
                        {tp.paused ? (
                          <PlayCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Pause className="h-4 w-4 text-orange-600" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {selectedMatch && (
        <MatchResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          onSuccess={handleResultSuccess}
          matchId={selectedMatch.id}
          courtNumber={selectedMatch.courtNumber}
          team1Players={selectedMatch.matchPlayers
            .filter((mp: any) => mp.team === 1)
            .map((mp: any) => mp.player)}
          team2Players={selectedMatch.matchPlayers
            .filter((mp: any) => mp.team === 2)
            .map((mp: any) => mp.player)}
        />
      )}

      {matchToEdit && training && (
        <EditMatchDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          matchId={matchToEdit.id}
          trainingId={training.id}
          currentPlayers={matchToEdit.matchPlayers}
          availablePlayers={training.trainingPlayers.map(tp => ({
            ...tp.player,
            paused: tp.paused,
          }))}
          courtNumber={matchToEdit.courtNumber}
          matchNumber={matchToEdit.matchNumber}
          allMatches={training.matches}
          onSuccess={handleEditSuccess}
        />
      )}

      <AddGuestDialog
        open={showAddGuestDialog}
        onOpenChange={setShowAddGuestDialog}
        trainingId={params.id as string}
        onSuccess={fetchTraining}
      />

      <AddPlayerDialog
        open={showAddPlayerDialog}
        onOpenChange={setShowAddPlayerDialog}
        trainingId={params.id as string}
        existingPlayerIds={training.trainingPlayers.map(tp => tp.player.id)}
        onSuccess={fetchTraining}
      />
    </div>
  )
}
