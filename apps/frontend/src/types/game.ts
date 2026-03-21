import type { AnyCard } from './cards'
import type { ExchangeOpportunity } from './player'
import type { Player } from './player'

export type GamePhase = 'mode_select' | 'profile' | 'setup' | 'playing' | 'won'

export type GameVariant = 'cashflow101_classic' | 'cashflow101_quick' | 'cashflow202'
export type GameMode = GameVariant

export type TurnPhase =
  | 'roll'          // waiting for dice roll
  | 'moving'        // pawn animation in progress
  | 'resolving'     // processing space landing
  | 'card_shown'    // card modal is open (deal/doodad/market)
  | 'market_sell'   // player can choose to sell assets after market card
  | 'end_turn'      // ready to pass to next player

export interface LogEntry {
  id: number
  playerName: string
  playerColor: string
  message: string
  timestamp: number
}

export interface SetupPlayer {
  name: string
  professionId: string
  customFinancialProfile?: CustomFinancialProfile
}

export interface CustomFinancialProfile {
  startingCash: number
  salary: number
  taxes: number
  mortgage: number
  carLoan: number
  creditCard: number
  schoolLoan: number
  otherExpenses: number
  childExpenses: number
  homeMortgageBalance: number
  carLoanBalance: number
  creditCardBalance: number
  schoolLoanBalance: number
}

export interface Cashflow202VariantState {
  realizedGainsByPlayer: Record<string, number>
  marginReservedCashByPlayer: Record<string, number>
  exchangeOffers: ExchangeOpportunity[]
  startingPortfolioGranted: boolean
}

export interface VariantState {
  cashflow202: Cashflow202VariantState
}

export interface GameState {
  phase: GamePhase
  gameMode: GameMode
  players: Player[]
  currentPlayerIndex: number
  turnPhase: TurnPhase
  diceValues: number[]
  activeCard: AnyCard | null
  pendingMarketCard: AnyCard | null  // market card awaiting sell decision
  log: LogEntry[]
  winner: Player | null
  // Deck indices (we shuffle once at game start)
  smallDeckIndex: number
  bigDeckIndex: number
  doodadDeckIndex: number
  marketDeckIndex: number
  smallDeck: string[]    // shuffled card ids
  bigDeck: string[]
  doodadDeck: string[]
  marketDeck: string[]
  turnNumber: number
  // Quick mode specific
  surpriseDeck: string[]
  surpriseDeckIndex: number
  extraTurnFlag: boolean   // for surprise "extra turn" effect
  variantState: VariantState
}
