import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { createTrainingSchema } from '@/lib/validators/training'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }

    const trainings = await prisma.training.findMany({
      where,
      include: {
        trainingPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            matches: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json(trainings)
  } catch (error) {
    console.error('Error fetching trainings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = createTrainingSchema.parse(body)

    // Create training with players
    const training = await prisma.training.create({
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        courts: validatedData.courts,
        matchesPerCourt: validatedData.matchesPerCourt,
        status: 'PLANNED',
        trainingPlayers: {
          create: validatedData.playerIds.map((playerId) => ({
            playerId,
          })),
        },
      },
      include: {
        trainingPlayers: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                level: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(training, { status: 201 })
  } catch (error) {
    console.error('Error creating training:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create training' },
      { status: 500 }
    )
  }
}
