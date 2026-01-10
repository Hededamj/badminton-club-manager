import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
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
  id: number
  firstname: string
  lastname: string
  gender?: string // 'M' or 'F' or 'male' or 'female'
  role: number
}

// Helper function to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Holdsport error response:', errorText)
      console.error('Full response status:', response.status, response.statusText)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: 'Forkert brugernavn eller adgangskode til Holdsport. Tjek at du bruger dit Holdsport email og adgangskode.',
            details: errorText
          },
          { status: 401 }
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'Ingen adgang. Kontakt Holdsport support for at få API adgang aktiveret.',
            details: errorText
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        {
          error: `Holdsport API fejl: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const teams: HoldsportTeam[] = await response.json()

    return NextResponse.json(teams)
  } catch (error: unknown) {
    console.error('Holdsport API error:', error)
    return NextResponse.json(
      { error: 'Der opstod en fejl ved forbindelse til Holdsport' },
      { status: 500 }
    )
  }
}

// Import members from a specific team
export async function POST(request: NextRequest) {
  console.log('=== POST /api/players/holdsport called ===')
  console.log('Request URL:', request.url)
  console.log('Request method:', request.method)

  try {
    console.log('Step 1: Getting session...')

    let session
    try {
      session = await getServerSession(authOptions)
      console.log('Session retrieved:', session ? `User: ${session.user?.email}, Role: ${session.user?.role}` : 'No session')
    } catch (sessionError: unknown) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Session fejl', details: getErrorMessage(sessionError) },
        { status: 500 }
      )
    }

    if (!session || session.user.role !== 'ADMIN') {
      console.error('Unauthorized access attempt:', session?.user?.email)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Step 2: Parsing request body...')
    let body
    try {
      body = await request.json()
      console.log('Body parsed successfully:', JSON.stringify(body))
    } catch (parseError: unknown) {
      console.error('Body parse error:', parseError)
      return NextResponse.json(
        { error: 'JSON parse fejl', details: getErrorMessage(parseError) },
        { status: 400 }
      )
    }

    console.log('Step 2.5: Extracting data from body...')
    const { username, password, teamId, teamName } = body
    console.log('Step 2.6: Data extracted, converting teamId...')

    // Convert teamId to string (Holdsport API returns numbers, but Prisma expects string)
    const teamIdStr = String(teamId)
    console.log('Step 2.7: TeamId converted to string:', teamIdStr)

    console.log('Extracted data:', {
      username: username ? `${username.substring(0, 3)}***` : 'MISSING',
      password: password ? '***' : 'MISSING',
      teamId: teamIdStr,
      teamName
    })

    if (!username || !password || !teamId) {
      console.error('Missing required fields:', {
        hasUsername: !!username,
        hasPassword: !!password,
        hasTeamId: !!teamId
      })
      return NextResponse.json(
        { error: 'Manglende brugernavn eller adgangskode', details: 'Username, password og teamId er påkrævet' },
        { status: 400 }
      )
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64')
    console.log('Step 3: Fetching members from Holdsport API...')
    console.log('Team ID:', teamIdStr)

    // Fetch team members from Holdsport with timeout
    let response
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      response = await fetch(
        `https://api.holdsport.dk/v1/teams/${teamIdStr}/members`,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
          },
          signal: controller.signal,
        }
      )
      clearTimeout(timeoutId)
      console.log('Holdsport API response status:', response.status)
    } catch (fetchError: unknown) {
      console.error('Holdsport fetch error:', fetchError)
      const errorMsg = getErrorMessage(fetchError)
      if (errorMsg.includes('abort')) {
        return NextResponse.json(
          { error: 'Holdsport API timeout - prøv igen' },
          { status: 504 }
        )
      }
      return NextResponse.json(
        { error: 'Kunne ikke forbinde til Holdsport API', details: errorMsg },
        { status: 503 }
      )
    }

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
    console.log(`Fetched ${members.length} members from Holdsport team ${teamIdStr}`)

    // Log first member to see all available fields
    if (members.length > 0) {
      console.log('Sample member fields:', JSON.stringify(members[0], null, 2))
    }

    // Create or update team in database
    console.log('Creating/updating team in database...')
    let team
    try {
      team = await prisma.team.upsert({
        where: { holdsportId: teamIdStr },
        update: {
          name: teamName || `Team ${teamIdStr}`,
          isActive: true,
        },
        create: {
          name: teamName || `Team ${teamIdStr}`,
          holdsportId: teamIdStr,
          isActive: true,
        },
      })
      console.log(`Team created/updated: ${team.name} (ID: ${team.id})`)
    } catch (dbError: unknown) {
      console.error('Database error creating team:', dbError)
      throw new Error(`Database fejl: ${getErrorMessage(dbError)}`)
    }

    // Import players and associate with team
    let imported = 0
    let updated = 0
    let skipped = 0

    for (const member of members) {
      const playerName = `${member.firstname || ''} ${member.lastname || ''}`.trim()

      if (playerName.length < 2) {
        console.log(`Skipping player with short name: "${playerName}"`)
        skipped++
        continue
      }

      try {
        // Convert member.id to string (Holdsport API returns number, Prisma expects string)
        const memberIdStr = String(member.id)

        // Map gender from Holdsport to our enum
        let gender: 'MALE' | 'FEMALE' | null = null
        if (member.gender) {
          const genderLower = member.gender.toLowerCase()
          if (genderLower === 'm' || genderLower === 'male' || genderLower === 'mand') {
            gender = 'MALE'
          } else if (genderLower === 'f' || genderLower === 'female' || genderLower === 'kvinde') {
            gender = 'FEMALE'
          }
        }

        console.log(`Processing player: ${playerName}`)
        console.log(`  - holdsportId: ${memberIdStr}`)
        console.log(`  - member.gender from Holdsport: "${member.gender}"`)
        console.log(`  - mapped gender: ${gender || 'N/A'}`)

        // Check if player exists by holdsportId only (GDPR: ikke import email/telefon)
        const existingPlayer = await prisma.player.findUnique({
          where: { holdsportId: memberIdStr },
        })
        console.log(`  Found by holdsportId: ${!!existingPlayer}`)

        let player
        if (existingPlayer) {
          // Update existing player - kun navn, gender og holdsportId (IKKE email/telefon)
          console.log(`  Updating existing player: ${existingPlayer.name}`)
          player = await prisma.player.update({
            where: { id: existingPlayer.id },
            data: {
              name: playerName,
              holdsportId: memberIdStr,
              isActive: true,
              gender: gender, // Always update gender (even if null) to sync with Holdsport
            },
          })
          updated++
          console.log(`  Successfully updated player with gender: ${gender || 'NULL'}`)
        } else {
          // Create new player - kun navn, niveau og gender (IKKE email/telefon)
          console.log(`  Creating new player`)
          player = await prisma.player.create({
            data: {
              name: playerName,
              holdsportId: memberIdStr,
              level: 1500,
              isActive: true,
              gender: gender,
            },
          })
          imported++
          console.log(`  Successfully created player`)
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
      } catch (error: unknown) {
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
  } catch (error: unknown) {
    console.error('Holdsport API POST error:', error)
    const errorMessage = getErrorMessage(error)
    console.error('Error details:', {
      message: errorMessage,
    })
    return NextResponse.json(
      {
        error: 'Der opstod en fejl ved hentning af spillere',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
