import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { formatCurrency } from '../../utils'
import type { SmallDeal, BigDeal, Doodad, MarketCard } from '../../types'

function DealCardContent({ deal, player, onBuy, onPass }: {
  deal: SmallDeal | BigDeal
  player: ReturnType<typeof useGameStore.getState>['players'][0]
  onBuy: (lots: number) => void
  onPass: () => void
}) {
  const [lots, setLots] = useState(1)
  const isStock = deal.type === 'small_deal' && deal.category === 'stock'
  const maxLots = isStock ? Math.floor(player.cash / deal.cost) : 1
  const totalCost = deal.cost * lots
  const canAfford = player.cash >= totalCost

  const categoryLabel: Record<string, string> = {
    stock: '📊 Акции',
    real_estate: '🏠 Недвижимость',
    business: '🏪 Бизнес',
    other: '💎 Спекуляция',
  }

  const isBig = deal.type === 'big_deal'

  return (
    <div>
      {/* Card type badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            background: isBig ? 'rgba(29, 78, 216, 0.3)' : 'rgba(37, 99, 235, 0.2)',
            color: isBig ? '#93c5fd' : '#7dd3fc',
            border: `1px solid ${isBig ? 'rgba(29,78,216,0.5)' : 'rgba(37,99,235,0.4)'}`,
          }}
        >
          {isBig ? '🏢 КРУПНАЯ СДЕЛКА' : '📋 МЕЛКАЯ СДЕЛКА'}
        </span>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
        >
          {categoryLabel[deal.category]}
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{deal.description}</p>

      {/* Financial details */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="text-xs text-red-400 font-semibold">Цена / Взнос</div>
          <div className="text-white font-bold">{formatCurrency(deal.cost * lots)}</div>
        </div>
        {deal.cashflow !== undefined && deal.cashflow > 0 && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <div className="text-xs text-green-400 font-semibold">Денежный поток/мес</div>
            <div className="text-white font-bold">+{formatCurrency(deal.cashflow)}</div>
          </div>
        )}
        {deal.liability !== undefined && deal.liability > 0 && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(148, 163, 184, 0.1)' }}>
            <div className="text-xs text-slate-400 font-semibold">Кредит / Ипотека</div>
            <div className="text-white font-bold">{formatCurrency(deal.liability)}</div>
          </div>
        )}
        {isStock && (
          <div className="rounded-lg p-3" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <div className="text-xs text-indigo-400 font-semibold">Цена за акцию</div>
            <div className="text-white font-bold">{formatCurrency((deal as SmallDeal).pricePerShare ?? 1)}</div>
          </div>
        )}
      </div>

      {/* Lots selector for stocks */}
      {isStock && maxLots > 1 && (
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-2">
            Количество лотов (1 лот = {(deal as SmallDeal).sharesPerLot ?? 100} акций):
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-ghost px-3 py-1 text-lg"
              onClick={() => setLots(Math.max(1, lots - 1))}
            >−</button>
            <span className="text-2xl font-bold w-8 text-center">{lots}</span>
            <button
              className="btn-ghost px-3 py-1 text-lg"
              onClick={() => setLots(Math.min(maxLots, lots + 1))}
            >+</button>
            <span className="text-sm text-slate-400">
              = {((deal as SmallDeal).sharesPerLot ?? 100) * lots} акций
            </span>
          </div>
          <div className="text-sm mt-2" style={{ color: canAfford ? '#22c55e' : '#ef4444' }}>
            Итого: {formatCurrency(totalCost)} {canAfford ? '✓' : '(не хватает средств)'}
          </div>
        </div>
      )}

      {/* Player cash */}
      <div className="flex items-center justify-between text-sm mb-5 px-1">
        <span className="text-slate-400">Ваш кэш:</span>
        <span className="font-bold" style={{ color: canAfford ? '#22c55e' : '#ef4444' }}>
          {formatCurrency(player.cash)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          className="btn-success flex-1 disabled:opacity-40"
          onClick={() => canAfford && onBuy(lots)}
          disabled={!canAfford}
        >
          ✅ Купить
        </button>
        <button className="btn-ghost flex-1" onClick={onPass}>
          ❌ Отказаться
        </button>
      </div>
    </div>
  )
}

function DoodadCardContent({ card, player, onClose }: {
  card: Doodad
  player: ReturnType<typeof useGameStore.getState>['players'][0]
  onClose: () => void
}) {
  const amount = card.effect === 'per_child'
    ? card.amount * player.babies
    : card.amount

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            background: 'rgba(220, 38, 38, 0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(220,38,38,0.4)',
          }}
        >
          💸 ДУДАД
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{card.description}</p>

      <div className="rounded-xl p-4 mb-5 text-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {amount > 0 ? (
          <>
            <div className="text-sm text-red-400 mb-1">Вы теряете</div>
            <div className="text-3xl font-bold text-red-400">−{formatCurrency(amount)}</div>
            {card.effect === 'per_child' && player.babies > 0 && (
              <div className="text-xs text-slate-400 mt-1">
                ({formatCurrency(card.amount)} × {player.babies} детей)
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-sm text-orange-400 mb-1">Ежемесячные расходы вырастут</div>
            <div className="text-2xl font-bold text-orange-400">+{formatCurrency(card.addLiability ?? 0)}/мес</div>
          </>
        )}
        {card.addLiability && card.addLiability > 0 && amount > 0 && (
          <div className="text-xs text-orange-400 mt-1">
            + расходы вырастут на {formatCurrency(card.addLiability)}/мес
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm mb-5 px-1">
        <span className="text-slate-400">Ваш кэш после:</span>
        <span className="font-bold" style={{ color: '#ef4444' }}>
          {formatCurrency(Math.max(0, player.cash - amount))}
        </span>
      </div>

      <button className="btn-danger w-full" onClick={onClose}>
        😰 Принять и продолжить
      </button>
    </div>
  )
}

