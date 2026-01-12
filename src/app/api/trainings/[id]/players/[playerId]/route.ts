import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubAdmin } from '@/lib/auth-helpers'

// PATCH /api/trainings/[id]/players/[playerId] - Pause/unpause player
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!
    const { id: trainingId, playerId } = await params

    // Verify training belongs to current club
    const trainingCheck = await prisma.training.findFirst({
      where: { id: trainingId, clubId },
    })

    if (!trainingCheck) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
    }
    const body = await request.json()
    const { paused } = body

    if (typeof paused !== 'boolean') {
      return NextResponse.json(
        { error: 'Paused must be a boolean' },
        { status: 400 }
      )
    }

    // Find the training player record
    const trainingPlayer = await prisma.trainingPlayer.findFirst({
      where: {
        trainingId,
        playerId,
      },
    })

    if (!trainingPlayer) {
      return NextResponse.json(
        { error: 'Player not found in training' },
        { status: 404 }
      )
    }

    // Update pause status
    const updated = await prisma.trainingPlayer.update({
      where: { id: trainingPlayer.id },
      data: {
        paused,
        pausedAt: paused ? new Date() : null,
      },
      include: {
        player: true,
      },
    })

    // If pausing, remove player from all non-completed matches
    if (paused) {
      const training = await prisma.training.findUnique({
        where: { id: trainingId },
        include: {
          matches: {
            where: {
              result: null, // Only matches without results
            },
            include: {
              matchPlayers: true,
            },
          },
        },
      })

      if (training) {
        // Remove player from all non-completed matches
        for (const match of training.matches) {
          const playerInMatch = match.matchPlayers.find(
            mp => mp.playerId === playerId
          )

          if (playerInMatch) {
            await prisma.matchPlayer.delete({
              where: { id: playerInMatch.id },
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      trainingPlayer: updated,
    })
  } catch (error) {
    console.error('Error pausing/unpausing player:', error)
    return NextResponse.json(
      { error: 'Failed to update player status' },
      { status: 500 }
    )
  }
}
