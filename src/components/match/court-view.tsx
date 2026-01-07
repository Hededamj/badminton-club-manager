'use client'

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
  const scale = compact ? 0.7 : 1
  const width = 280 * scale
  const height = 400 * scale

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="border-2 border-border rounded-lg bg-gradient-to-b from-green-50 to-green-100"
      >
        {/* Court outline */}
        <rect
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          rx="4"
        />

        {/* Service courts - vertical lines */}
        <line
          x1={width / 2}
          y1={10}
          x2={width / 2}
          y2={height - 10}
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Net in the middle */}
        <line
          x1={10}
          y1={height / 2}
          x2={width - 10}
          y2={height / 2}
          stroke="#1e293b"
          strokeWidth="4"
        />
        <circle cx={width / 2} cy={height / 2} r="3" fill="#1e293b" />

        {/* Service line - Team 1 side */}
        <line
          x1={20}
          y1={height * 0.3}
          x2={width - 20}
          y2={height * 0.3}
          stroke="#22c55e"
          strokeWidth="1.5"
        />

        {/* Service line - Team 2 side */}
        <line
          x1={20}
          y1={height * 0.7}
          x2={width - 20}
          y2={height * 0.7}
          stroke="#22c55e"
          strokeWidth="1.5"
        />

        {/* Team 1 Players - Top half */}
        {team1Players.length >= 1 && (
          <g>
            {/* Left player */}
            <circle
              cx={width * 0.25}
              cy={height * 0.25}
              r={compact ? "18" : "22"}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
            />
            <text
              x={width * 0.25}
              y={height * 0.25 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={compact ? "10" : "12"}
              fontWeight="bold"
            >
              {team1Players[0].name.split(' ')[0].substring(0, compact ? 4 : 5)}
            </text>
          </g>
        )}

        {team1Players.length >= 2 && (
          <g>
            {/* Right player */}
            <circle
              cx={width * 0.75}
              cy={height * 0.25}
              r={compact ? "18" : "22"}
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="2"
            />
            <text
              x={width * 0.75}
              y={height * 0.25 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={compact ? "10" : "12"}
              fontWeight="bold"
            >
              {team1Players[1].name.split(' ')[0].substring(0, compact ? 4 : 5)}
            </text>
          </g>
        )}

        {/* Team 2 Players - Bottom half */}
        {team2Players.length >= 1 && (
          <g>
            {/* Left player */}
            <circle
              cx={width * 0.25}
              cy={height * 0.75}
              r={compact ? "18" : "22"}
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="2"
            />
            <text
              x={width * 0.25}
              y={height * 0.75 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={compact ? "10" : "12"}
              fontWeight="bold"
            >
              {team2Players[0].name.split(' ')[0].substring(0, compact ? 4 : 5)}
            </text>
          </g>
        )}

        {team2Players.length >= 2 && (
          <g>
            {/* Right player */}
            <circle
              cx={width * 0.75}
              cy={height * 0.75}
              r={compact ? "18" : "22"}
              fill="#ef4444"
              stroke="#991b1b"
              strokeWidth="2"
            />
            <text
              x={width * 0.75}
              y={height * 0.75 + 5}
              textAnchor="middle"
              fill="white"
              fontSize={compact ? "10" : "12"}
              fontWeight="bold"
            >
              {team2Players[1].name.split(' ')[0].substring(0, compact ? 4 : 5)}
            </text>
          </g>
        )}

        {/* Court number badge */}
        <rect
          x={width - 50}
          y={10}
          width="40"
          height="24"
          fill="#1e293b"
          rx="12"
        />
        <text
          x={width - 30}
          y={26}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {courtNumber}
        </text>
      </svg>

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
