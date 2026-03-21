import type {
  ExchangeOpportunity,
  OptionPosition,
  Player,
  ShortPosition,
  StockHolding,
  StraddlePosition,
  VariantState,
} from '../../../../types'
import { CASHFLOW_202_STARTING_PORTFOLIOS } from '../data'

function createId(prefix: string, index: number) {
  return `${prefix}_${index}_${Date.now()}`
}

export function createCashflow202Statement(professionId: string) {
  const starter = CASHFLOW_202_STARTING_PORTFOLIOS[professionId] ?? {}

  return {
    realEstate: [],
    businesses: [],
    stocks: (starter.stocks ?? []).map<StockHolding>((stock) => ({
      ...stock,
      name: stock.name ?? stock.symbol,
    })),
    speculations: [],
    options: (starter.options ?? []).map<OptionPosition>((option, index) => ({
      id: createId('option', index),
      ...option,
      name: option.name ?? `${option.symbol} ${option.optionType}`,
    })),
    shortPositions: (starter.shortPositions ?? []).map<ShortPosition>((position, index) => ({
      id: createId('short', index),
      ...position,
      name: position.name ?? `${position.symbol} short`,
    })),
    straddles: (starter.straddles ?? []).map<StraddlePosition>((position, index) => ({
      id: createId('straddle', index),
      ...position,
      name: position.name ?? `${position.symbol} straddle`,
    })),
    exchangeOpportunities: (starter.exchangeOpportunities ?? []).map<ExchangeOpportunity>((opportunity, index) => ({
      id: createId('exchange', index),
      ...opportunity,
      name: opportunity.name ?? opportunity.tag,
    })),
  }
}

export function createCashflow202VariantState(players: Player[]): VariantState {
  return {
    cashflow202: {
      realizedGainsByPlayer: Object.fromEntries(players.map((player) => [player.id, 0])),
      marginReservedCashByPlayer: Object.fromEntries(players.map((player) => [
        player.id,
        player.statement.shortPositions.reduce((sum, position) => sum + position.marginReservedCash, 0),
      ])),
      exchangeOffers: [],
      startingPortfolioGranted: true,
    },
  }
}
