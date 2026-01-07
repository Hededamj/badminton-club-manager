import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { updateTrainingSchema } from '@/lib/validators/training'

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const training = await prisma.training.findUnique({
      where: { id: params.id },
      include: {
        trainingPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                level: true,
                isActive: true,
              },
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
      },
    })

    if (!training) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
    }

    return NextResponse.json(training)
  } catch (error) {
    console.error('Error fetching training:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training' },
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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = updateTrainingSchema.parse(body)

    const updateData: any = {}
    if (validatedData.name) {
      updateData.name = validatedData.name
    }
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date)
    }
    if (validatedData.startTime) {
      updateData.startTime = new Date(validatedData.startTime)
    }
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime)
    }
    if (validatedData.courts !== undefined) {
      updateData.courts = validatedData.courts
    }
    if (validatedData.matchesPerCourt !== undefined) {
      updateData.matchesPerCourt = validatedData.matchesPerCourt
    }
    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    const training = await prisma.training.update({
      where: { id: params.id },
      data: updateData,
      include: {
        trainingPlayers: {
          include: {
            player: true,
          },
        },
        matches: {
          include: {
            matchPlayers: {
              include: {
                player: true,
              },
            },
            result: true,
          },
        },
      },
    })

    return NextResponse.json(training)
  } catch (error) {
    console.error('Error updating training:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update training' },
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
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete training (cascade will handle related records)
    await prisma.training.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting training:', error)
    return NextResponse.json(
      { error: 'Failed to delete training' },
      { status: 500 }
    )
  }
}
