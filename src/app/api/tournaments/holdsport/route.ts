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

// GET /api/tournaments/holdsport - Fetch activities from Holdsport that could be tournaments
export async function GET(request: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const password = searchParams.get('password')
    const teamId = searchParams.get('teamId')
    const daysParam = searchParams.get('days')

    if (!username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende brugernavn, adgangskode eller team ID' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    const days = daysParam ? parseInt(daysParam, 10) : 60 // Default to 60 days for tournaments

    console.log('Fetching Holdsport activities for tournaments, team:', teamId)
    console.log('Fetching days:', days)

    // Fetch activities from Holdsport
    const today = new Date()
    const activities: HoldsportActivity[] = []

    // Holdsport API requires fetching activities by date
    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

      const url = `https://api.holdsport.dk/v1/teams/${teamId}/activities?date=${dateStr}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      if (response.ok) {
        const dayActivities: HoldsportActivity[] = await response.json()

        // Include all activities with attendees
        const activitiesWithAttendees = dayActivities.filter(act =>
          act.activities_users && act.activities_users.length > 0
        )

        activities.push(...activitiesWithAttendees)
      } else {
        const errorText = await response.text()
        console.error(`Error fetching activities for ${dateStr}: ${response.status} - ${errorText}`)
      }
    }

    console.log(`Total activities fetched: ${activities.length}`)

    // Transform to our format
    const tournaments = activities
      .map(activity => {
        // Extract date from starttime
        const activityDate = activity.starttime ? activity.starttime.split('T')[0] : null

        // Only include users who are registered (status_code = 1)
        const attendingPlayers = (activity.activities_users || [])
          .filter(user => user.status_code === 1)

        // Extract time
        const startTime = activity.starttime ? activity.starttime.split('T')[1]?.substring(0, 5) : null
        const endTime = activity.endtime ? activity.endtime.split('T')[1]?.substring(0, 5) : null

        return {
          holdsportId: String(activity.id),
          name: activity.name || 'Unavngiven turnering',
          date: activityDate,
          startTime,
          endTime,
          playerCount: attendingPlayers.length,
          players: attendingPlayers,
        }
      })
      .filter(tournament => tournament.date !== null)

    console.log(`Valid activities after filtering: ${tournaments.length}`)

    return NextResponse.json({
      tournaments,
      total: tournaments.length,
    })
  } catch (error) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af aktiviteter fra Holdsport' },
      { status: 500 }
    )
  }
}

// POST /api/tournaments/holdsport - Import a tournament from Holdsport
export async function POST(request: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await request.json()
    const { tournament, username, password, teamId, format, matchTypes } = body

    if (!tournament || !username || !password || !teamId || !format || !matchTypes) {
      return NextResponse.json(
        { error: 'Manglende påkrævede felter' },
        { status: 400 }
      )
    }

    console.log('Importing tournament:', tournament)

    // Parse date from tournament.date
    const startDate = new Date(tournament.date)
    console.log('Tournament start date:', startDate)

    // Fetch detailed activity info including attendees from Holdsport
    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    const response = await fetch(
      `https://api.holdsport.dk/v1/teams/${teamId}/activities/${tournament.holdsportId}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Kunne ikke hente detaljeret aktivitet fra Holdsport')
    }

    const activityDetails: HoldsportActivity = await response.json()

    // Only include users who are registered (status_code = 1)
    const attendingUsers = (activityDetails.activities_users || [])
      .filter(user => user.status_code === 1)

    console.log('Attending users:', attendingUsers.length)

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

    // Create tournament
    const createdTournament = await prisma.tournament.create({
      data: {
        clubId,
        name: tournament.name,
        startDate: startDate,
        endDate: startDate, // Default end date to start date
        format: format,
        matchTypes: matchTypes,
        status: 'PLANNED',
        description: `Importeret fra Holdsport - ${matchedPlayers.length} deltagere`,
        tournamentPlayers: {
          create: matchedPlayers.map(player => ({
            playerId: player.id,
          })),
        },
      },
      include: {
        tournamentPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      tournament: createdTournament,
      matched: matchedPlayers.length,
      total: attendingNames.length,
      unmatched: attendingNames.length - matchedPlayers.length,
    })
  } catch (error: any) {
    console.error('Error importing tournament:', error)
    return NextResponse.json(
      { error: error.message || 'Der opstod en fejl ved import af turnering' },
      { status: 500 }
    )
  }
}
