import type { GameVariantModule } from '../types'
import { cashflow101ClassicData } from './data'
import { cashflow101ClassicMeta } from './meta'
import { createCashflow101ClassicStatement, createCashflow101ClassicVariantState } from './rules/startGame'

export const cashflow101ClassicVariant: GameVariantModule = {
  id: 'cashflow101_classic',
  title: cashflow101ClassicMeta.title,
  description: cashflow101ClassicMeta.description,
  shortLabel: cashflow101ClassicMeta.shortLabel,
  theme: cashflow101ClassicMeta.theme,
  ruleset: cashflow101ClassicMeta.ruleset,
  professions: [...cashflow101ClassicData.professions],
  decks: {
    smallDeals: [...cashflow101ClassicData.decks.smallDeals],
    bigDeals: [...cashflow101ClassicData.decks.bigDeals],
    doodads: [...cashflow101ClassicData.decks.doodads],
    marketCards: [...cashflow101ClassicData.decks.marketCards],
    surpriseCards: [],
  },
  board: cashflow101ClassicData.board,
  setup: {
    minPlayers: 1,
    maxPlayers: 6,
    allowOnline: true,
    allowTutorial: true,
    allowSaveLoad: true,
  },
  createInitialStatement: () => createCashflow101ClassicStatement(),
  createInitialVariantState: createCashflow101ClassicVariantState,
}
