import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

interface HoldsportActivity {
  id: string
  name: string
  date: string
  start_time: string | null
  end_time: string | null
  attending: Array<{
    user_id: string
    first_name: string
    last_name: string
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

    // Fetch activities from Holdsport
    // Get activities from today and 3 days forward
    const today = new Date()
    const threeDaysForward = new Date()
    threeDaysForward.setDate(today.getDate() + 3)

    const activities: HoldsportActivity[] = []

    // Holdsport API requires fetching activities by date
    for (let i = 0; i <= 3; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

      const response = await fetch(
        `https://api.holdsport.dk/v1/teams/${teamId}/activities?date=${dateStr}`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      )

      if (response.ok) {
        const dayActivities = await response.json()
        console.log(`Activities on ${dateStr}:`, dayActivities.length)
        activities.push(...dayActivities)
      }
    }

    console.log(`Total activities fetched: ${activities.length}`)

    // Transform to our format
    const trainings = activities.map(activity => ({
      holdsportId: activity.id,
      name: activity.name,
      date: activity.date,
      startTime: activity.start_time,
      endTime: activity.end_time,
      playerCount: activity.attending ? activity.attending.length : 0,
      players: activity.attending || [],
    }))

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

    // Check if training already exists
    const existingTraining = await prisma.training.findFirst({
      where: {
        name: training.name,
        date: new Date(training.date),
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
    console.log('Activity details:', activityDetails)
    console.log('Attending count:', activityDetails.attending?.length || 0)

    // Map Holdsport users to our players by name matching
    const attendingNames = (activityDetails.attending || []).map(a =>
      `${a.first_name} ${a.last_name}`.trim().toLowerCase()
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
        date: new Date(training.date),
        courts: 3, // Default value
        matchesPerCourt: 3, // Default value
        status: 'PLANNED',
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
