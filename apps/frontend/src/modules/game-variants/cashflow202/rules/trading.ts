import type { ExchangeOpportunity, MarketCard, OptionPosition, ShortPosition, StraddlePosition } from '../../../../types'

export function computeOptionSettlementValue(position: OptionPosition): number {
  const intrinsic = position.optionType === 'call'
    ? Math.max(position.currentPrice - position.strikePrice, 0)
    : Math.max(position.strikePrice - position.currentPrice, 0)
  return intrinsic * position.contractSize
}

export function computeShortSettlementValue(position: ShortPosition): number {
  return position.marginReservedCash + (position.salePrice - position.currentPrice) * position.shares
}

export function computeStraddleSettlementValue(position: StraddlePosition): number {
  const callLeg = Math.max(position.currentPrice - position.strikePrice, 0)
  const putLeg = Math.max(position.strikePrice - position.currentPrice, 0)
  return (callLeg + putLeg) * position.contractSize
}

export function computeExchangeSettlementValue(position: ExchangeOpportunity, marketCard: MarketCard): number {
  if (marketCard.effect.kind !== 'exchange_offer' || marketCard.effect.tag !== position.tag) {
    return position.purchasePrice
  }

  return Math.round(position.purchasePrice * marketCard.effect.multiplier)
}
