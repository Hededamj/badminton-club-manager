import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { updatePlayerSchema } from '@/lib/validators/player'

// GET /api/players/:id - Get single player
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const player = await db.player.findUnique({
      where: { id: params.id },
      include: {
        statistics: true,
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    )
  }
}

// PATCH /api/players/:id - Update player
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updatePlayerSchema.parse(body)

    // Convert empty strings to null for optional fields
    const playerData = {
      ...validatedData,
      email: validatedData.email === '' ? null : validatedData.email,
      phone: validatedData.phone === '' ? null : validatedData.phone,
      holdsportId: validatedData.holdsportId === '' ? null : validatedData.holdsportId,
    }

    const player = await db.player.update({
      where: { id: params.id },
      data: playerData,
      include: {
        statistics: true,
      },
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)

    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'En spiller med denne email findes allerede' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
}

// DELETE /api/players/:id - Delete player
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if player has any matches
    const matchCount = await db.matchPlayer.count({
      where: { playerId: params.id },
    })

    if (matchCount > 0) {
      return NextResponse.json(
        {
          error:
            'Kan ikke slette spiller der har deltaget i kampe. Deaktiver spilleren i stedet.',
        },
        { status: 400 }
      )
    }

    await db.player.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player:', error)

    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to delete player' },
      { status: 500 }
    )
  }
}
