import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { useRoomStore } from '../../store/roomStore'
import { getAllGameVariants } from '../../modules/game-variants'
import { navigateToOnlineLobby } from '../../utils'
import { TutorialScreen } from '../tutorial/TutorialScreen'

export function ModeSelectScreen() {
  const [showTutorial, setShowTutorial] = useState(false)
  const setGameMode = useGameStore((s) => s.setGameMode)
  const openProfile = useGameStore((s) => s.openProfile)
  const { user, isAuthenticated, logout } = useAuthStore()
  const variants = getAllGameVariants()

  if (showTutorial) {
    return <TutorialScreen onClose={() => setShowTutorial(false)} />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      {/* User bar (top right) */}
      {isAuthenticated && user && (
        <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
          <span className="text-xs text-slate-400">
            👤 {user.name}
          </span>
          <button
            onClick={openProfile}
            className="text-xs text-indigo-300 hover:text-indigo-200 transition-colors px-2 py-1 rounded border border-indigo-500/20 hover:border-indigo-400/30"
          >
            Профиль
          </button>
          <button
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded border border-white/5 hover:border-white/10"
          >
            Выйти
          </button>
        </div>
      )}

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              background: i % 2 === 0 ? '#6366f1' : '#f59e0b',
              left: `${10 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4 + i, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-5xl sm:text-6xl mb-3"
          >
            💰
          </motion.div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CASH FLOW
          </h1>
          <p className="text-slate-400">Выберите версию и режим игры</p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {variants.map((variant, index) => {
            const color = variant.theme === 'quick'
              ? { border: 'rgba(34,197,94,0.25)', bg: 'rgba(34,197,94,0.15)', text: '#86efac', icon: '⚡' }
              : variant.theme === 'advanced'
                ? { border: 'rgba(245,158,11,0.28)', bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', icon: '📈' }
                : { border: 'rgba(99,102,241,0.25)', bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', icon: '🎲' }

            return (
              <motion.button
                key={variant.id}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: index === 0 ? -20 : index === 2 ? 20 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setGameMode(variant.id)}
                className="glass-panel p-4 sm:p-6 text-left cursor-pointer transition-all"
                style={{ border: `1px solid ${color.border}` }}
              >
                <div className="text-3xl sm:text-4xl mb-3">{color.icon}</div>
                <h2 className="text-xl font-bold text-white mb-2">{variant.shortLabel}</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {variant.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: color.bg, color: color.text }}>
                    {variant.ruleset === 'quick' ? '⏱ 15-30 мин' : variant.ruleset === 'advanced' ? '⏱ 70-110 мин' : '⏱ 60-90 мин'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: color.bg, color: color.text }}>
                    {variant.professions.length} профессий
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: color.bg, color: color.text }}>
                    {variant.board.ratRaceSize} клеток
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="flex justify-center mt-5">
          <button
            onClick={() => setShowTutorial(true)}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-white border transition-colors"
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.24)',
            }}
          >
            📖 Как играть
          </button>
        </div>

        {/* Online play button */}
        {isAuthenticated && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 py-3 rounded-xl font-bold text-base text-white"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              border: 'none',
            }}
            onClick={() => {
              navigateToOnlineLobby()
              useRoomStore.getState().setScreen('lobby')
            }}
          >
            🌐 Играть онлайн
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
