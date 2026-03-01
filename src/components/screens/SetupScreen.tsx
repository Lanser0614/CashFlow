import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'
import { useRoomStore } from '../../store/roomStore'
import { PROFESSIONS } from '../../data/professions'
import { QUICK_PROFESSIONS } from '../../data/quickMode'
import { formatCurrency } from '../../utils'
import { computePlayerStats } from '../../utils/playerStats'
import { TutorialScreen } from '../tutorial/TutorialScreen'
import { SaveLoadModal } from '../game/SaveLoadModal'

const PLAYER_COLORS = [
  { name: 'Индиго',   hex: '#6366f1' },
  { name: 'Золото',   hex: '#f59e0b' },
  { name: 'Красный',  hex: '#ef4444' },
  { name: 'Зелёный',  hex: '#22c55e' },
  { name: 'Розовый',  hex: '#ec4899' },
  { name: 'Бирюза',   hex: '#14b8a6' },
]

interface PlayerSetup {
  name: string
  professionId: string
}

export function SetupScreen() {
  const [step, setStep] = useState<'count' | 'players' | 'preview'>('count')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [playerCount, setPlayerCount] = useState(2)
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: 'Игрок 1', professionId: 'teacher' },
    { name: 'Игрок 2', professionId: 'engineer' },
  ])
  const startGame = useGameStore((s) => s.startGame)
  const gameMode = useGameStore((s) => s.gameMode)
  const resetGame = useGameStore((s) => s.resetGame)
  const isQuick = gameMode === 'quick'
  const availableProfessions = isQuick ? QUICK_PROFESSIONS : PROFESSIONS
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleCountSelect = (count: number) => {
    setPlayerCount(count)
    setPlayers(
      Array.from({ length: count }, (_, i) => ({
        name: `Игрок ${i + 1}`,
        professionId: availableProfessions[i % availableProfessions.length].id,
      })),
    )
    setStep('players')
  }

  const handlePlayerChange = (index: number, field: keyof PlayerSetup, value: string) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    )
  }

  const handleStart = () => {
    startGame(players)
  }

  const getMockStats = (profId: string) => {
    const prof = availableProfessions.find((p) => p.id === profId)!
    const mockPlayer = {
      statement: { ...prof.statement, realEstate: [], businesses: [], stocks: [], speculations: [] },
      babies: 0,
      cash: prof.startingCash,
    } as any
    return computePlayerStats(mockPlayer)
  }

  if (showTutorial) {
    return <TutorialScreen onClose={() => setShowTutorial(false)} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}>

      {/* User bar (top right) */}
      {isAuthenticated && user && (
        <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
          <span className="text-xs text-slate-400">
            👤 {user.name}
          </span>
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
        className="relative z-10 w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-5xl sm:text-6xl mb-3"
          >
            💰
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CASH FLOW 101
          </h1>
          <p className="text-slate-400">
            {isQuick ? '⚡ Быстрая игра' : 'Вырвись из крысиных бегов!'}
          </p>
        </div>

        {step === 'count' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-5 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Сколько игроков?</h2>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCountSelect(n)}
                  className="aspect-square rounded-xl text-2xl sm:text-3xl font-bold flex items-center justify-center
                    border-2 transition-all duration-200 min-h-[64px]"
                  style={{
                    borderColor: n === playerCount ? '#6366f1' : '#2d3154',
                    background: n === playerCount
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(45, 49, 84, 0.3)',
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
            {/* Online play button (classic only) */}
            {!isQuick && isAuthenticated && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-5 py-3 rounded-xl font-bold text-base text-white"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                  border: 'none',
                }}
                onClick={() => useRoomStore.getState().setScreen('lobby')}
              >
                🌐 Играть онлайн
              </motion.button>
            )}

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                className="btn-ghost text-sm"
                onClick={resetGame}
              >
                ← Назад
              </button>
              {!isQuick && (
                <button
                  className="btn-ghost text-sm"
                  onClick={() => setShowTutorial(true)}
                >
                  📖 Как играть?
                </button>
              )}
              {!isQuick && isAuthenticated && (
                <button
                  className="btn-ghost text-sm"
                  onClick={() => setShowLoadModal(true)}
                >
                  📂 Загрузить игру
                </button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'players' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, i) => {
                const prof = availableProfessions.find((p) => p.id === player.professionId)!
                const stats = getMockStats(player.professionId)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ background: PLAYER_COLORS[i].hex }}
                      />
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => handlePlayerChange(i, 'name', e.target.value)}
                        className="flex-1 bg-transparent border-b border-white/20 px-1 py-1 text-lg font-semibold
                          focus:outline-none focus:border-indigo-400 text-white"
                        maxLength={20}
                      />
                    </div>

                    {/* Profession selector */}
                    <div className="mb-3">
                      <select
                        value={player.professionId}
                        onChange={(e) => handlePlayerChange(i, 'professionId', e.target.value)}
                        className="w-full rounded-lg px-3 py-2.5 text-base sm:text-sm font-medium text-white cursor-pointer"
                        style={{ background: '#2d3154', border: '1px solid #3d4164' }}
                      >
                        {availableProfessions.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.icon} {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stats preview */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg p-2" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                        <div className="text-green-400 font-semibold">Зарплата</div>
                        <div className="text-white">{formatCurrency(prof.statement.salary)}</div>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                        <div className="text-indigo-400 font-semibold">Денежный поток</div>
                        <div className="text-white">{formatCurrency(stats.monthlyCashFlow)}</div>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                        <div className="text-red-400 font-semibold">Расходы</div>
                        <div className="text-white">{formatCurrency(stats.totalExpenses)}</div>
                      </div>
                      <div className="rounded-lg p-2" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                        <div className="text-yellow-400 font-semibold">Стартовый кэш</div>
                        <div className="text-white">{formatCurrency(prof.startingCash)}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-2 sm:px-0">
              <button className="btn-ghost order-2 sm:order-1" onClick={() => setStep('count')}>
                ← Назад к выбору
              </button>
              <button
                className="btn-primary text-lg px-10 w-full sm:w-auto order-1 sm:order-2"
                onClick={handleStart}
              >
                🎲 Начать игру!
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Load game modal */}
      <AnimatePresence>
        {showLoadModal && (
          <SaveLoadModal
            onClose={() => setShowLoadModal(false)}
            initialTab="load"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
