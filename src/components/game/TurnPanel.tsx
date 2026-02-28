import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useRoomStore } from '../../store/roomStore'
import { Dice } from './Dice'
import { computePlayerStats } from '../../utils/playerStats'
import { formatCurrency } from '../../utils'
import { RAT_RACE_SPACES, FAST_TRACK_SPACES } from '../../data/board'

const END_TURN_TIMER_SECONDS = 5

export function TurnPanel() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const diceValues = useGameStore((s) => s.diceValues)
  const rollDiceAction = useGameStore((s) => s.rollDiceAction)
  const endTurn = useGameStore((s) => s.endTurn)
  const roomScreen = useRoomStore((s) => s.screen)
  const isOnline = roomScreen === 'game_online'
  const isMyTurn = useRoomStore((s) => s.isMyTurn)()
  const canAct = !isOnline || isMyTurn

  // Auto-advance timer for end_turn in online mode
  const [endTurnTimeLeft, setEndTurnTimeLeft] = useState(END_TURN_TIMER_SECONDS)
  const endTurnTimerActive = turnPhase === 'end_turn' && canAct
  const autoEndFired = useRef(false)

  useEffect(() => {
    if (!endTurnTimerActive) {
      setEndTurnTimeLeft(END_TURN_TIMER_SECONDS)
      autoEndFired.current = false
      return
    }
    setEndTurnTimeLeft(END_TURN_TIMER_SECONDS)
    autoEndFired.current = false
    const interval = setInterval(() => {
      setEndTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [endTurnTimerActive])

  useEffect(() => {
    if (endTurnTimeLeft !== 0 || !endTurnTimerActive || autoEndFired.current) return
    autoEndFired.current = true
    endTurn()
  }, [endTurnTimeLeft, endTurnTimerActive, endTurn])

  const player = players[currentPlayerIndex]
  if (!player) return null

  const stats = computePlayerStats(player)
  const spaces = player.track === 'rat' ? RAT_RACE_SPACES : FAST_TRACK_SPACES
  const currentSpace = spaces[player.position]
  const diceCount = player.track === 'fast' || player.chariteTurnsLeft > 0 ? 2 : 1
  const isRolling = turnPhase === 'moving'

  const getStatusText = () => {
    if (player.downsized) return `⚠️ Даунсайз (ещё ${player.downsizeTurnsLeft} хода)`
    if (player.chariteTurnsLeft > 0) return `🙏 Благотворительность (ещё ${player.chariteTurnsLeft} ходов с 2 кубиками)`
    if (player.track === 'fast') return '🚀 БЫСТРЫЙ ТРЕК!'
    return null
  }

  const statusText = getStatusText()

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      {/* Current player header */}
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ background: player.color }}
        />
        <div className="flex-1">
          <div className="font-bold text-white text-lg leading-tight">{player.name}</div>
          <div className="text-xs text-slate-400">{player.professionName}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color: '#22c55e' }}>
            {formatCurrency(player.cash)}
          </div>
          <div className="text-xs" style={{ color: stats.monthlyCashFlow >= 0 ? '#22c55e' : '#ef4444' }}>
            Поток: {formatCurrency(stats.monthlyCashFlow)}/мес
          </div>
        </div>
      </div>

      {/* Status badge */}
      {statusText && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs py-1.5 px-3 rounded-lg text-center font-medium"
          style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          {statusText}
        </motion.div>
      )}

      {/* Current space */}
      {currentSpace && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-base">{currentSpace.icon}</span>
          <span className="text-slate-300">
            Клетка {player.position}: <span className="font-medium text-white">{currentSpace.label}</span>
          </span>
        </div>
      )}

      {/* Dice area */}
      <div className="flex justify-center py-2">
        <Dice values={diceValues} rolling={isRolling} />
      </div>

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {/* Online: waiting for other player */}
        {isOnline && !canAct && turnPhase === 'roll' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-3 rounded-xl text-sm"
            style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <div className="text-slate-400 mb-1">Ожидание хода</div>
            <div className="text-indigo-300 font-semibold">{player.name}...</div>
          </motion.div>
        )}

        {turnPhase === 'roll' && canAct && (
          <motion.button
            key="roll-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="btn-primary w-full text-base py-3"
            onClick={rollDiceAction}
          >
            🎲 Бросить {diceCount > 1 ? '2 кубика' : 'кубик'}
          </motion.button>
        )}

        {turnPhase === 'moving' && (
          <motion.div
            key="moving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 py-2 text-sm"
          >
            Ход фишки...
          </motion.div>
        )}

        {turnPhase === 'resolving' && (
          <motion.div
            key="resolving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 py-2 text-sm"
          >
            Обработка...
          </motion.div>
        )}

        {turnPhase === 'end_turn' && canAct && (
          <motion.button
            key="end-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="btn-ghost w-full text-base py-3"
            onClick={endTurn}
          >
            ➡️ Следующий игрок
            <span className="ml-2 text-sm opacity-60">({endTurnTimeLeft}с)</span>
          </motion.button>
        )}

        {turnPhase === 'end_turn' && isOnline && !canAct && (
          <motion.div
            key="waiting-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-500 py-2 text-sm"
          >
            Ожидание завершения хода...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passive income progress (rat race only) */}
      {player.track === 'rat' && (
        <div className="mt-1">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Пассивный доход</span>
            <span>{formatCurrency(stats.passiveIncome)} / {formatCurrency(stats.totalExpenses)}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: stats.passiveIncome >= stats.totalExpenses
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
              animate={{
                width: `${Math.min(100, (stats.passiveIncome / Math.max(1, stats.totalExpenses)) * 100)}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {stats.passiveIncome >= stats.totalExpenses && (
            <div className="text-xs text-green-400 text-center mt-1 font-medium">
              🎉 Готов выйти из крысиных бегов!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
