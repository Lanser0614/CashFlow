import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import type { BoardSpace, Player } from '../../types'
import { getGameVariantModule, isQuickVariant } from '../../modules/game-variants'

// Board layout: 24 spaces around perimeter, fast track ring in center
const BOARD_SIZE = 500
const CENTER_X = BOARD_SIZE / 2
const CENTER_Y = BOARD_SIZE / 2

// Compute all 24 positions for the rat race track
function computeRatRacePositions(total: number, size: number) {
  const positions: { x: number; y: number }[] = []
  const perSide = total / 4
  const margin = 40
  const step = (size - 2 * margin) / (perSide - 1)

  for (let i = 0; i < total; i++) {
    const side = Math.floor(i / perSide)
    const pos = i % perSide
    switch (side) {
      case 0: positions.push({ x: margin + pos * step, y: margin }); break
      case 1: positions.push({ x: size - margin, y: margin + pos * step }); break
      case 2: positions.push({ x: size - margin - pos * step, y: size - margin }); break
      case 3: positions.push({ x: margin, y: size - margin - pos * step }); break
    }
  }
  return positions
}

const SPACE_COLORS: Record<string, string> = {
  payday: '#166534',
  small_deal: '#1e3a8a',
  big_deal: '#1d4ed8',
  deal: '#1e40af',
  doodad: '#7f1d1d',
  market: '#78350f',
  baby: '#831843',
  charity: '#4c1d95',
  downsize: '#1e293b',
  dream: '#78350f',
  fast_deal: '#1e3a8a',
  fast_market: '#78350f',
  surprise: '#4c1d95',
}

const SPACE_ICONS: Record<string, string> = {
  payday: '💰',
  small_deal: '📋',
  big_deal: '🏢',
  deal: '🤝',
  doodad: '💸',
  market: '📈',
  baby: '👶',
  charity: '🙏',
  downsize: '📉',
  dream: '⭐',
  fast_deal: '🏢',
  fast_market: '📊',
  surprise: '🎁',
}

function BoardCell({ space, players, isActive }: {
  space: BoardSpace
  players: Player[]
  isActive?: boolean
}) {
  const pawns = players.filter((p) =>
    (p.track === 'rat' || (p.track === 'fast' && space.type !== 'payday')) &&
    p.position === space.id,
  )

  return (
    <g>
      <rect
        width={48}
        height={48}
        rx={6}
        fill={SPACE_COLORS[space.type] ?? '#1e293b'}
        stroke={isActive ? '#f59e0b' : 'rgba(255,255,255,0.15)'}
        strokeWidth={isActive ? 2.5 : 1}
        x={-24}
        y={-24}
        style={{ filter: isActive ? 'drop-shadow(0 0 6px #f59e0b)' : undefined }}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
        y={-4}
      >
        {SPACE_ICONS[space.type] ?? '?'}
      </text>
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={5.5}
        fill="rgba(255,255,255,0.7)"
        y={12}
      >
        {space.label}
      </text>

      {/* Player pawns */}
      {pawns.map((p, i) => (
        <g key={p.id}>
          <motion.circle
            cx={-8 + i * 13}
            cy={-18}
            r={8}
            fill={p.color}
            stroke="white"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
          />
          <text
            x={-8 + i * 13}
            y={-18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            fontWeight="bold"
            fill="white"
          >
            {p.name[p.name.length - 1]}
          </text>
        </g>
      ))}
    </g>
  )
}

export function GameBoard() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const gameMode = useGameStore((s) => s.gameMode)
  const variant = getGameVariantModule(gameMode)
  const currentPlayer = players[currentPlayerIndex]
  const isQuick = isQuickVariant(gameMode)

  const boardSpaces = variant.board.ratRaceSpaces
  const boardSize = variant.board.ratRaceSize

  const outerPositions = computeRatRacePositions(boardSize, BOARD_SIZE)

  // Fast track: small ring inside (classic only)
  const fastTrackPositions = (() => {
    if (isQuick) return []
    const count = variant.board.fastTrackSize
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2
      const r = 120
      return {
        x: CENTER_X + r * Math.cos(angle),
        y: CENTER_Y + r * Math.sin(angle),
      }
    })
  })()

  const ratRacePlayers = players.filter((p) => p.track === 'rat')
  const fastTrackPlayers = players.filter((p) => p.track === 'fast')

  return (
    <div className="relative" style={{ width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Background */}
        <rect width={BOARD_SIZE} height={BOARD_SIZE} rx={16} fill="#0d1117" />
        <rect
          x={2} y={2}
          width={BOARD_SIZE - 4}
          height={BOARD_SIZE - 4}
          rx={14}
          fill="none"
          stroke={isQuick ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}
          strokeWidth={2}
        />

        {/* Center label */}
        <text
          x={CENTER_X}
          y={CENTER_Y - 20}
          textAnchor="middle"
          fill={isQuick ? 'rgba(34,197,94,0.6)' : 'rgba(99,102,241,0.6)'}
          fontSize={28}
          fontWeight="bold"
        >
          {variant.board.centerIcon}
        </text>
        <text
          x={CENTER_X}
          y={CENTER_Y + 10}
          textAnchor="middle"
          fill="rgba(148,163,184,0.5)"
          fontSize={12}
          fontWeight="bold"
        >
          {variant.board.centerLabel}
        </text>
        {!isQuick && (
          <text
            x={CENTER_X}
            y={CENTER_Y + 30}
            textAnchor="middle"
            fill="rgba(148,163,184,0.3)"
            fontSize={9}
          >
            Быстрый трек →
          </text>
        )}

        {/* Track path */}
        <polyline
          points={outerPositions.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={isQuick ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)'}
          strokeWidth={2}
          strokeDasharray="4,4"
        />

        {/* Fast track circle (classic only) */}
        {!isQuick && (
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={128}
            fill="none"
            stroke="rgba(245,158,11,0.2)"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
        )}

        {/* Outer track spaces */}
        {boardSpaces.map((space, i) => {
          const pos = outerPositions[i]
          const isCurrentPos = currentPlayer?.track === 'rat' && currentPlayer?.position === i
          return (
            <g key={`outer-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <BoardCell
                space={space}
                players={ratRacePlayers}
                isActive={isCurrentPos}
              />
            </g>
          )
        })}

        {/* Fast track spaces (classic only) */}
        {!isQuick && variant.board.fastTrackSpaces.map((space, i) => {
          const pos = fastTrackPositions[i]
          const isCurrentPos = currentPlayer?.track === 'fast' && currentPlayer?.position === i
          return (
            <g key={`fast-${i}`} transform={`translate(${pos.x}, ${pos.y})`}>
              <g>
                <rect
                  width={36}
                  height={36}
                  rx={5}
                  x={-18}
                  y={-18}
                  fill={space.type === 'dream' ? '#78350f' : SPACE_COLORS[space.type]}
                  stroke={isCurrentPos ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={isCurrentPos ? 2 : 0.5}
                />
                <text textAnchor="middle" dominantBaseline="middle" fontSize={12}>
                  {SPACE_ICONS[space.type] ?? '?'}
                </text>
                {/* Fast track player pawns */}
                {fastTrackPlayers
                  .filter((p) => p.position === i)
                  .map((p, pi) => (
                    <motion.circle
                      key={p.id}
                      cx={-10 + pi * 8}
                      cy={-14}
                      r={4}
                      fill={p.color}
                      stroke="white"
                      strokeWidth={1}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  ))}
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
