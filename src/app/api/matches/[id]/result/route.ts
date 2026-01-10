import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db as prisma } from '@/lib/db'
import { calculateMatchEloChanges } from '@/lib/matchmaking/elo-calculator'

export async function POST(
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
    const { team1Score, team2Score, winningTeam } = body

    // Support both detailed scores and simple winner selection
    let finalTeam1Score: number
    let finalTeam2Score: number

    if (team1Score !== undefined && team2Score !== undefined) {
      // Detailed scores provided
      if (
        typeof team1Score !== 'number' ||
        typeof team2Score !== 'number' ||
        team1Score < 0 ||
        team2Score < 0
      ) {
        return NextResponse.json(
          { error: 'Invalid scores' },
          { status: 400 }
        )
      }
      finalTeam1Score = team1Score
      finalTeam2Score = team2Score
    } else if (winningTeam === 1 || winningTeam === 2) {
      // Simple winner selection - use default scores
      finalTeam1Score = winningTeam === 1 ? 21 : 0
      finalTeam2Score = winningTeam === 2 ? 21 : 0
    } else {
      return NextResponse.json(
        { error: 'Either provide scores or specify winning team' },
        { status: 400 }
      )
    }

    // Get match with players
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        matchPlayers: {
          include: {
            player: true,
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const team1Players = match.matchPlayers.filter(mp => mp.team === 1)
    const team2Players = match.matchPlayers.filter(mp => mp.team === 2)

    if (team1Players.length !== 2 || team2Players.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid match setup' },
        { status: 400 }
      )
    }

    // Calculate ELO changes
    const team1Levels = team1Players.map(mp => mp.player.level)
    const team2Levels = team2Players.map(mp => mp.player.level)
    const team1Won = finalTeam1Score > finalTeam2Score

    const eloChanges = calculateMatchEloChanges(
      team1Levels,
      team2Levels,
      team1Won
    )

    // Update player levels in a transaction
    await prisma.$transaction(async tx => {
      // Update team 1 players
      for (let i = 0; i < team1Players.length; i++) {
        await tx.player.update({
          where: { id: team1Players[i].player.id },
          data: { level: eloChanges.team1NewRatings[i] },
        })
      }

      // Update team 2 players
      for (let i = 0; i < team2Players.length; i++) {
        await tx.player.update({
          where: { id: team2Players[i].player.id },
          data: { level: eloChanges.team2NewRatings[i] },
        })
      }

      // Create level change JSON object
      const levelChange: Record<string, number> = {}
      for (let i = 0; i < team1Players.length; i++) {
        levelChange[team1Players[i].player.id] = eloChanges.team1Change
      }
      for (let i = 0; i < team2Players.length; i++) {
        levelChange[team2Players[i].player.id] = eloChanges.team2Change
      }

      // Create or update match result
      await tx.matchResult.upsert({
        where: { matchId: match.id },
        create: {
          matchId: match.id,
          team1Score: finalTeam1Score,
          team2Score: finalTeam2Score,
          winningTeam: team1Won ? 1 : 2,
          levelChange,
        },
        update: {
          team1Score: finalTeam1Score,
          team2Score: finalTeam2Score,
          winningTeam: team1Won ? 1 : 2,
          levelChange,
        },
      })

      // Update match status
      await tx.match.update({
        where: { id: match.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      // Update player statistics
      for (const mp of team1Players) {
        await updatePlayerStatistics(tx, mp.player.id, team1Won)
      }
      for (const mp of team2Players) {
        await updatePlayerStatistics(tx, mp.player.id, !team1Won)
      }

      // Update partnership history
      await updatePartnershipHistory(
        tx,
        team1Players[0].player.id,
        team1Players[1].player.id
      )
      await updatePartnershipHistory(
        tx,
        team2Players[0].player.id,
        team2Players[1].player.id
      )

      // Update opposition history
      for (const t1p of team1Players) {
        for (const t2p of team2Players) {
          await updateOppositionHistory(tx, t1p.player.id, t2p.player.id)
        }
      }
    })

    // Check if all matches in this training have results now
    if (match.trainingId) {
      const allMatches = await prisma.match.findMany({
        where: { trainingId: match.trainingId },
        include: { result: true },
      })

      const allHaveResults = allMatches.every(m => m.result !== null)
      if (allHaveResults) {
        // Auto-set training status to COMPLETED
        await prisma.training.update({
          where: { id: match.trainingId },
          data: { status: 'COMPLETED' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      eloChanges: {
        team1: eloChanges.team1Change,
        team2: eloChanges.team2Change,
      },
    })
  } catch (error) {
    console.error('Error recording match result:', error)
    return NextResponse.json(
      { error: 'Failed to record result' },
      { status: 500 }
    )
  }
}

async function updatePlayerStatistics(tx: any, playerId: string, won: boolean) {
  const stats = await tx.playerStatistics.findUnique({
    where: { playerId },
  })

  if (!stats) {
    // Create stats if they don't exist
    await tx.playerStatistics.create({
      data: {
        playerId,
        totalMatches: 1,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        winRate: won ? 100 : 0,
        currentStreak: won ? 1 : -1,
        longestWinStreak: won ? 1 : 0,
      },
    })
  } else {
    // Update existing stats
    const newTotalMatches = stats.totalMatches + 1
    const newWins = stats.wins + (won ? 1 : 0)
    const newLosses = stats.losses + (won ? 0 : 1)
    const newWinRate = (newWins / newTotalMatches) * 100

    let newCurrentStreak = stats.currentStreak
    if (won) {
      newCurrentStreak = stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1
    } else {
      newCurrentStreak = stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1
    }

    const newLongestWinStreak = Math.max(
      stats.longestWinStreak,
      won ? newCurrentStreak : 0
    )

    await tx.playerStatistics.update({
      where: { playerId },
      data: {
        totalMatches: newTotalMatches,
        wins: newWins,
        losses: newLosses,
        winRate: newWinRate,
        currentStreak: newCurrentStreak,
        longestWinStreak: newLongestWinStreak,
      },
    })
  }
}

async function updatePartnershipHistory(
  tx: any,
  player1Id: string,
  player2Id: string
) {
  // Ensure consistent ordering
  const [p1, p2] = [player1Id, player2Id].sort()

  const existing = await tx.partnership.findFirst({
    where: {
      OR: [
        { player1Id: p1, player2Id: p2 },
        { player1Id: p2, player2Id: p1 },
      ],
    },
  })

  if (existing) {
    await tx.partnership.update({
      where: { id: existing.id },
      data: {
        timesPartnered: existing.timesPartnered + 1,
        lastPartnered: new Date(),
      },
    })
  } else {
    await tx.partnership.create({
      data: {
        player1Id: p1,
        player2Id: p2,
        timesPartnered: 1,
        lastPartnered: new Date(),
      },
    })
  }
}

async function updateOppositionHistory(
  tx: any,
  player1Id: string,
  player2Id: string
) {
  // Ensure consistent ordering
  const [p1, p2] = [player1Id, player2Id].sort()

  const existing = await tx.opposition.findFirst({
    where: {
      OR: [
        { player1Id: p1, player2Id: p2 },
        { player1Id: p2, player2Id: p1 },
      ],
    },
  })

  if (existing) {
    await tx.opposition.update({
      where: { id: existing.id },
      data: {
        timesOpposed: existing.timesOpposed + 1,
        lastOpposed: new Date(),
      },
    })
  } else {
    await tx.opposition.create({
      data: {
        player1Id: p1,
        player2Id: p2,
        timesOpposed: 1,
        lastOpposed: new Date(),
      },
    })
  }
}
