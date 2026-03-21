import type { Player, VariantState } from '../../../../types'

export function createCashflow101QuickStatement() {
  return {
    realEstate: [],
    businesses: [],
    stocks: [],
    speculations: [],
    options: [],
    shortPositions: [],
    straddles: [],
    exchangeOpportunities: [],
  }
}

export function createCashflow101QuickVariantState(players: Player[]): VariantState {
  void players
  return {
    cashflow202: {
      realizedGainsByPlayer: {},
      marginReservedCashByPlayer: {},
      exchangeOffers: [],
      startingPortfolioGranted: false,
    },
  }
}
