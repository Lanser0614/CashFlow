import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { GameBoard } from '../board/GameBoard'
import { BoardLegend } from '../board/BoardLegend'
import { TurnPanel } from '../game/TurnPanel'
import { PlayerSelector } from '../game/PlayerSelector'
import { ActionLog } from '../game/ActionLog'
import { CardModal } from '../cards/CardModal'
import { SaveLoadModal } from '../game/SaveLoadModal'

type Panel = 'players' | 'log'
type ModalState = null | 'save' | 'load'

export function GameScreen() {
  const [activePanel, setActivePanel] = useState<Panel>('players')
  const [showModal, setShowModal] = useState<ModalState>(null)
  const resetGame = useGameStore((s) => s.resetGame)
  const players = useGameStore((s) => s.players)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--color-bg)', minWidth: '900px' }}
    >
      {/* Top bar */}
      <div
        className="h-11 flex items-center justify-between px-3 flex-shrink-0"
        style={{
          background: 'rgba(26, 29, 46, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-base">💰</span>
          <span className="font-bold text-sm" style={{
            background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CASH FLOW 101
          </span>
        </div>

        {/* Player quick stats */}
        <div className="flex gap-1.5 overflow-x-auto flex-1 mx-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg flex-shrink-0"
              style={{
                background: `${p.color}18`,
                border: `1px solid ${p.color}40`,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-white font-medium">{p.name.split(' ')[0]}</span>
              <span style={{ color: '#22c55e' }}>
                ${p.cash >= 1000 ? `${Math.round(p.cash / 1000)}K` : p.cash}
              </span>
              {p.track === 'fast' && <span>🚀</span>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAuthenticated && (
            <>
              <button
                className="text-xs text-slate-500 hover:text-indigo-300 transition-colors px-2 py-1 rounded"
                onClick={() => setShowModal('save')}
                title="Сохранить игру"
              >
                💾
              </button>
              <button
                className="text-xs text-slate-500 hover:text-indigo-300 transition-colors px-2 py-1 rounded"
                onClick={() => setShowModal('load')}
                title="Загрузить игру"
              >
                📂
              </button>
              <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </>
          )}
          <button
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            onClick={resetGame}
          >
            ✕ Выйти
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Turn panel */}
        <div
          className="flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto"
          style={{ width: '270px', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <TurnPanel />
        </div>

        {/* Center: board — fills remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden p-2 min-w-0 gap-2">
          {/* Square board that fits available space */}
          <div style={{
            flex: '1 1 0',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 'min(100%, calc(100vh - 120px))',
              height: 'min(100%, calc(100vh - 120px))',
              maxWidth: '520px',
              maxHeight: '520px',
              aspectRatio: '1 / 1',
            }}>
              <GameBoard />
            </div>
          </div>
          {/* Legend */}
          <div className="flex-shrink-0 w-full" style={{ maxWidth: '520px' }}>
            <BoardLegend />
          </div>
        </div>

        {/* Right: players + log */}
        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: '270px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {(['players', 'log'] as Panel[]).map((id) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className="flex-1 py-2 text-xs font-semibold transition-colors"
                style={{
                  color: activePanel === id ? '#a5b4fc' : '#64748b',
                  borderBottom: activePanel === id ? '2px solid #6366f1' : '2px solid transparent',
                  background: activePanel === id ? 'rgba(99,102,241,0.05)' : 'transparent',
                }}
              >
                {id === 'players' ? '👥 Игроки' : '📜 Журнал'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              {activePanel === 'players' && (
                <motion.div key="players" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlayerSelector />
                </motion.div>
              )}
              {activePanel === 'log' && (
                <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: '300px' }}>
                  <ActionLog />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Card modal overlay */}
      <CardModal />

      {/* Save/Load modal */}
      <AnimatePresence>
        {showModal && (
          <SaveLoadModal
            onClose={() => setShowModal(null)}
            initialTab={showModal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
