import { NextRequest, NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import { requireClubMember } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  try {
    const session = await requireClubMember()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clubId = session.user.currentClubId!

    // Get total counts (filtered by club)
    const [
      totalPlayers,
      activePlayers,
      totalTrainings,
      totalMatches,
      completedMatches,
    ] = await Promise.all([
      prisma.player.count({ where: { clubId } }),
      prisma.player.count({ where: { clubId, isActive: true } }),
      prisma.training.count({ where: { clubId } }),
      prisma.match.count({ where: { training: { clubId } } }),
      prisma.match.count({ where: { training: { clubId }, status: 'COMPLETED' } }),
    ])

    // Get average player level (for club)
    const avgLevel = await prisma.player.aggregate({
      where: { clubId },
      _avg: { level: true },
    })

    // Get recent trainings (for club)
    const recentTrainings = await prisma.training.findMany({
      where: { clubId },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        trainingPlayers: true,
        _count: {
          select: { matches: true },
        },
      },
    })

    // Get top performers (by win rate, minimum 5 matches, for club)
    const topPerformers = await prisma.playerStatistics.findMany({
      where: {
        totalMatches: { gte: 5 },
        player: { clubId },
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
