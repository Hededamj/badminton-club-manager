import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

// POST /api/trainings/[id]/add-guest - Add a guest player to training
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id: trainingId } = resolvedParams
    const body = await request.json()
    const { name, level, gender } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Navn er påkrævet' },
        { status: 400 }
      )
    }

    if (typeof level !== 'number' || level < 0 || level > 3000) {
      return NextResponse.json(
        { error: 'Niveau skal være mellem 0 og 3000' },
        { status: 400 }
      )
    }

    if (gender && !['MALE', 'FEMALE'].includes(gender)) {
      return NextResponse.json(
        { error: 'Ugyldigt køn' },
        { status: 400 }
      )
    }

    // Check if training exists
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    })

    if (!training) {
      return NextResponse.json({ error: 'Træning ikke fundet' }, { status: 404 })
    }

    // Create guest player and add to training in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the player with unique email (timestamp + random to avoid collisions)
      const player = await tx.player.create({
        data: {
          name: name.trim(),
          email: `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@temporary.local`, // Unique temporary email
          level: level,
          gender: gender || null,
          isActive: true,
        },
      })

      // Create player statistics
      await tx.playerStatistics.create({
        data: {
          playerId: player.id,
        },
      })

      // Add player to training
      await tx.trainingPlayer.create({
        data: {
          trainingId: trainingId,
          playerId: player.id,
        },
      })

      return player
    })

    return NextResponse.json({
      success: true,
      player: result,
      message: `${result.name} er tilføjet som gæst`,
    })
  } catch (error) {
    console.error('Error adding guest:', error)
    return NextResponse.json(
      { error: 'Kunne ikke tilføje gæst' },
      { status: 500 }
    )
  }
}
