import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { updateTrainingSchema } from '@/lib/validators/training'
import { requireClubMember, requireClubAdmin } from '@/lib/auth-helpers'

// Force dynamic rendering - disable all caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    const training = await prisma.training.findFirst({
      where: { id: params.id, clubId },
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

    // Disable caching to ensure fresh data
    return NextResponse.json(training, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching training:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to fetch training', details: error instanceof Error ? error.message : String(error) },
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

    // Verify training belongs to current club
    const existingTraining = await prisma.training.findFirst({
      where: { id: params.id, clubId },
    })

    if (!existingTraining) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
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
    const session = await requireClubAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    // Verify training belongs to current club
    const existingTraining = await prisma.training.findFirst({
      where: { id: params.id, clubId },
    })

    if (!existingTraining) {
      return NextResponse.json({ error: 'Training not found' }, { status: 404 })
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
