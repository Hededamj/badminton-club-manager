'use client'

import { useEffect, useState } from 'react'
import { PlayersListRedesign } from '@/components/player/players-list-redesign'
import { AddPlayerDialog } from '@/components/player/add-player-dialog'
import { ImportPlayersDialog } from '@/components/player/import-players-dialog'
import { EditPlayerDialog } from '@/components/player/edit-player-dialog'
import { DeletePlayerDialog } from '@/components/player/delete-player-dialog'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)

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

  const handleEditPlayer = (player: any) => {
    setSelectedPlayer(player)
    setShowEditDialog(true)
  }

  const handleDeletePlayer = (player: any) => {
    setSelectedPlayer(player)
    setShowDeleteDialog(true)
  }

  const handlePlayerUpdated = () => {
    setShowEditDialog(false)
    setSelectedPlayer(null)
    fetchPlayers()
  }

  const handlePlayerDeleted = () => {
    setShowDeleteDialog(false)
    setSelectedPlayer(null)
    fetchPlayers()
  }

  return (
    <>
      <PlayersListRedesign
        players={players}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onAddClick={() => setShowAddDialog(true)}
        onImportClick={() => setShowImportDialog(true)}
        onEdit={handleEditPlayer}
        onDelete={handleDeletePlayer}
      />

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

      {selectedPlayer && (
        <>
          <EditPlayerDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onSuccess={handlePlayerUpdated}
            player={selectedPlayer}
          />

          <DeletePlayerDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onSuccess={handlePlayerDeleted}
            player={selectedPlayer}
          />
        </>
      )}
    </>
  )
}
