import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total counts
    const [
      totalPlayers,
      activePlayers,
      totalTrainings,
      totalMatches,
      completedMatches,
    ] = await Promise.all([
      prisma.player.count(),
      prisma.player.count({ where: { isActive: true } }),
      prisma.training.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
    ])

    // Get average player level
    const avgLevel = await prisma.player.aggregate({
      _avg: { level: true },
    })

    // Get recent trainings
    const recentTrainings = await prisma.training.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        trainingPlayers: true,
        _count: {
          select: { matches: true },
        },
      },
    })

    // Get top performers (by win rate, minimum 5 matches)
    const topPerformers = await prisma.playerStatistics.findMany({
      where: {
        totalMatches: { gte: 5 },
      },
      orderBy: [
        { winRate: 'desc' },
        { totalMatches: 'desc' },
      ],
      take: 10,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json({
      overview: {
        totalPlayers,
        activePlayers,
        totalTrainings,
        totalMatches,
        completedMatches,
        averageLevel: avgLevel._avg.level || 1500,
      },
      recentTrainings,
      topPerformers,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
