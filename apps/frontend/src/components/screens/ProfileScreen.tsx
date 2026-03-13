import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { gameApi, type GameResultItem } from '../../services/api'
import { useGameStore } from '../../store/gameStore'
import { formatCurrency } from '../../utils'

function normalizeResult(result: GameResultItem): GameResultItem {
  return {
    ...result,
    session_key: result.session_key ?? null,
    game_mode: result.game_mode ?? 'classic',
    player_name: result.player_name ?? result.winner_name ?? null,
    player_profession: result.player_profession ?? result.winner_profession ?? null,
    player_cash: result.player_cash ?? result.winner_cash ?? 0,
    player_passive_income: result.player_passive_income ?? result.winner_passive_income ?? 0,
    player_net_worth: result.player_net_worth ?? result.winner_net_worth ?? 0,
    did_win: result.did_win ?? false,
    is_completed: result.is_completed ?? true,
    player_summaries: Array.isArray(result.player_summaries) ? result.player_summaries : [],
    journal: Array.isArray(result.journal) ? result.journal : [],
  }
}

function formatDate(value: string): string {
  const date = new Date(value)
  return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function ProfileScreen() {
  const showModeSelect = useGameStore((s) => s.showModeSelect)
  const [results, setResults] = useState<GameResultItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await gameApi.listResults()
        if (!active) return
        const normalized = data.map(normalizeResult)
        setResults(normalized)
        setSelectedId(normalized[0]?.id ?? null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Не удалось загрузить журнал игр')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const selectedResult = results.find((result) => result.id === selectedId) ?? null

  const analytics = useMemo(() => {
    if (results.length === 0) {
      return {
        totalGames: 0,
        wins: 0,
        averageTurns: 0,
        averageCash: 0,
        averagePassiveIncome: 0,
      }
    }

    const totalGames = results.length
    const wins = results.filter((result) => result.did_win).length
    const averageTurns = Math.round(results.reduce((sum, result) => sum + result.total_turns, 0) / totalGames)
    const averageCash = Math.round(results.reduce((sum, result) => sum + result.player_cash, 0) / totalGames)
    const averagePassiveIncome = Math.round(
      results.reduce((sum, result) => sum + result.player_passive_income, 0) / totalGames,
    )

    return {
      totalGames,
      wins,
      averageTurns,
      averageCash,
      averagePassiveIncome,
    }
  }, [results])

  return (
    <div
      className="min-h-screen p-4 sm:p-6"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white">Профиль и журналы игр</h1>
            <p className="text-slate-400 text-sm mt-1">
              История партий, итоговые метрики и подробный журнал событий по каждой игре.
            </p>
          </div>
          <button
            onClick={showModeSelect}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              background: 'rgba(99,102,241,0.16)',
              color: '#c7d2fe',
              border: '1px solid rgba(99,102,241,0.24)',
            }}
          >
            Назад
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4">
          <div className="space-y-4">
            <div className="glass-panel p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Аналитика
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
                  <div className="text-xs text-slate-400 mb-1">Партий</div>
                  <div className="text-xl font-bold text-white">{analytics.totalGames}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <div className="text-xs text-slate-400 mb-1">Побед</div>
                  <div className="text-xl font-bold text-white">{analytics.wins}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <div className="text-xs text-slate-400 mb-1">Средний кэш</div>
                  <div className="text-sm font-bold text-white">{formatCurrency(analytics.averageCash)}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(20,184,166,0.08)' }}>
                  <div className="text-xs text-slate-400 mb-1">Ср. пассив</div>
                  <div className="text-sm font-bold text-white">{formatCurrency(analytics.averagePassiveIncome)}</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Средняя длина партии: {analytics.averageTurns} ходов
              </div>
            </div>

            <div className="glass-panel p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                История игр
              </div>

              {loading && <div className="text-sm text-slate-500">Загрузка...</div>}
              {error && <div className="text-sm text-red-400">{error}</div>}
              {!loading && !error && results.length === 0 && (
                <div className="text-sm text-slate-500">Пока нет сохраненных журналов игр.</div>
              )}

              <div className="space-y-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedId(result.id)}
                    className="w-full text-left rounded-xl p-3 transition-colors"
                    style={{
                      background: result.id === selectedId ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${result.id === selectedId ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {result.player_name || result.winner_name}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: result.is_completed
                            ? (result.did_win ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)')
                            : 'rgba(245,158,11,0.15)',
                          color: result.is_completed
                            ? (result.did_win ? '#22c55e' : '#94a3b8')
                            : '#f59e0b',
                        }}
                      >
                        {result.is_completed ? (result.did_win ? 'Победа' : 'Завершена') : 'В процессе'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{formatDate(result.created_at)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {result.game_mode === 'quick' ? 'Быстрая' : 'Классическая'} · {result.total_turns} ходов
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 sm:p-5 min-h-[540px]">
            {!selectedResult ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Выбери игру слева, чтобы посмотреть журнал и анализ.
              </div>
            ) : (
              <motion.div
                key={selectedResult.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                      Детали партии
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedResult.player_name || 'Игрок'} · {selectedResult.game_mode === 'quick' ? 'Быстрая' : 'Классическая'}
                    </h2>
                    <div className="text-sm text-slate-400 mt-1">
                      {formatDate(selectedResult.created_at)} · Победитель: {selectedResult.winner_name}
                    </div>
                  </div>
                  <div
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: !selectedResult.is_completed
                        ? 'rgba(245,158,11,0.15)'
                        : selectedResult.did_win
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(239,68,68,0.15)',
                      color: !selectedResult.is_completed
                        ? '#f59e0b'
                        : selectedResult.did_win
                          ? '#22c55e'
                          : '#f87171',
                    }}
                  >
                    {!selectedResult.is_completed
                      ? 'Журнал сохраняется после каждого действия'
                      : selectedResult.did_win
                        ? 'Ты выиграл эту игру'
                        : 'Игра завершена без победы профиля'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
                    <div className="text-xs text-slate-400 mb-1">Твой кэш</div>
                    <div className="text-lg font-bold text-white">{formatCurrency(selectedResult.player_cash)}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(20,184,166,0.08)' }}>
                    <div className="text-xs text-slate-400 mb-1">Твой пассивный доход</div>
                    <div className="text-lg font-bold text-white">{formatCurrency(selectedResult.player_passive_income)}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <div className="text-xs text-slate-400 mb-1">Твой капитал</div>
                    <div className="text-lg font-bold text-white">{formatCurrency(selectedResult.player_net_worth)}</div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-sm font-semibold text-white mb-3">Итоги игроков</div>
                  <div className="space-y-2">
                    {selectedResult.player_summaries.map((player) => (
                      <div
                        key={`${selectedResult.id}-${player.name}`}
                        className="grid grid-cols-[1.2fr,0.9fr,0.9fr,0.8fr] gap-2 text-xs sm:text-sm items-center"
                      >
                        <div className="text-white truncate">{player.name}</div>
                        <div className="text-slate-400 truncate">{formatCurrency(player.cash)}</div>
                        <div className="text-slate-400 truncate">{formatCurrency(player.passiveIncome)}</div>
                        <div className="text-slate-500 uppercase">{player.track}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-sm font-semibold text-white mb-3">Журнал игры</div>
                  <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                    {selectedResult.journal.length === 0 && (
                      <div className="text-sm text-slate-500">Журнал этой игры пуст.</div>
                    )}
                    {selectedResult.journal.map((entry) => (
                      <div
                        key={`${selectedResult.id}-${entry.id}-${entry.timestamp}`}
                        className="rounded-lg p-3"
                        style={{ background: 'rgba(15,17,23,0.55)' }}
                      >
                        <div className="flex items-start gap-2 text-sm">
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                            style={{ background: entry.playerColor }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium" style={{ color: entry.playerColor }}>
                              {entry.playerName}
                            </div>
                            <div className="text-slate-300 leading-relaxed">{entry.message}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