function MarketCardContent({ card, player, onSell, onPass }: {
  card: MarketCard
  player: ReturnType<typeof useGameStore.getState>['players'][0]
  onSell: (assetId: string, assetType: 'stock' | 'real_estate' | 'business' | 'speculation', price: number) => void
  onPass: () => void
}) {
  const effect = card.effect

  // Find sellable assets
  const sellableAssets: Array<{
    id: string
    name: string
    type: 'stock' | 'real_estate' | 'business' | 'speculation'
    sellPrice: number
    profit: number
  }> = []

  if (effect.kind === 'stock_price' && effect.price > 0) {
    const stock = player.statement.stocks.find((s) => s.symbol === effect.symbol)
    if (stock) {
      const sellPrice = stock.shares * effect.price
      sellableAssets.push({
        id: stock.symbol,
        name: `${stock.symbol} (${stock.shares} акций)`,
        type: 'stock',
        sellPrice,
        profit: sellPrice - stock.shares * stock.purchasePrice,
      })
    }
  } else if (effect.kind === 'sell_speculation') {
    player.statement.speculations
      .filter((s) => s.tag === effect.tag)
      .forEach((spec) => {
        const sellPrice = Math.round(spec.purchasePrice * effect.multiplier)
        sellableAssets.push({
          id: spec.id,
          name: spec.name,
          type: 'speculation',
          sellPrice,
          profit: sellPrice - spec.purchasePrice,
        })
      })
  } else if (effect.kind === 'real_estate_boom') {
    player.statement.realEstate
      .filter((re) => !effect.propertyTag || re.propertyTag === effect.propertyTag)
      .forEach((re) => {
        const sellPrice = Math.round(re.purchasePrice * effect.multiplier)
        sellableAssets.push({
          id: re.id,
          name: re.name,
          type: 'real_estate',
          sellPrice,
          profit: sellPrice - re.mortgage,
        })
      })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            background: 'rgba(217, 119, 6, 0.2)',
            color: '#fcd34d',
            border: '1px solid rgba(217,119,6,0.4)',
          }}
        >
          📈 РЫНОЧНОЕ СОБЫТИЕ
        </span>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{card.description}</p>

      {sellableAssets.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-white mb-2">Продать можно:</div>
          <div className="space-y-2">
            {sellableAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div>
                  <div className="text-sm font-medium text-white">{asset.name}</div>
                  <div className="text-xs text-green-400">Продать за {formatCurrency(asset.sellPrice)}</div>
                  <div className="text-xs" style={{ color: asset.profit >= 0 ? '#22c55e' : '#ef4444' }}>
                    Прибыль: {asset.profit >= 0 ? '+' : ''}{formatCurrency(asset.profit)}
                  </div>
                </div>
                <button
                  className="btn-success px-3 py-1.5 text-sm"
                  onClick={() => onSell(asset.id, asset.type, asset.sellPrice)}
                >
                  Продать
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sellableAssets.length === 0 && (
        <div
          className="text-sm text-slate-400 text-center py-3 rounded-lg mb-4"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          У вас нет активов для продажи по этому событию
        </div>
      )}

      <button className="btn-ghost w-full" onClick={onPass}>
        Закрыть
      </button>
    </div>
  )
}

export function CardModal() {
  const players = useGameStore((s) => s.players)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const activeCard = useGameStore((s) => s.activeCard)
  const pendingMarketCard = useGameStore((s) => s.pendingMarketCard)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const buyDeal = useGameStore((s) => s.buyDeal)
  const passDeal = useGameStore((s) => s.passDeal)
  const closeDoodad = useGameStore((s) => s.closeDoodad)
  const sellAsset = useGameStore((s) => s.sellAsset)
  const passMarket = useGameStore((s) => s.passMarket)

  const player = players[currentPlayerIndex]
  const visible = turnPhase === 'card_shown' || turnPhase === 'market_sell'
  const card = turnPhase === 'market_sell' ? pendingMarketCard : activeCard

  if (!visible || !card || !player) return null

  const TITLE_MAP: Record<string, string> = {
    small_deal: card.title,
    big_deal: card.title,
    doodad: card.title,
    market: card.title,
  }

  const ICON_MAP: Record<string, string> = {
    small_deal: '📋',
    big_deal: '🏢',
    doodad: '💸',
    market: '📈',
  }

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="game-card w-full max-w-md p-6"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* Card header */}
          <div className="flex items-center gap-3 mb-5 pb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-3xl">{ICON_MAP[card.type] ?? '🃏'}</span>
            <div>
              <div className="font-bold text-white text-lg leading-tight">{TITLE_MAP[card.type]}</div>
              <div className="text-xs text-slate-400">{player.name} — ход</div>
            </div>
          </div>

          {/* Card content */}
          {(card.type === 'small_deal' || card.type === 'big_deal') && (
            <DealCardContent
              deal={card as SmallDeal | BigDeal}
              player={player}
              onBuy={(lots) => buyDeal(card as SmallDeal | BigDeal, lots)}
              onPass={passDeal}
            />
          )}
          {card.type === 'doodad' && (
            <DoodadCardContent
              card={card as Doodad}
              player={player}
              onClose={closeDoodad}
            />
          )}
          {card.type === 'market' && (
            <MarketCardContent
              card={card as MarketCard}
              player={player}
              onSell={sellAsset}
              onPass={passMarket}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
