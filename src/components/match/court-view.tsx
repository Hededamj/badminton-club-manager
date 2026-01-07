'use client'

import Image from 'next/image'

interface CourtViewProps {
  team1Players: Array<{ name: string; level: number; gender?: 'MALE' | 'FEMALE' | null }>
  team2Players: Array<{ name: string; level: number; gender?: 'MALE' | 'FEMALE' | null }>
  courtNumber: number
  result?: {
    team1Score: number
    team2Score: number
    winningTeam: number
  } | null
  compact?: boolean
}

// Determine match type based on players' genders
function getMatchType(team1Players: any[], team2Players: any[]): { type: 'HD' | 'DD' | 'MD' | null; color: string } {
  const allPlayers = [...team1Players, ...team2Players]
  const genders = allPlayers.map(p => p.gender).filter(Boolean)

  if (genders.length < 4) return { type: null, color: '#64748b' } // Unknown

  const maleCount = genders.filter(g => g === 'MALE').length
  const femaleCount = genders.filter(g => g === 'FEMALE').length

  if (maleCount === 4) return { type: 'HD', color: '#3b82f6' } // Blue for men's doubles
  if (femaleCount === 4) return { type: 'DD', color: '#ec4899' } // Pink for women's doubles
  if (maleCount === 2 && femaleCount === 2) return { type: 'MD', color: '#8b5cf6' } // Purple for mixed doubles

  return { type: null, color: '#64748b' }
}

export function CourtView({ team1Players, team2Players, courtNumber, result, compact = false }: CourtViewProps) {
  const matchTypeInfo = getMatchType(team1Players, team2Players)
  const width = compact ? 180 : 220 // Reduced from 210/300

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-lg" style={{ width: `${width}px` }}>
        {/* Badminton court image */}
        <Image
          src="/assets/badmintonbane.jpg"
          alt="Badmintonbane"
          width={300}
          height={428}
          className="w-full h-auto"
          priority
        />

        {/* Court number badge */}
        <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-2 py-0.5 rounded-full font-bold text-xs">
          Bane {courtNumber}
        </div>

        {/* Match type badge in center */}
        {matchTypeInfo.type && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-xl border-2 border-white/30"
            style={{ backgroundColor: matchTypeInfo.color }}
          >
            {matchTypeInfo.type}
          </div>
        )}

        {/* Team 1 Players - Top half (blue) */}
        {team1Players.length >= 1 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '25%',
              top: '20%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full shadow-lg border-2 border-blue-700 font-semibold text-[10px] whitespace-nowrap">
              {team1Players[0].name.split(' ')[0].substring(0, 5)}
            </div>
          </div>
        )}

        {team1Players.length >= 2 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '75%',
              top: '20%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full shadow-lg border-2 border-blue-700 font-semibold text-[10px] whitespace-nowrap">
              {team1Players[1].name.split(' ')[0].substring(0, 5)}
            </div>
          </div>
        )}

        {/* Team 2 Players - Bottom half (red) */}
        {team2Players.length >= 1 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '25%',
              top: '80%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-red-500 text-white px-2 py-1 rounded-full shadow-lg border-2 border-red-700 font-semibold text-[10px] whitespace-nowrap">
              {team2Players[0].name.split(' ')[0].substring(0, 5)}
            </div>
          </div>
        )}

        {team2Players.length >= 2 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '75%',
              top: '80%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-red-500 text-white px-2 py-1 rounded-full shadow-lg border-2 border-red-700 font-semibold text-[10px] whitespace-nowrap">
              {team2Players[1].name.split(' ')[0].substring(0, 5)}
            </div>
          </div>
        )}
      </div>

      {/* Player names and levels below court */}
      {!compact && (
        <div className="w-full space-y-2 text-xs">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <p className="font-medium text-blue-900 mb-1">Hold 1 (Blå)</p>
            <div className="space-y-0.5">
              {team1Players.map((player, idx) => (
                <div key={idx} className="flex justify-between text-blue-800">
                  <span>{player.name}</span>
                  <span className="font-mono">{Math.round(player.level)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-2 border border-red-200">
            <p className="font-medium text-red-900 mb-1">Hold 2 (Rød)</p>
            <div className="space-y-0.5">
              {team2Players.map((player, idx) => (
                <div key={idx} className="flex justify-between text-red-800">
                  <span>{player.name}</span>
                  <span className="font-mono">{Math.round(player.level)}</span>
                </div>
              ))}
            </div>
          </div>

          {result && (
            <div className="bg-slate-100 rounded-lg p-2 border border-slate-300 text-center">
              <p className="font-bold text-slate-900">
                {result.team1Score} - {result.team2Score}
              </p>
              <p className="text-xs text-slate-600">
                {result.winningTeam === 1 ? 'Hold 1 vandt' : 'Hold 2 vandt'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
