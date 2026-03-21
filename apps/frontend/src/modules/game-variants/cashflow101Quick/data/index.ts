import {
  QUICK_BOARD_SIZE,
  QUICK_BOARD_SPACES,
  QUICK_DEALS,
  QUICK_DOODADS,
  QUICK_MARKETS,
  QUICK_PROFESSIONS,
  QUICK_SURPRISES,
} from '../../../../data/quickMode'

export const cashflow101QuickData = {
  professions: QUICK_PROFESSIONS,
  decks: {
    smallDeals: QUICK_DEALS,
    bigDeals: [],
    doodads: QUICK_DOODADS,
    marketCards: QUICK_MARKETS,
    surpriseCards: QUICK_SURPRISES,
  },
  board: {
    ratRaceSpaces: QUICK_BOARD_SPACES,
    ratRaceSize: QUICK_BOARD_SIZE,
    fastTrackSpaces: [],
    fastTrackSize: 0,
    legendItems: [
      { color: '#166534', icon: '💰', label: 'Зарплата' },
      { color: '#1e40af', icon: '🤝', label: 'Сделка' },
      { color: '#7f1d1d', icon: '💸', label: 'Расход' },
      { color: '#78350f', icon: '📈', label: 'Рынок' },
      { color: '#4c1d95', icon: '🎁', label: 'Сюрприз' },
    ],
    centerLabel: 'БЫСТРАЯ ИГРА',
    centerIcon: '⚡',
  },
} as const
