import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { useRoomStore } from '../../store/roomStore'
import { startOnlineSync } from '../../store/onlineSync'
import { useIsMobile } from '../../hooks/useIsMobile'
import { GameBoard } from '../board/GameBoard'
import { BoardLegend } from '../board/BoardLegend'
import { TurnPanel } from '../game/TurnPanel'
import { PlayerSelector } from '../game/PlayerSelector'
import { ActionLog } from '../game/ActionLog'
import { CardModal } from '../cards/CardModal'
import { SaveLoadModal } from '../game/SaveLoadModal'
import { MobileBottomBar } from '../mobile/MobileBottomBar'
import { MobileDrawer } from '../mobile/MobileDrawer'

type Panel = 'players' | 'log'
type ModalState = null | 'save' | 'load'

export function GameScreen() {
  const [activePanel, setActivePanel] = useState<Panel>('players')
  const [showModal, setShowModal] = useState<ModalState>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = useIsMobile()
  const resetGame = useGameStore((s) => s.resetGame)
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const gameMode = useGameStore((s) => s.gameMode)
  const isQuick = gameMode === 'quick'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const roomScreen = useRoomStore((s) => s.screen)
  const room = useRoomStore((s) => s.room)
  const isOnline = roomScreen === 'game_online'
  const currentPlayer = players[currentPlayerIndex]

  // Start online sync + polling when in online mode
  useEffect(() => {
    if (!isOnline) return
    const roomStore = useRoomStore.getState()
    roomStore.startPollingState()
    const unsub = startOnlineSync()
    return () => {
      roomStore.stopPollingState()
      unsub()
    }
  }, [isOnline])

  const handleExit = () => {
    if (isOnline) {
      useRoomStore.getState().leaveRoom()
    }
    resetGame()
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
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
          <span className="font-bold text-sm hidden sm:inline" style={{
            background: 'linear-gradient(90deg, #f59e0b, #fcd34d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CASH FLOW 101
          </span>
          {isQuick && (
            <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '9px' }}>
              ⚡ БЫСТРАЯ
            </span>
          )}
        </div>

        {/* Player quick stats — desktop only */}
        <div className="hidden lg:flex gap-1.5 overflow-x-auto flex-1 mx-3">
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

        {/* Mobile: compact current player info */}
        {currentPlayer && (
          <div className="flex lg:hidden items-center gap-2 flex-1 mx-2 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: currentPlayer.color }} />
            <span className="text-sm text-white font-medium truncate">{currentPlayer.name}</span>
            <span className="text-sm flex-shrink-0" style={{ color: '#22c55e' }}>
              ${currentPlayer.cash >= 1000 ? `${Math.round(currentPlayer.cash / 1000)}K` : currentPlayer.cash}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Online room code indicator */}
          {isOnline && room && (
            <>
              <span
                className="text-xs font-mono px-2 py-1 rounded"
                style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.25)' }}
              >
                🌐 {room.code}
              </span>
              <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </>
          )}
          {/* Save/Load — desktop only, not in quick mode */}
          {isAuthenticated && !isOnline && !isQuick && (
            <div className="hidden lg:flex items-center gap-1.5">
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
            </div>
          )}
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1.5 touch-target flex items-center justify-center"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
          <button
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            onClick={handleExit}
          >
            ✕ <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Turn panel — desktop only */}
        <div
          className="hidden lg:flex flex-shrink-0 flex-col gap-3 p-3 overflow-y-auto"
          style={{ width: 'min(270px, 40vw)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <TurnPanel />
        </div>

        {/* Center: board — fills remaining space */}
        <div
          className="flex-1 flex flex-col items-center justify-center overflow-hidden min-w-0"
          style={{ padding: isMobile ? '4px' : '8px', paddingBottom: isMobile ? 'calc(68px + env(safe-area-inset-bottom, 0px))' : '8px' }}
        >
          {/* Square board that fits available space */}
          <div style={{
            flex: isMobile ? '0 0 auto' : '1 1 0',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <div style={{
              width: isMobile ? 'calc(100vw - 8px)' : 'min(100%, calc(100vh - 120px))',
              maxWidth: isMobile ? 'none' : '520px',
              aspectRatio: '1 / 1',
            }}>
              <GameBoard />
            </div>
          </div>
          {/* Legend — hidden on mobile (accessible via drawer) */}
          <div className="flex-shrink-0 w-full hidden lg:block" style={{ maxWidth: '520px' }}>
            <BoardLegend />
          </div>
        </div>

        {/* Right: players + log — desktop only */}
        <div
          className="flex-shrink-0 hidden lg:flex flex-col overflow-hidden"
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

      {/* Mobile bottom bar + drawer */}
      <MobileBottomBar onMenuPress={() => setDrawerOpen(true)} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

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
