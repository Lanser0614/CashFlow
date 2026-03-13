import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore } from '../../store/roomStore'
import { useAuthStore } from '../../store/authStore'
import { PROFESSIONS } from '../../data/professions'
import { formatCurrency } from '../../utils'
import { computePlayerStats } from '../../utils/playerStats'
import { VideoGrid } from '../video/VideoGrid'
import { VideoControls } from '../video/VideoControls'

const PLAYER_COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#ec4899', '#14b8a6',
]

export function WaitingRoom() {
  const { room, error, getIsHost, getMyPlayer, startOnlineGame, leaveRoom, updateMyPlayer, toggleReady, startPollingRoom, stopPollingRoom } = useRoomStore()
  const userId = useAuthStore((s) => s.user?.id)
  const [copied, setCopied] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Start polling room state
  useEffect(() => {
    startPollingRoom()
    return () => stopPollingRoom()
  }, [startPollingRoom, stopPollingRoom])

  if (!room) return null

  const isHost = getIsHost()
  const myPlayer = getMyPlayer()
  const playerCount = room.players.length
  const allReady = room.players.every((p) => p.is_ready || p.user_id === room.host_user_id)
  const canStart = isHost && playerCount >= 2 && allReady

  const shareLink = `${window.location.origin}?join=${room.code}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = shareLink
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStart = async () => {
    setIsStarting(true)
    await startOnlineGame()
    setIsStarting(false)
  }

  const getMockStats = (profId: string) => {
    const prof = PROFESSIONS.find((p) => p.id === profId)!
    const mockPlayer = {
      statement: { ...prof.statement, realEstate: [], businesses: [], stocks: [], speculations: [] },
      babies: 0,
      cash: prof.startingCash,
    } as any
    return computePlayerStats(mockPlayer)
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
              width: `${180 + i * 80}px`,
              height: `${180 + i * 80}px`,
              background: PLAYER_COLORS[i % PLAYER_COLORS.length],
              left: `${10 + i * 20}%`,
              top: `${10 + i * 18}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 3 + i, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Header with room code */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-3">Комната ожидания</h1>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <span className="text-sm text-slate-400">Код:</span>
            <span className="text-2xl font-mono font-bold tracking-[0.3em] text-indigo-300">{room.code}</span>
          </div>
        </div>

        {/* Share link */}
        <div className="glass-panel p-4 mb-4">
          <div className="text-xs text-slate-400 mb-2">Отправьте ссылку друзьям:</div>
          <div className="flex gap-2">
            <div
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-mono truncate"
              style={{ background: 'rgba(45, 49, 84, 0.5)', color: '#94a3b8', border: '1px solid #3d4164' }}
            >
              {shareLink}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                color: copied ? '#22c55e' : '#a5b4fc',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
              }}
              onClick={handleCopy}
            >
              {copied ? 'Скопировано!' : 'Копировать'}
            </motion.button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg text-sm text-center"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Players list */}
        <div className="glass-panel p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Игроки ({playerCount}/{room.max_players})
            </h2>
            <div className="text-xs text-slate-500">
              {isHost ? 'Вы — хост' : 'Ожидание хоста...'}
            </div>
          </div>

          <div className="space-y-3">
            {room.players.map((player) => {
              const isMe = player.user_id === userId
              const prof = PROFESSIONS.find((p) => p.id === player.profession_id)
              const stats = getMockStats(player.profession_id)
              const isPlayerHost = player.user_id === room.host_user_id

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl p-4"
                  style={{
                    background: isMe ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isMe ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: PLAYER_COLORS[player.player_index] }}
                    />

                    {isMe ? (
                      <input
                        type="text"
                        value={player.player_name}
                        onChange={(e) => updateMyPlayer({ player_name: e.target.value })}
                        className="flex-1 min-w-[100px] bg-transparent border-b border-white/20 px-1 py-0.5 text-base font-semibold
                          focus:outline-none focus:border-indigo-400 text-white"
                        maxLength={20}
                      />
                    ) : (
                      <span className="flex-1 min-w-[100px] text-base font-semibold text-white truncate">
                        {player.player_name}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isPlayerHost && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                          хост
                        </span>
                      )}

                      {/* Ready indicator */}
                      {(player.is_ready || isPlayerHost) ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                          Готов
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(148,163,184,0.1)', color: '#64748b' }}>
                          Не готов
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profession selector (only for self) */}
                  {isMe ? (
                    <select
                      value={player.profession_id}
                      onChange={(e) => updateMyPlayer({ profession_id: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-sm font-medium text-white cursor-pointer mb-2"
                      style={{ background: '#2d3154', border: '1px solid #3d4164' }}
                    >
                      {PROFESSIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-slate-400 mb-2">
                      {prof?.icon} {prof?.name}
                    </div>
                  )}

                  {/* Stats preview */}
                  {prof && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg px-2 py-1" style={{ background: 'rgba(34, 197, 94, 0.08)' }}>
                        <span className="text-green-400">Зарп: </span>
                        <span className="text-white">{formatCurrency(prof.statement.salary)}</span>
                      </div>
                      <div className="rounded-lg px-2 py-1" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                        <span className="text-indigo-400">Поток: </span>
                        <span className="text-white">{formatCurrency(stats.monthlyCashFlow)}</span>
                      </div>
                      <div className="rounded-lg px-2 py-1" style={{ background: 'rgba(245, 158, 11, 0.08)' }}>
                        <span className="text-yellow-400">Кэш: </span>
                        <span className="text-white">{formatCurrency(prof.startingCash)}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* Empty slots */}
            {Array.from({ length: room.max_players - playerCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-xl p-4 flex items-center justify-center text-sm text-slate-600"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.08)' }}
              >
                Ожидание игрока...
              </div>
            ))}
          </div>
        </div>

        {/* Video */}
        <div className="glass-panel p-3 mb-4">
          <div className="text-xs text-slate-400 mb-2">Видео</div>
          <VideoGrid isCompact roomCode={room.code} />
          <VideoControls roomCode={room.code} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            className="btn-ghost text-sm"
            onClick={leaveRoom}
          >
            ← Покинуть
          </button>

          {!isHost && myPlayer && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: myPlayer.is_ready
                  ? 'rgba(34, 197, 94, 0.2)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: myPlayer.is_ready ? '#22c55e' : 'white',
                border: myPlayer.is_ready ? '1px solid rgba(34,197,94,0.3)' : 'none',
              }}
              onClick={toggleReady}
            >
              {myPlayer.is_ready ? 'Отменить готовность' : 'Готов!'}
            </motion.button>
          )}

          {isHost && (
            <motion.button
              whileHover={canStart ? { scale: 1.02 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              className="btn-primary text-base px-8"
              onClick={handleStart}
              disabled={!canStart || isStarting}
              style={{ opacity: canStart ? 1 : 0.4 }}
            >
              {isStarting ? 'Запуск...' : '🎲 Начать игру!'}
            </motion.button>
          )}
        </div>

        {isHost && !canStart && (
          <div className="text-center text-xs text-slate-500 mt-3">
            {playerCount < 2
              ? 'Нужно минимум 2 игрока для начала'
              : 'Все игроки должны быть готовы'}
          </div>
        )}
      </motion.div>
    </div>
  )
}
