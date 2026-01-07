'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface PlayerTableProps {
  players: any[]
  loading: boolean
  onUpdate: () => void
}

export function PlayerTable({ players, loading, onUpdate }: PlayerTableProps) {
  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Indlæser...</div>
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ingen spillere fundet. Tilføj din første spiller for at komme i gang.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Navn</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Niveau</TableHead>
          <TableHead>Kampe</TableHead>
          <TableHead>Sejre</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="font-medium">{player.name}</TableCell>
            <TableCell>{player.email || '-'}</TableCell>
            <TableCell>{Math.round(player.level)}</TableCell>
            <TableCell>{player.statistics?.totalMatches || 0}</TableCell>
            <TableCell>{player.statistics?.wins || 0}</TableCell>
            <TableCell>
              {player.isActive ? (
                <Badge variant="default">Aktiv</Badge>
              ) : (
                <Badge variant="secondary">Inaktiv</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
