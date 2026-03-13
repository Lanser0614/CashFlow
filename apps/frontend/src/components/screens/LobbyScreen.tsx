import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRoomStore } from '../../store/roomStore'

export function LobbyScreen() {
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const { createRoom, joinRoom, setScreen, error, clearError } = useRoomStore()

  const handleCreate = async () => {
    setIsCreating(true)
    clearError()
    await createRoom(maxPlayers)
    setIsCreating(false)
  }

  const handleJoin = async () => {
    if (joinCode.length < 4) return
    setIsJoining(true)
    clearError()
    await joinRoom(joinCode.toUpperCase())
    setIsJoining(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      {/* Background animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              background: i % 2 === 0 ? '#6366f1' : '#14b8a6',
              left: `${20 + i * 15}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4 + i, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-5xl mb-3"
          >
            🌐
          </motion.div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Онлайн игра
          </h1>
          <p className="text-slate-400 text-sm">Играйте с друзьями на разных устройствах</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {error}
          </motion.div>
        )}

        {/* Create Room */}
        <div className="glass-panel p-6 mb-4">
          <h2 className="text-lg font-bold text-white mb-4">Создать комнату</h2>

          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-2 block">Максимум игроков</label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxPlayers(n)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                  style={{
                    background: n === maxPlayers ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(45, 49, 84, 0.3)',
                    border: n === maxPlayers ? '2px solid #6366f1' : '2px solid #2d3154',
                    color: n === maxPlayers ? 'white' : '#94a3b8',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full text-base"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? 'Создание...' : '+ Создать комнату'}
          </motion.button>
        </div>

        {/* Join Room */}
        <div className="glass-panel p-6 mb-4">
          <h2 className="text-lg font-bold text-white mb-4">Присоединиться</h2>

          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="Код комнаты"
              maxLength={6}
              className="flex-1 rounded-lg px-4 py-3 text-center text-lg font-mono font-bold tracking-[0.3em]
                text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ background: 'rgba(45, 49, 84, 0.5)', border: '1px solid #3d4164' }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-success px-6"
              onClick={handleJoin}
              disabled={joinCode.length < 4 || isJoining}
              style={{ opacity: joinCode.length < 4 ? 0.5 : 1 }}
            >
              {isJoining ? '...' : 'Войти'}
            </motion.button>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            className="btn-ghost text-sm"
            onClick={() => setScreen('none')}
          >
            ← Назад
          </button>
        </div>
      </motion.div>
    </div>
  )
}
