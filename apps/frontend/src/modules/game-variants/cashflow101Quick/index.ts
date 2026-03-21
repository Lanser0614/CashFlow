import type { GameVariantModule } from '../types'
import { cashflow101QuickData } from './data'
import { cashflow101QuickMeta } from './meta'
import { createCashflow101QuickStatement, createCashflow101QuickVariantState } from './rules/startGame'

export const cashflow101QuickVariant: GameVariantModule = {
  id: 'cashflow101_quick',
  title: cashflow101QuickMeta.title,
  description: cashflow101QuickMeta.description,
  shortLabel: cashflow101QuickMeta.shortLabel,
  theme: cashflow101QuickMeta.theme,
  ruleset: cashflow101QuickMeta.ruleset,
  professions: [...cashflow101QuickData.professions],
  decks: {
    smallDeals: [...cashflow101QuickData.decks.smallDeals],
    bigDeals: [],
    doodads: [...cashflow101QuickData.decks.doodads],
    marketCards: [...cashflow101QuickData.decks.marketCards],
    surpriseCards: [...cashflow101QuickData.decks.surpriseCards],
  },
  board: cashflow101QuickData.board,
  setup: {
    minPlayers: 1,
    maxPlayers: 6,
    allowOnline: true,
    allowTutorial: false,
    allowSaveLoad: false,
  },
  createInitialStatement: () => createCashflow101QuickStatement(),
  createInitialVariantState: createCashflow101QuickVariantState,
}
