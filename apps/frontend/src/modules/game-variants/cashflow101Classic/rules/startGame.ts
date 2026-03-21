import type { Player, VariantState } from '../../../../types'

export function createCashflow101ClassicStatement() {
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

export function createCashflow101ClassicVariantState(players: Player[]): VariantState {
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
