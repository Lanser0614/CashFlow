import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useRoomStore } from '../../store/roomStore'
import { formatCurrency } from '../../utils'
import { computePlayerStats } from '../../utils/playerStats'

const END_TURN_TIMER_SECONDS = 5

export function MobileBottomBar({ onMenuPress }: { onMenuPress: () => void }) {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const rollDiceAction = useGameStore((s) => s.rollDiceAction)
  const endTurn = useGameStore((s) => s.endTurn)
  const isOnline = useRoomStore((s) => s.screen) === 'game_online'
  const isMyTurn = useRoomStore((s) => s.isMyTurn)()
  const canAct = !isOnline || isMyTurn

  const player = players[currentPlayerIndex]
  const stats = player ? computePlayerStats(player) : null

  // Auto end-turn timer
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
        if (prev <= 1) { clearInterval(interval); return 0 }
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

  if (!player) return null

  const getActionButton = () => {
    if (turnPhase === 'roll' && canAct) {
      return (
        <button
          className="btn-primary flex-1 py-3 text-base font-bold"
          onClick={rollDiceAction}
        >
          🎲 Бросить кубик
        </button>
      )
    }
    if (turnPhase === 'moving') {
      return (
        <div className="flex-1 text-center text-slate-400 py-3 text-sm">
          Ход фишки...
        </div>
      )
    }
    if (turnPhase === 'resolving' || turnPhase === 'card_shown' || turnPhase === 'market_sell') {
      return (
        <div className="flex-1 text-center text-slate-400 py-3 text-sm">
          {turnPhase === 'card_shown' || turnPhase === 'market_sell' ? '📋 Карта...' : 'Обработка...'}
        </div>
      )
    }
    if (turnPhase === 'end_turn' && canAct) {
      return (
        <button
          className="btn-ghost flex-1 py-3 text-base"
          onClick={endTurn}
        >
          ➡️ Далее
          <span className="ml-1 text-sm opacity-60">({endTurnTimeLeft}с)</span>
        </button>
      )
    }
    if (turnPhase === 'end_turn' && !canAct) {
      return (
        <div className="flex-1 text-center text-slate-500 py-3 text-sm">
          Ожидание...
        </div>
      )
    }
    if (turnPhase === 'roll' && !canAct) {
      return (
        <div className="flex-1 text-center text-slate-500 py-3 text-sm">
          Ход {player.name}...
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="flex items-center gap-2 px-3 h-16"
        style={{
          background: 'rgba(26, 29, 46, 0.97)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Current player info */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0" style={{ maxWidth: '35%' }}>
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: player.color }} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{player.name}</div>
            <div className="text-[10px] leading-tight" style={{ color: '#22c55e' }}>
              {formatCurrency(player.cash)}
              {stats && (
                <span className="text-slate-500 ml-1">
                  ({stats.passiveIncome >= stats.totalExpenses ? '✓' : `${Math.round((stats.passiveIncome / Math.max(1, stats.totalExpenses)) * 100)}%`})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        {getActionButton()}

        {/* Menu button */}
        <button
          className="flex-shrink-0 p-2.5 rounded-lg touch-target"
          style={{ color: '#94a3b8' }}
          onClick={onMenuPress}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1"/>
            <rect y="9" width="20" height="2" rx="1"/>
            <rect y="15" width="20" height="2" rx="1"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
