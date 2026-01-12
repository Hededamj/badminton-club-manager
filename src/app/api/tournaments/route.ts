import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { createTournamentSchema } from '@/lib/validators/tournament'
import { requireClubMember, requireClubAdmin } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  try {
    const session = await requireClubMember()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { clubId }
    if (status) {
      where.status = status
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    })

    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const body = await req.json()
    const validatedData = createTournamentSchema.parse(body)

    const tournament = await prisma.tournament.create({
      data: {
        clubId,
        name: validatedData.name,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        format: validatedData.format,
        matchTypes: validatedData.matchTypes,
        description: validatedData.description || null,
        status: 'PLANNED',
      },
      include: {
        _count: {
          select: { matches: true },
        },
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    )
  }
}
