'use client'

import { useEffect, useState } from 'react'
import { StatisticsRedesign } from '@/components/statistics/statistics-redesign'

interface Statistics {
  overview: {
    totalPlayers: number
    activePlayers: number
    totalTrainings: number
    totalMatches: number
    completedMatches: number
    averageLevel: number
  }
  topPerformers: Array<{
    player: {
      id: string
      name: string
      level: number
    }
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
    longestWinStreak: number
  }>
  recentTrainings: Array<{
    id: string
    name: string
    date: string
    trainingPlayers: any[]
    _count: {
      matches: number
    }
  }>
}

interface RankingPlayer {
  id: string
  name: string
  level: number
  rank: number
  statistics: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentStreak: number
  } | null
}

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [rankings, setRankings] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('level')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchRankings()
  }, [sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/statistics/overview')
      if (res.ok) {
        const data = await res.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRankings = async () => {
    try {
      const res = await fetch(`/api/statistics/rankings?sortBy=${sortBy}&activeOnly=true`)
      if (res.ok) {
        const data = await res.json()
        setRankings(data)
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Indlæser statistik...</p>
        </div>
      </div>
    )
  }

  if (!statistics) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">Kunne ikke hente statistik</p>
      </div>
    )
  }

  return <StatisticsRedesign statistics={statistics} rankings={rankings} />
}
