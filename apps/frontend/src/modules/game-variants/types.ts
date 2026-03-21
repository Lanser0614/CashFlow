import type {
  BigDeal,
  BoardSpace,
  Doodad,
  FinancialStatement,
  GameVariant,
  MarketCard,
  Player,
  ProfessionCard,
  SmallDeal,
  SurpriseCard,
  VariantState,
} from '../../types'

export interface VariantLegendItem {
  color: string
  icon: string
  label: string
}

export interface VariantSetupConfig {
  minPlayers: number
  maxPlayers: number
  allowOnline: boolean
  allowTutorial: boolean
  allowSaveLoad: boolean
}

export interface VariantDeckSet {
  smallDeals: SmallDeal[]
  bigDeals: BigDeal[]
  doodads: Doodad[]
  marketCards: MarketCard[]
  surpriseCards: SurpriseCard[]
}

export interface VariantBoardConfig {
  ratRaceSpaces: readonly BoardSpace[]
  ratRaceSize: number
  fastTrackSpaces: readonly BoardSpace[]
  fastTrackSize: number
  legendItems: readonly VariantLegendItem[]
  centerLabel: string
  centerIcon: string
}

export interface VariantStartGameContext {
  playerId: string
  profession: ProfessionCard
  color: string
}

export interface VariantActionResult {
  state: VariantState
}

export interface GameVariantModule {
  id: GameVariant
  title: string
  description: string
  shortLabel: string
  theme: 'classic' | 'quick' | 'advanced'
  ruleset: 'classic' | 'quick' | 'advanced'
  professions: ProfessionCard[]
  decks: VariantDeckSet
  board: VariantBoardConfig
  setup: VariantSetupConfig
  createInitialStatement: (ctx: VariantStartGameContext) => Pick<
    FinancialStatement,
    'realEstate' | 'businesses' | 'stocks' | 'speculations' | 'options' | 'shortPositions' | 'straddles' | 'exchangeOpportunities'
  >
  createInitialVariantState: (players: Player[]) => VariantState
}
