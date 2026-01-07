import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

interface HoldsportTeam {
  id: string
  name: string
  primary_color: string
  secondary_color: string
  role: number
}

interface HoldsportMember {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile: string
  role: number
}

// Get list of teams for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const password = searchParams.get('password')

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Manglende brugernavn eller adgangskode' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    console.log('Fetching Holdsport teams for user:', username)
    console.log('Auth header created (first 20 chars):', auth.substring(0, 20))

    const response = await fetch('https://api.holdsport.dk/v1/teams', {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    console.log('Holdsport teams response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Holdsport error response:', errorText)

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Forkert brugernavn eller adgangskode' },
          { status: 401 }
        )
      }
      throw new Error('Kunne ikke hente teams fra Holdsport')
    }

    const teams: HoldsportTeam[] = await response.json()

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved forbindelse til Holdsport' },
      { status: 500 }
    )
  }
}

// Import members from a specific team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, password, teamId, teamName } = body

    if (!username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende påkrævede felter' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    // Fetch team members from Holdsport
    const response = await fetch(
      `https://api.holdsport.dk/v1/teams/${teamId}/members`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Forkert brugernavn eller adgangskode' },
          { status: 401 }
        )
      }
      throw new Error('Kunne ikke hente medlemmer fra Holdsport')
    }

    const members: HoldsportMember[] = await response.json()

    console.log(`Fetched ${members.length} members from Holdsport team ${teamId}`)

    // Create or update team in database
    const team = await prisma.team.upsert({
      where: { holdsportId: teamId },
      update: {
        name: teamName || `Team ${teamId}`,
        isActive: true,
      },
      create: {
        name: teamName || `Team ${teamId}`,
        holdsportId: teamId,
        isActive: true,
      },
    })

    console.log(`Team created/updated: ${team.name}`)

    // Import players and associate with team
    let imported = 0
    let updated = 0
    let skipped = 0

    for (const member of members) {
      const playerName = `${member.first_name || ''} ${member.last_name || ''}`.trim()

      if (playerName.length < 2) {
        skipped++
        continue
      }

      try {
        // Check if player exists by holdsportId or email
        let existingPlayer = null
        if (member.id) {
          existingPlayer = await prisma.player.findUnique({
            where: { holdsportId: member.id },
          })
        }
        if (!existingPlayer && member.email && member.email.trim()) {
          existingPlayer = await prisma.player.findUnique({
            where: { email: member.email.trim() },
          })
        }

        let player
        if (existingPlayer) {
          // Update existing player
          player = await prisma.player.update({
            where: { id: existingPlayer.id },
            data: {
              name: playerName,
              email: member.email && member.email.trim() ? member.email.trim() : existingPlayer.email,
              phone: member.mobile && member.mobile.trim() ? member.mobile.trim() : existingPlayer.phone,
              holdsportId: member.id,
              isActive: true,
            },
          })
          updated++
        } else {
          // Create new player
          const createData: any = {
            name: playerName,
            holdsportId: member.id,
            level: 1500,
            isActive: true,
          }
          if (member.email && member.email.trim()) createData.email = member.email.trim()
          if (member.mobile && member.mobile.trim()) createData.phone = member.mobile.trim()

          player = await prisma.player.create({
            data: createData,
          })
          imported++
        }

        // Associate player with team (create TeamPlayer if doesn't exist)
        await prisma.teamPlayer.upsert({
          where: {
            teamId_playerId: {
              teamId: team.id,
              playerId: player.id,
            },
          },
          update: {},
          create: {
            teamId: team.id,
            playerId: player.id,
          },
        })
      } catch (error) {
        console.error(`Error importing player ${playerName}:`, error)
        skipped++
      }
    }

    console.log(`Import complete: ${imported} new, ${updated} updated, ${skipped} skipped`)

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
      },
      imported,
      updated,
      skipped,
      total: members.length,
    })
  } catch (error) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af spillere' },
      { status: 500 }
    )
  }
}
