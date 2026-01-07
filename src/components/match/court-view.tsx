'use client'

import Image from 'next/image'

interface CourtViewProps {
  team1Players: Array<{ name: string; level: number }>
  team2Players: Array<{ name: string; level: number }>
  courtNumber: number
  result?: {
    team1Score: number
    team2Score: number
    winningTeam: number
  } | null
  compact?: boolean
}

export function CourtView({ team1Players, team2Players, courtNumber, result, compact = false }: CourtViewProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-lg overflow-hidden border-2 border-border shadow-lg" style={{ width: compact ? '210px' : '300px' }}>
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
        <div className="absolute top-2 right-2 bg-slate-900/90 text-white px-3 py-1 rounded-full font-bold text-sm">
          Bane {courtNumber}
        </div>

        {/* Team 1 Players - Top half (blue) */}
        {team1Players.length >= 1 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: compact ? '25%' : '25%',
              top: compact ? '20%' : '20%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-700 font-semibold text-xs whitespace-nowrap">
              {team1Players[0].name.split(' ')[0].substring(0, compact ? 6 : 8)}
            </div>
          </div>
        )}

        {team1Players.length >= 2 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: compact ? '75%' : '75%',
              top: compact ? '20%' : '20%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-blue-700 font-semibold text-xs whitespace-nowrap">
              {team1Players[1].name.split(' ')[0].substring(0, compact ? 6 : 8)}
            </div>
          </div>
        )}

        {/* Team 2 Players - Bottom half (red) */}
        {team2Players.length >= 1 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: compact ? '25%' : '25%',
              top: compact ? '80%' : '80%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-red-700 font-semibold text-xs whitespace-nowrap">
              {team2Players[0].name.split(' ')[0].substring(0, compact ? 6 : 8)}
            </div>
          </div>
        )}

        {team2Players.length >= 2 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: compact ? '75%' : '75%',
              top: compact ? '80%' : '80%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg border-2 border-red-700 font-semibold text-xs whitespace-nowrap">
              {team2Players[1].name.split(' ')[0].substring(0, compact ? 6 : 8)}
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
