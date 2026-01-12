import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { updateTournamentSchema } from '@/lib/validators/tournament'
import { requireClubMember, requireClubAdmin } from '@/lib/auth-helpers'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await requireClubMember()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    const tournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
      include: {
        tournamentPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                level: true,
                gender: true,
                isActive: true,
              },
            },
          },
          orderBy: {
            player: {
              name: 'asc',
            },
          },
        },
        matches: {
          include: {
            matchPlayers: {
              include: {
                player: {
                  select: {
                    id: true,
                    name: true,
                    level: true,
                  },
                },
              },
            },
            result: true,
          },
          orderBy: [
            { courtNumber: 'asc' },
            { matchNumber: 'asc' },
          ],
        },
        _count: {
          select: { matches: true },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    // Verify tournament belongs to current club
    const existingTournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
    })

    if (!existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = updateTournamentSchema.parse(body)

    const updateData: any = {}
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.startDate !== undefined) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate !== undefined) updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null
    if (validatedData.format !== undefined) updateData.format = validatedData.format
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.description !== undefined) updateData.description = validatedData.description

    const tournament = await prisma.tournament.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { matches: true },
        },
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { error: 'Failed to update tournament' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    // Verify tournament belongs to current club
    const existingTournament = await prisma.tournament.findFirst({
      where: { id: params.id, clubId },
    })

    if (!existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    await prisma.tournament.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    )
  }
}
