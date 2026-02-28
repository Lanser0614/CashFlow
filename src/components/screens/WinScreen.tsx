import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { computePlayerStats } from '../../utils/playerStats'
import { formatCurrency } from '../../utils'
import { gameApi } from '../../services/api'

export function WinScreen() {
  const winner = useGameStore((s) => s.winner)
  const players = useGameStore((s) => s.players)
  const turnNumber = useGameStore((s) => s.turnNumber)
  const resetGame = useGameStore((s) => s.resetGame)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const resultPosted = useRef(false)

  // Post game result to backend
  useEffect(() => {
    if (!winner || !isAuthenticated || resultPosted.current) return
    resultPosted.current = true

    const winnerStats = computePlayerStats(winner)
    gameApi.storeResult({
      winner_name: winner.name,
      winner_profession: winner.professionName,
      winner_cash: winner.cash,
      winner_passive_income: winnerStats.passiveIncome,
      winner_net_worth: winnerStats.netWorth,
      player_count: players.length,
      player_summaries: players.map((p) => {
        const ps = computePlayerStats(p)
        return {
          name: p.name,
          profession: p.professionName,
          cash: p.cash,
          passiveIncome: ps.passiveIncome,
          track: p.track,
        }
      }),
      total_turns: turnNumber,
    }).catch(console.error)
  }, [winner, isAuthenticated, players, turnNumber])

  if (!winner) return null

  const stats = computePlayerStats(winner)

  // Sort other players by passive income
  const otherPlayers = players
    .filter((p) => p.id !== winner.id)
    .sort((a, b) => computePlayerStats(b).passiveIncome - computePlayerStats(a).passiveIncome)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      {/* Confetti-like background */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            width: `${20 + (i % 4) * 15}px`,
            height: `${20 + (i % 4) * 15}px`,
            background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#6366f1' : '#22c55e',
            opacity: 0.15,
            left: `${(i * 8.5) % 100}%`,
            top: `${(i * 7) % 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Winner card */}
        <div className="game-card p-8 text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-7xl mb-4"
          >
            🏆
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ПОБЕДИТЕЛЬ!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full" style={{ background: winner.color }} />
              <span className="text-2xl font-bold text-white">{winner.name}</span>
            </div>
            <div
              className="text-lg text-slate-400 mb-6"
            >
              {winner.professionName} достиг финансовой свободы!
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div className="rounded-xl p-3" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
              <div className="text-xs text-green-400 mb-1">Кэш на руках</div>
              <div className="text-xl font-bold text-white">{formatCurrency(winner.cash)}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
              <div className="text-xs text-indigo-400 mb-1">Пассивный доход</div>
              <div className="text-xl font-bold text-white">{formatCurrency(stats.passiveIncome)}/мес</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <div className="text-xs text-yellow-400 mb-1">Чистый капитал</div>
              <div className="text-xl font-bold text-white">{formatCurrency(stats.netWorth)}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
              <div className="text-xs text-pink-400 mb-1">Дети</div>
              <div className="text-xl font-bold text-white">{winner.babies} {'👶'.repeat(Math.min(winner.babies, 5))}</div>
            </div>
          </motion.div>
        </div>

        {/* Other players summary */}
        {otherPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="game-card p-5 mb-6"
          >
            <div className="text-sm font-semibold text-slate-400 mb-3">Другие игроки:</div>
            <div className="space-y-2">
              {otherPlayers.map((p) => {
                const ps = computePlayerStats(p)
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-sm text-white flex-1">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      Пассивный: {formatCurrency(ps.passiveIncome)}/мес
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                      {formatCurrency(p.cash)}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 justify-center"
        >
          <button className="btn-primary text-lg px-10" onClick={resetGame}>
            🎲 Новая игра
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
