import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/players/import - Import players from Holdsport
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { playerData, players: playersArray } = body

    // Support both old format (playerData string) and new format (players array)
    let playersToImport: Array<{
      name: string
      email?: string
      phone?: string
      holdsportId?: string
      level?: number
      gender?: 'MALE' | 'FEMALE'
      isActive?: boolean
    }> = []

    if (playersArray && Array.isArray(playersArray)) {
      // New format: array of player objects
      playersToImport = playersArray
    } else if (playerData && typeof playerData === 'string') {
      // Old format: tab-separated string
      const lines = playerData.trim().split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split('\t')
        const name = parts[0]?.trim()
        const email = parts[1]?.trim() || undefined

        if (name) {
          playersToImport.push({ name, email })
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Ugyldig spillerdata' },
        { status: 400 }
      )
    }

    const createdPlayers = []
    const errors = []

    for (let i = 0; i < playersToImport.length; i++) {
      const playerData = playersToImport[i]
      const { name, email, phone, holdsportId, level, gender, isActive } = playerData

      if (!name || name.length < 2) {
        errors.push(`Spiller ${i + 1}: Mangler navn eller navn for kort`)
        continue
      }

      try {
        // Check if player already exists by email or holdsportId
        let existing = null

        if (email) {
          existing = await db.player.findUnique({
            where: { email },
          })
        }

        if (!existing && holdsportId) {
          existing = await db.player.findUnique({
            where: { holdsportId },
          })
        }

        if (existing) {
          errors.push(`${name} findes allerede i systemet`)
          continue
        }

        // Create player with all fields
        const createData: any = {
          name,
          level: level || 1500,
          isActive: isActive ?? true,
        }

        if (email && email.trim()) createData.email = email
        if (phone && phone.trim()) createData.phone = phone
        if (holdsportId && holdsportId.trim()) createData.holdsportId = holdsportId
        if (gender) createData.gender = gender

        const player = await db.player.create({
          data: createData,
        })

        // Create player statistics
        await db.playerStatistics.create({
          data: {
            playerId: player.id,
          },
        })

        createdPlayers.push(player)
      } catch (error: any) {
        console.error(`Error creating player ${name}:`, error)
        const errorMessage = error.message || 'Ukendt fejl'
        errors.push(`${name}: Kunne ikke oprettes (${errorMessage})`)
      }
    }

    console.log(`Import completed: ${createdPlayers.length} created, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      imported: createdPlayers.length,
      errors: errors.length > 0 ? errors : undefined,
      players: createdPlayers,
    })
  } catch (error) {
    console.error('Error importing players:', error)
    return NextResponse.json(
      { error: 'Failed to import players' },
      { status: 500 }
    )
  }
}
