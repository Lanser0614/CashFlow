import { BIG_DEALS } from '../../../../data/bigDeals'
import { RAT_RACE_SPACES, RAT_RACE_SIZE, FAST_TRACK_SPACES, FAST_TRACK_SIZE } from '../../../../data/board'
import { DOODADS } from '../../../../data/doodads'
import { MARKET_CARDS } from '../../../../data/marketCards'
import { PROFESSIONS } from '../../../../data/professions'
import { SMALL_DEALS } from '../../../../data/smallDeals'

export const cashflow101ClassicData = {
  professions: PROFESSIONS,
  decks: {
    smallDeals: SMALL_DEALS,
    bigDeals: BIG_DEALS,
    doodads: DOODADS,
    marketCards: MARKET_CARDS,
    surpriseCards: [],
  },
  board: {
    ratRaceSpaces: RAT_RACE_SPACES,
    ratRaceSize: RAT_RACE_SIZE,
    fastTrackSpaces: FAST_TRACK_SPACES,
    fastTrackSize: FAST_TRACK_SIZE,
    legendItems: [
      { color: '#166534', icon: '💰', label: 'Зарплата' },
      { color: '#1e40af', icon: '🤝', label: 'Сделка' },
      { color: '#7f1d1d', icon: '💸', label: 'Дудад' },
      { color: '#78350f', icon: '📈', label: 'Рынок' },
      { color: '#831843', icon: '👶', label: 'Ребёнок' },
      { color: '#4c1d95', icon: '🙏', label: 'Благотворит.' },
      { color: '#1e293b', icon: '📉', label: 'Даунсайз' },
    ],
    centerLabel: 'КРЫСИНЫЕ БЕГА',
    centerIcon: '💰',
  },
} as const
