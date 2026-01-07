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

    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'level'
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // Build where clause
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }

    // Get all players with statistics
    let players = await prisma.player.findMany({
      where,
      include: {
        statistics: true,
      },
    })

    // Sort based on criteria
    switch (sortBy) {
      case 'level':
        players.sort((a, b) => b.level - a.level)
        break
      case 'wins':
        players.sort((a, b) => (b.statistics?.wins || 0) - (a.statistics?.wins || 0))
        break
      case 'winRate':
        players.sort((a, b) => (b.statistics?.winRate || 0) - (a.statistics?.winRate || 0))
        break
      case 'matches':
        players.sort((a, b) => (b.statistics?.totalMatches || 0) - (a.statistics?.totalMatches || 0))
        break
      default:
        players.sort((a, b) => b.level - a.level)
    }

    // Add rank
    const rankedPlayers = players.map((player, index) => ({
      ...player,
      rank: index + 1,
    }))

    return NextResponse.json(rankedPlayers)
  } catch (error) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}
