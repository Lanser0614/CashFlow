import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { gameApi, type GameSaveListItem } from '../../services/api'
import type { GameState } from '../../types'

type Tab = 'save' | 'load'

interface Props {
  onClose: () => void
  initialTab?: Tab
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function SaveLoadModal({ onClose, initialTab = 'save' }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [saves, setSaves] = useState<GameSaveListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saveName, setSaveName] = useState(() => {
    const now = new Date()
    return `Сохранение ${now.toLocaleDateString('ru')} ${now.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadGameState = useGameStore((s) => s.loadGameState)

  useEffect(() => {
    fetchSaves()
  }, [])

  const fetchSaves = async () => {
    try {
      const data = await gameApi.listSaves()
      setSaves(data)
    } catch {
      setError('Не удалось загрузить сохранения')
    }
  }

  const getSerializableState = (): Record<string, unknown> => {
    const state = useGameStore.getState()
    return {
      phase: state.phase,
      gameMode: state.gameMode,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      turnPhase: state.turnPhase,
      diceValues: state.diceValues,
      activeCard: state.activeCard,
      pendingMarketCard: state.pendingMarketCard,
      log: state.log,
      winner: state.winner,
      smallDeckIndex: state.smallDeckIndex,
      bigDeckIndex: state.bigDeckIndex,
      doodadDeckIndex: state.doodadDeckIndex,
      marketDeckIndex: state.marketDeckIndex,
      smallDeck: state.smallDeck,
      bigDeck: state.bigDeck,
      doodadDeck: state.doodadDeck,
      marketDeck: state.marketDeck,
      turnNumber: state.turnNumber,
      surpriseDeck: state.surpriseDeck,
      surpriseDeckIndex: state.surpriseDeckIndex,
      extraTurnFlag: state.extraTurnFlag,
      variantState: state.variantState,
    }
  }

  const handleSaveNew = async () => {
    if (!saveName.trim()) return
    setLoading(true)
    setError('')
    try {
      const state = useGameStore.getState()
      const currentPlayer = state.players[state.currentPlayerIndex]
      console.log(currentPlayer)
      await gameApi.createSave({
        game_mode: state.gameMode,
        name: saveName.trim(),
        game_state: getSerializableState(),
        player_count: state.players.length,
        current_player_name: currentPlayer?.name ?? '',
        turn_number: state.turnNumber,
      })
      setSuccess('Игра сохранена!')
      await fetchSaves()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка сохранения'))
    } finally {
      setLoading(false)
    }
  }

  const handleOverwrite = async (save: GameSaveListItem) => {
    setLoading(true)
    setError('')
    try {
      const state = useGameStore.getState()
      const currentPlayer = state.players[state.currentPlayerIndex]
      await gameApi.updateSave(save.id, {
        game_mode: state.gameMode,
        name: save.name,
        game_state: getSerializableState(),
        player_count: state.players.length,
        current_player_name: currentPlayer?.name ?? '',
        turn_number: state.turnNumber,
      })
      setSuccess('Сохранение обновлено!')
      await fetchSaves()
      setTimeout(() => setSuccess(''), 2000)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка обновления'))
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = async (save: GameSaveListItem) => {
    setLoading(true)
    setError('')
    try {
      const detail = await gameApi.getSave(save.id)
      const currentVariant = useGameStore.getState().gameMode
      if (currentVariant !== detail.game_mode) {
        setError('Нельзя загрузить сохранение другой версии игры')
        setLoading(false)
        return
      }
      loadGameState(detail.game_state as unknown as GameState)
      onClose()
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка загрузки'))
      setLoading(false)
    }
  }

  const handleDelete = async (save: GameSaveListItem) => {
    setLoading(true)
    setError('')
    try {
      await gameApi.deleteSave(save.id)
      await fetchSaves()
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Ошибка удаления'))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru') + ' ' + d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-panel w-full max-w-lg mx-4"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-bold text-lg text-white">
            {tab === 'save' ? '💾 Сохранение' : '📂 Загрузка'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['save', 'load'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: tab === t ? '#a5b4fc' : '#64748b',
                borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
                background: tab === t ? 'rgba(99,102,241,0.05)' : 'transparent',
              }}
            >
              {t === 'save' ? '💾 Сохранить' : '📂 Загрузить'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 130px)' }}>
          {/* Messages */}
          {error && (
            <div className="mb-3 rounded-lg p-2.5 text-xs text-red-300 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 rounded-lg p-2.5 text-xs text-green-300 border border-green-500/20" style={{ background: 'rgba(34,197,94,0.1)' }}>
              {success}
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'save' ? (
              <motion.div key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* New save */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    placeholder="Название сохранения"
                  />
                  <button
                    onClick={handleSaveNew}
                    disabled={loading || !saveName.trim()}
                    className="btn-success text-xs px-4 py-2"
                  >
                    {loading ? '...' : 'Сохранить'}
                  </button>
                </div>

                {/* Existing saves to overwrite */}
                {saves.length > 0 && (
                  <>
                    <div className="text-xs text-slate-500 mb-2">Или перезаписать:</div>
                    <div className="space-y-2">
                      {saves.map((save) => (
                        <div
                          key={save.id}
                          className="flex items-center justify-between rounded-lg p-3"
                          style={{ background: 'rgba(45, 49, 84, 0.4)' }}
                        >
                          <div>
                            <div className="text-sm text-white font-medium">{save.name}</div>
                            <div className="text-[10px] text-slate-500">
                              {save.player_count} игр. · ход {save.turn_number} · {formatDate(save.updated_at)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleOverwrite(save)}
                            disabled={loading}
                            className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1"
                          >
                            Перезаписать
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {saves.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 text-sm">
                    Нет сохранений
                  </div>
                ) : (
                  <div className="space-y-2">
                    {saves.map((save) => (
                      <div
                        key={save.id}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: 'rgba(45, 49, 84, 0.4)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium truncate">{save.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {save.player_count} игр. · ход текущий: {save.current_player_name} · ход #{save.turn_number} · {formatDate(save.updated_at)}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 ml-2">
                          <button
                            onClick={() => handleLoad(save)}
                            disabled={loading}
                            className="text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-colors"
                          >
                            Загрузить
                          </button>
                          <button
                            onClick={() => handleDelete(save)}
                            disabled={loading}
                            className="text-xs text-red-400 hover:text-red-300 px-1 py-1"
                            title="Удалить"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
