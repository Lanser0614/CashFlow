import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TurnPanel } from '../game/TurnPanel'
import { PlayerSelector } from '../game/PlayerSelector'
import { ActionLog } from '../game/ActionLog'
import { BoardLegend } from '../board/BoardLegend'

type DrawerTab = 'turn' | 'players' | 'log'

const TABS: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'turn', label: 'Ход', icon: '🎲' },
  { id: 'players', label: 'Игроки', icon: '👥' },
  { id: 'log', label: 'Журнал', icon: '📜' },
]

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('turn')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: '85vw',
              maxWidth: '340px',
              background: 'var(--color-surface)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="font-semibold text-white text-sm">Меню</span>
              <button
                className="text-slate-400 hover:text-white p-1 touch-target flex items-center justify-center"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2.5 text-xs font-semibold transition-colors"
                  style={{
                    color: activeTab === tab.id ? '#a5b4fc' : '#64748b',
                    borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                    background: activeTab === tab.id ? 'rgba(99,102,241,0.05)' : 'transparent',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              <AnimatePresence mode="wait">
                {activeTab === 'turn' && (
                  <motion.div
                    key="tab-turn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    <TurnPanel />
                    <div className="mt-2">
                      <BoardLegend />
                    </div>
                  </motion.div>
                )}
                {activeTab === 'players' && (
                  <motion.div
                    key="tab-players"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <PlayerSelector />
                  </motion.div>
                )}
                {activeTab === 'log' && (
                  <motion.div
                    key="tab-log"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ minHeight: '300px' }}
                  >
                    <ActionLog />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
