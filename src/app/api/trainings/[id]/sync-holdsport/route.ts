import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'

interface HoldsportActivity {
  id: number
  name: string
  starttime: string | null
  endtime: string | null
  activities_users: Array<{
    id: number
    name: string
    user_id: number
    status: string
    status_code: number  // 1 = Tilmeldt, 2 = Afmeldt
  }>
}

// POST /api/trainings/[id]/sync-holdsport - Sync training players with Holdsport
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await request.json()
    const { username, password, teamId } = body

    if (!username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende brugernavn, adgangskode eller team ID' },
        { status: 400 }
      )
    }

    // Await params (Next.js 15 requirement)
    const { id } = await params

    // Fetch training from database (verify it belongs to current club)
    const training = await prisma.training.findFirst({
      where: { id, clubId },
      include: {
        trainingPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Træning ikke fundet' },
        { status: 404 }
      )
    }

    if (!training.holdsportId) {
      return NextResponse.json(
        { error: 'Denne træning er ikke importeret fra Holdsport og kan ikke synkroniseres' },
        { status: 400 }
      )
    }

    console.log(`Syncing training ${training.id} with Holdsport activity ${training.holdsportId}`)

    // Fetch activity details from Holdsport
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    const response = await fetch(
      `https://api.holdsport.dk/v1/teams/${teamId}/activities/${training.holdsportId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Forkert brugernavn eller adgangskode til Holdsport' },
          { status: 401 }
        )
      }
      throw new Error('Kunne ikke hente aktivitet fra Holdsport')
    }

    const activityDetails: HoldsportActivity = await response.json()
    console.log('Activity details fetched from Holdsport')

    // Only include users who are registered (status_code = 1 = Tilmeldt)
    const attendingUsers = (activityDetails.activities_users || [])
      .filter(user => user.status_code === 1)

    console.log(`Found ${attendingUsers.length} attending users in Holdsport`)

    // Map Holdsport users to our players by name matching
    const attendingNames = attendingUsers.map(user =>
      user.name.trim().toLowerCase()
    )

    // Find matching players in our database (filtered by club)
    const allPlayers = await prisma.player.findMany({
      where: { clubId, isActive: true },
    })

    const matchedPlayers = allPlayers.filter(player =>
      attendingNames.some(name =>
        player.name.toLowerCase().includes(name) || name.includes(player.name.toLowerCase())
      )
    )

    console.log(`Matched ${matchedPlayers.length} players from ${attendingNames.length} attendees`)

    // Get current training players
    const currentPlayerIds = training.trainingPlayers.map(tp => tp.playerId)
    const matchedPlayerIds = matchedPlayers.map(p => p.id)

    // Determine changes
    const playersToAdd = matchedPlayers.filter(p => !currentPlayerIds.includes(p.id))
    const playersToRemove = training.trainingPlayers.filter(tp => !matchedPlayerIds.includes(tp.playerId))

    console.log(`Players to add: ${playersToAdd.length}, Players to remove: ${playersToRemove.length}`)

    // Add new players
    for (const player of playersToAdd) {
      await prisma.trainingPlayer.create({
        data: {
          trainingId: training.id,
          playerId: player.id,
        },
      })
    }

    // Remove players who are no longer attending
    for (const tp of playersToRemove) {
      await prisma.trainingPlayer.delete({
        where: { id: tp.id },
      })
    }

    return NextResponse.json({
      success: true,
      added: playersToAdd.length,
      removed: playersToRemove.length,
      total: matchedPlayers.length,
      playerNames: {
        added: playersToAdd.map(p => p.name),
        removed: playersToRemove.map(tp => tp.player.name),
      },
    })
  } catch (error: any) {
    console.error('Error syncing training with Holdsport:', error)
    return NextResponse.json(
      { error: error.message || 'Der opstod en fejl ved synkronisering med Holdsport' },
      { status: 500 }
    )
  }
}
