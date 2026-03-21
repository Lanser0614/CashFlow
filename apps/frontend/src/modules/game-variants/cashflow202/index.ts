import type { GameVariantModule } from '../types'
import { cashflow202Data } from './data'
import { cashflow202Meta } from './meta'
import { createCashflow202Statement, createCashflow202VariantState } from './rules/startGame'

export const cashflow202Variant: GameVariantModule = {
  id: 'cashflow202',
  title: cashflow202Meta.title,
  description: cashflow202Meta.description,
  shortLabel: cashflow202Meta.shortLabel,
  theme: cashflow202Meta.theme,
  ruleset: cashflow202Meta.ruleset,
  professions: [...cashflow202Data.professions],
  decks: {
    smallDeals: [...cashflow202Data.decks.smallDeals],
    bigDeals: [...cashflow202Data.decks.bigDeals],
    doodads: [...cashflow202Data.decks.doodads],
    marketCards: [...cashflow202Data.decks.marketCards],
    surpriseCards: [],
  },
  board: cashflow202Data.board,
  setup: {
    minPlayers: 1,
    maxPlayers: 6,
    allowOnline: true,
    allowTutorial: false,
    allowSaveLoad: true,
  },
  createInitialStatement: ({ profession }) => createCashflow202Statement(profession.id),
  createInitialVariantState: createCashflow202VariantState,
}
