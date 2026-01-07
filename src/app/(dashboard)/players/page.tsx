'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayerTable } from '@/components/player/player-table'
import { AddPlayerDialog } from '@/components/player/add-player-dialog'
import { ImportPlayersDialog } from '@/components/player/import-players-dialog'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const res = await fetch(`/api/players?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [search])

  const handlePlayerAdded = () => {
    setShowAddDialog(false)
    fetchPlayers()
  }

  const handlePlayersImported = () => {
    setShowImportDialog(false)
    fetchPlayers()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Spillere</h1>
        <p className="text-muted-foreground mt-2">
          Administrer klubbens spillere
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Søg efter navn eller email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer fra Holdsport
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tilføj spiller
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spilleroversigt</CardTitle>
          <CardDescription>
            {players.length} {players.length === 1 ? 'spiller' : 'spillere'} i alt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerTable
            players={players}
            loading={loading}
            onUpdate={fetchPlayers}
          />
        </CardContent>
      </Card>

      <AddPlayerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handlePlayerAdded}
      />

      <ImportPlayersDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={handlePlayersImported}
      />
    </div>
  )
}
