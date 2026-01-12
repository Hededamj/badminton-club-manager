import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'

// POST /api/trainings/[id]/add-player - Add an existing player to a training
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: trainingId } = await params
    const clubId = session.user.currentClubId!

    const body = await req.json()
    const { playerId } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Spiller ID er påkrævet' },
        { status: 400 }
      )
    }

    // Verify training exists and belongs to current club
    const training = await prisma.training.findFirst({
      where: {
        id: trainingId,
        clubId,
      },
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Træning ikke fundet' },
        { status: 404 }
      )
    }

    // Verify player exists and belongs to current club
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        clubId,
        isActive: true,
      },
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Spiller ikke fundet eller tilhører ikke denne klub' },
        { status: 404 }
      )
    }

    // Check if player is already in training
    const existingTrainingPlayer = await prisma.trainingPlayer.findFirst({
      where: {
        trainingId,
        playerId,
      },
    })

    if (existingTrainingPlayer) {
      return NextResponse.json(
        { error: 'Spilleren er allerede tilmeldt denne træning' },
        { status: 400 }
      )
    }

    // Add player to training
    const trainingPlayer = await prisma.trainingPlayer.create({
      data: {
        trainingId,
        playerId,
        attending: true,
        paused: false,
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            level: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      trainingPlayer,
    })
  } catch (error) {
    console.error('Error adding player to training:', error)
    return NextResponse.json(
      { error: 'Kunne ikke tilføje spiller til træning' },
      { status: 500 }
    )
  }
}
