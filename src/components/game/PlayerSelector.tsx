import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { computePlayerStats } from '../../utils/playerStats'
import { formatCurrency } from '../../utils'
import { FinancialStatement } from '../finance/FinancialStatement'

export function PlayerSelector() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {players.map((player, i) => {
        const stats = computePlayerStats(player)
        const isCurrent = i === currentPlayerIndex
        const isExpanded = expandedId === player.id

        return (
          <div key={player.id}>
            <motion.div
              className="rounded-xl p-3 cursor-pointer transition-all"
              style={{
                background: isCurrent
                  ? `linear-gradient(135deg, ${player.color}22, ${player.color}11)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCurrent ? player.color + '60' : 'rgba(255,255,255,0.06)'}`,
              }}
              onClick={() => setExpandedId(isExpanded ? null : player.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-2">
                {/* Color indicator + current turn */}
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: player.color }}
                  />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: player.color }}
                      animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate">
                      {player.name}
                    </span>
                    {player.track === 'fast' && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                        🚀 Быстрый трек
                      </span>
                    )}
                    {player.downsized && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(100,116,139,0.2)', color: '#94a3b8' }}>
                        📉 Даунсайз
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{player.professionName}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: '#22c55e' }}>
                    {formatCurrency(player.cash)}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: stats.monthlyCashFlow >= 0 ? '#4ade80' : '#f87171' }}
                  >
                    {stats.monthlyCashFlow >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(stats.monthlyCashFlow))}/мес
                  </div>
                </div>

                <div className="text-slate-500 text-xs ml-1">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {/* Babies indicator */}
              {player.babies > 0 && (
                <div className="mt-1 text-xs text-slate-500">
                  {'👶'.repeat(player.babies)} {player.babies} {player.babies === 1 ? 'ребёнок' : player.babies < 5 ? 'детей' : 'детей'}
                </div>
              )}
            </motion.div>

            {/* Expanded financial statement */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-b-xl p-3 mx-0.5"
                    style={{
                      background: 'rgba(15, 17, 23, 0.8)',
                      border: `1px solid ${player.color}30`,
                      borderTop: 'none',
                      maxHeight: '380px',
                    }}
                  >
                    <FinancialStatement playerId={player.id} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
