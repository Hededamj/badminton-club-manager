import { NextRequest, NextResponse } from 'next/server'

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

    const response = await fetch('https://api.holdsport.dk/v1/teams', {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    })

    if (!response.ok) {
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
    const body = await request.json()
    const { username, password, teamId } = body

    if (!username || !password || !teamId) {
      return NextResponse.json(
        { error: 'Manglende påkrævede felter' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')

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
    console.log('Sample member:', members[0])
    console.log('All roles:', members.map(m => ({ name: m.first_name, role: m.role })))

    // Filter to only include active players (role 1 = player)
    // Note: Holdsport roles might be different, so let's be more permissive
    const players = members
      .filter(member => member.role !== undefined) // Accept all roles for now
      .map(member => {
        const player = {
          name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
          email: member.email && member.email.trim() ? member.email : undefined,
          phone: member.mobile && member.mobile.trim() ? member.mobile : undefined,
          holdsportId: member.id,
          level: 1500,
          isActive: true,
        }
        return player
      })
      .filter(player => player.name.length >= 2) // Ensure valid names

    console.log(`Filtered to ${players.length} active players`)

    return NextResponse.json({
      players,
      total: players.length,
    })
  } catch (error) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af spillere' },
      { status: 500 }
    )
  }
}
