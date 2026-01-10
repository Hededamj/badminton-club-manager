import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

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

// GET /api/trainings/holdsport - Fetch upcoming trainings from Holdsport
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const password = searchParams.get('password')
    const teamId = searchParams.get('teamId')

    if (!username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende brugernavn, adgangskode eller team ID' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    console.log('Fetching Holdsport activities for team:', teamId)
    console.log('Auth header created (first 20 chars):', auth.substring(0, 20))

    // Fetch activities from Holdsport
    // Get activities from today and 7 days forward
    const today = new Date()
    const activities: HoldsportActivity[] = []

    // Holdsport API requires fetching activities by date
    for (let i = 0; i <= 7; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

      const url = `https://api.holdsport.dk/v1/teams/${teamId}/activities?date=${dateStr}`
      console.log(`Fetching from URL: ${url}`)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      })

      console.log(`Response for ${dateStr}: status=${response.status}`)

      if (response.ok) {
        const dayActivities: HoldsportActivity[] = await response.json()
        console.log(`Activities on ${dateStr}:`, dayActivities.length)

        // Filter to only include activities with attendees
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
    const trainings = activities
      .map(activity => {
        // Extract date from starttime (format: "2026-01-13T19:15:00+01:00")
        const activityDate = activity.starttime ? activity.starttime.split('T')[0] : null

        // Only include users who are registered (status_code = 1)
        const attendingPlayers = (activity.activities_users || [])
          .filter(user => user.status_code === 1)

        // Extract time from starttime and endtime
        const startTime = activity.starttime ? activity.starttime.split('T')[1]?.substring(0, 5) : null // "19:15"
        const endTime = activity.endtime ? activity.endtime.split('T')[1]?.substring(0, 5) : null // "21:00"

        return {
          holdsportId: String(activity.id),
          name: activity.name || 'Unavngivet træning',
          date: activityDate,
          startTime,
          endTime,
          playerCount: attendingPlayers.length,
          players: attendingPlayers,
        }
      })
      .filter(training => training.date !== null) // Only include if we have a valid date

    console.log(`Valid trainings after filtering: ${trainings.length}`)

    return NextResponse.json({
      trainings,
      total: trainings.length,
    })
  } catch (error) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af træninger fra Holdsport' },
      { status: 500 }
    )
  }
}

// POST /api/trainings/holdsport - Import a training from Holdsport
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { training, username, password, teamId } = body

    if (!training || !username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende påkrævede felter' },
        { status: 400 }
      )
    }

    console.log('Importing training:', training)

    // Parse date from training.date (should be YYYY-MM-DD format)
    const trainingDate = new Date(training.date)
    console.log('Training date:', trainingDate)

    // Check if training already exists by holdsportId
    const existingTraining = await prisma.training.findUnique({
      where: {
        holdsportId: training.holdsportId,
      },
    })

    if (existingTraining) {
      return NextResponse.json(
        { error: 'Træning findes allerede i systemet' },
        { status: 400 }
      )
    }

    // Fetch detailed activity info including attendees from Holdsport
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
      throw new Error('Kunne ikke hente detaljeret aktivitet fra Holdsport')
    }

    const activityDetails: HoldsportActivity = await response.json()
    console.log('Activity details:', JSON.stringify(activityDetails, null, 2).substring(0, 500))
    console.log('Total users:', activityDetails.activities_users?.length || 0)

    // Only include users who are registered (status_code = 1 = Tilmeldt)
    const attendingUsers = (activityDetails.activities_users || [])
      .filter(user => user.status_code === 1)

    console.log('Attending users (status=1):', attendingUsers.length)

    // Map Holdsport users to our players by name matching
    const attendingNames = attendingUsers.map(user =>
      user.name.trim().toLowerCase()
    )

    console.log('Attending names:', attendingNames)

    // Find matching players in our database
    const allPlayers = await prisma.player.findMany({
      where: { isActive: true },
    })

    const matchedPlayers = allPlayers.filter(player =>
      attendingNames.some(name =>
        player.name.toLowerCase().includes(name) || name.includes(player.name.toLowerCase())
      )
    )

    console.log(`Matched ${matchedPlayers.length} players from ${attendingNames.length} attendees`)

    // Create training
    const createdTraining = await prisma.training.create({
      data: {
        name: training.name,
        date: trainingDate,
        courts: 3, // Default value
        matchesPerCourt: 3, // Default value
        status: 'PLANNED',
        holdsportId: training.holdsportId, // Save Holdsport ID for syncing
        trainingPlayers: {
          create: matchedPlayers.map(player => ({
            playerId: player.id,
          })),
        },
      },
      include: {
        trainingPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      training: createdTraining,
      matched: matchedPlayers.length,
      total: attendingNames.length,
      unmatched: attendingNames.length - matchedPlayers.length,
    })
  } catch (error: any) {
    console.error('Error importing training:', error)
    return NextResponse.json(
      { error: error.message || 'Der opstod en fejl ved import af træning' },
      { status: 500 }
    )
  }
}
