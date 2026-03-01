import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { computePlayerStats } from '../../utils/playerStats'
import { formatCurrency } from '../../utils'

type Tab = 'overview' | 'assets' | 'liabilities'

function Row({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' | 'yellow' }) {
  const colors = {
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#f59e0b',
    undefined: '#e2e8f0',
  }
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 gap-2">
      <span className="text-sm text-slate-400 min-w-0 truncate">{label}</span>
      <span className="text-sm font-semibold flex-shrink-0" style={{ color: colors[accent ?? 'undefined'] }}>
        {value}
      </span>
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-wider py-2 mt-2"
      style={{ color: '#6366f1' }}>
      {children}
    </div>
  )
}

export function FinancialStatement({ playerId }: { playerId: string }) {
  const [tab, setTab] = useState<Tab>('overview')
  const players = useGameStore((s) => s.players)
  const sellAsset = useGameStore((s) => s.sellAsset)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const player = players.find((p) => p.id === playerId)

  if (!player) return null

  const stats = computePlayerStats(player)
  const s = player.statement
  const isCurrentPlayer = players[currentPlayerIndex]?.id === playerId
  const canSell = isCurrentPlayer && (turnPhase === 'end_turn' || turnPhase === 'market_sell' || turnPhase === 'roll')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Обзор' },
    { id: 'assets', label: 'Активы' },
    { id: 'liabilities', label: 'Пассивы' },
  ]

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-1.5 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#a5b4fc' : '#64748b',
              border: `1px solid ${tab === t.id ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <SectionHeader>📥 Доходы</SectionHeader>
              <Row label="Зарплата" value={formatCurrency(s.salary)} />
              <Row label="Пассивный доход" value={formatCurrency(stats.passiveIncome)} accent="green" />
              {s.realEstate.map((re) => (
                <Row key={re.id} label={`  ${re.name}`} value={`+${formatCurrency(re.monthlyCashflow)}`} accent="green" />
              ))}
              {s.businesses.map((b) => (
                <Row key={b.id} label={`  ${b.name}`} value={`+${formatCurrency(b.monthlyCashflow)}`} accent="green" />
              ))}
              <Row label="Итого доходы" value={formatCurrency(stats.totalIncome)} accent="green" />

              <SectionHeader>📤 Расходы</SectionHeader>
              <Row label="Налоги" value={formatCurrency(s.taxes)} />
              <Row label="Ипотека (дом)" value={formatCurrency(s.mortgage)} />
              <Row label="Автокредит" value={formatCurrency(s.carLoan)} />
              <Row label="Кредитная карта" value={formatCurrency(s.creditCard)} />
              <Row label="Учёбный кредит" value={formatCurrency(s.schoolLoan)} />
              <Row label="Дети" value={formatCurrency(s.childExpenses * player.babies)} />
              <Row label="Прочее" value={formatCurrency(s.otherExpenses)} />
              <Row label="Итого расходы" value={formatCurrency(stats.totalExpenses)} accent="red" />

              <div
                className="mt-3 rounded-xl p-3 text-center"
                style={{
                  background: stats.monthlyCashFlow >= 0
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${stats.monthlyCashFlow >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div className="text-xs text-slate-400 mb-1">Денежный поток в месяц</div>
                <div
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: stats.monthlyCashFlow >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {stats.monthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(stats.monthlyCashFlow)}
                </div>
              </div>

              {player.track === 'rat' && (
                <div className="mt-2 text-xs text-center" style={{ color: '#94a3b8' }}>
                  Пассивный: {formatCurrency(stats.passiveIncome)} / {formatCurrency(stats.totalExpenses)} расходов
                  {stats.passiveIncome >= stats.totalExpenses && (
                    <span className="ml-2 text-green-400 font-bold">🎉 СВОБОДА!</span>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {tab === 'assets' && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <SectionHeader>💵 Кэш</SectionHeader>
              <Row label="Наличные" value={formatCurrency(player.cash)} accent="green" />

              <SectionHeader>📊 Акции</SectionHeader>
              {s.stocks.length === 0 && (
                <div className="text-xs text-slate-500 py-2">Нет акций</div>
              )}
              {s.stocks.map((stock) => (
                <div key={stock.symbol}
                  className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-slate-400">
                      {stock.shares} акций × ${stock.currentPrice} = {formatCurrency(stock.shares * stock.currentPrice)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Куплено по ${stock.purchasePrice}
                    </div>
                  </div>
                  {canSell && stock.currentPrice > 0 && (
                    <button
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
                      onClick={() => sellAsset(stock.symbol, 'stock', stock.currentPrice)}
                    >
                      Продать
                    </button>
                  )}
                </div>
              ))}

              <SectionHeader>🏠 Недвижимость</SectionHeader>
              {s.realEstate.length === 0 && (
                <div className="text-xs text-slate-500 py-2">Нет недвижимости</div>
              )}
              {s.realEstate.map((re) => (
                <div key={re.id}
                  className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{re.name}</div>
                    <div className="text-xs text-green-400">+{formatCurrency(re.monthlyCashflow)}/мес</div>
                    <div className="text-xs text-slate-400">
                      Стоимость: {formatCurrency(re.purchasePrice)}
                    </div>
                  </div>
                </div>
              ))}

              <SectionHeader>🏪 Бизнес</SectionHeader>
              {s.businesses.length === 0 && (
                <div className="text-xs text-slate-500 py-2">Нет бизнеса</div>
              )}
              {s.businesses.map((biz) => (
                <div key={biz.id}
                  className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{biz.name}</div>
                    <div className="text-xs text-green-400">+{formatCurrency(biz.monthlyCashflow)}/мес</div>
                  </div>
                </div>
              ))}

              <SectionHeader>💎 Спекуляции</SectionHeader>
              {s.speculations.length === 0 && (
                <div className="text-xs text-slate-500 py-2">Нет спекулятивных активов</div>
              )}
              {s.speculations.map((spec) => (
                <div key={spec.id}
                  className="flex items-center justify-between py-2 border-b border-white/5">
                  <div>
                    <div className="text-sm font-medium text-white">{spec.name}</div>
                    <div className="text-xs text-slate-400">
                      Куплено за {formatCurrency(spec.purchasePrice)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-3 rounded-lg p-2 text-right" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-xs text-slate-400">Итого активов</div>
                <div className="text-lg font-bold text-green-400">{formatCurrency(stats.totalAssets)}</div>
              </div>
            </motion.div>
          )}

          {tab === 'liabilities' && (
            <motion.div
              key="liabilities"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <SectionHeader>🏦 Долги</SectionHeader>
              <Row label="Ипотека дома" value={formatCurrency(s.homeMortgageBalance)} />
              <Row label="Автокредит (остаток)" value={formatCurrency(s.carLoanBalance)} />
              <Row label="Кредитная карта (лимит)" value={formatCurrency(s.creditCardBalance)} />
              <Row label="Учёбный кредит" value={formatCurrency(s.schoolLoanBalance)} />
              {s.realEstate.map((re) => re.mortgage > 0 && (
                <Row
                  key={`re-liab-${re.id}`}
                  label={`Ипотека: ${re.name}`}
                  value={formatCurrency(re.mortgage)}
                />
              ))}
              {s.businesses.map((b) => b.loan > 0 && (
                <Row
                  key={`biz-liab-${b.id}`}
                  label={`Кредит: ${b.name}`}
                  value={formatCurrency(b.loan)}
                />
              ))}

              <div className="mt-3 rounded-lg p-2 text-right" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-xs text-slate-400">Итого долгов</div>
                <div className="text-lg font-bold text-red-400">{formatCurrency(stats.totalLiabilities)}</div>
              </div>

              <div className="mt-2 rounded-lg p-2 text-right" style={{ background: 'rgba(99,102,241,0.05)' }}>
                <div className="text-xs text-slate-400">Чистый капитал</div>
                <div
                  className="text-xl font-bold"
                  style={{ color: stats.netWorth >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {formatCurrency(stats.netWorth)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
