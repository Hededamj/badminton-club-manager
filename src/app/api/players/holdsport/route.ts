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

    // Filter to only include active players (role 1 = player)
    const players = members
      .filter(member => member.role === 1)
      .map(member => ({
        name: `${member.first_name} ${member.last_name}`.trim(),
        email: member.email || '',
        phone: member.mobile || '',
        holdsportId: member.id,
        level: 1500,
        isActive: true,
      }))

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
