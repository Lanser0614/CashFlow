import type { AnyCard } from './cards'
import type { Player } from './player'

export type GamePhase = 'setup' | 'playing' | 'won'

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
}

export interface GameState {
  phase: GamePhase
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
}
