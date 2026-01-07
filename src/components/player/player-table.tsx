'use client'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'

interface PlayerTableProps {
  players: any[]
  loading: boolean
  onUpdate: () => void
  onEdit: (player: any) => void
  onDelete: (player: any) => void
}

export function PlayerTable({ players, loading, onUpdate, onEdit, onDelete }: PlayerTableProps) {
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
          <TableHead className="text-right">Handlinger</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="font-medium">
              <Link
                href={`/players/${player.id}`}
                className="hover:underline hover:text-primary transition-colors"
              >
                {player.name}
              </Link>
            </TableCell>
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
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(player)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(player)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
