import { isApplyingServerState, useGameStore } from './gameStore'
import { useRoomStore } from './roomStore'
import type { TurnPhase } from '../types'

// Phases where state is "settled" and should be synced to server
const SYNCABLE_PHASES: TurnPhase[] = ['roll', 'card_shown', 'market_sell', 'end_turn']

/**
 * Subscribe to gameStore changes and auto-push to server when:
 * 1. It's my turn
 * 2. The turnPhase transitions to a "settled" phase
 * 3. Or the game phase changes to 'won'
 *
 * Returns an unsubscribe function.
 */
export function startOnlineSync(): () => void {
  return useGameStore.subscribe((state, prevState) => {
    if (isApplyingServerState()) return

    const room = useRoomStore.getState()
    if (room.screen !== 'game_online' || !room.room) return

    // Only push if it was my turn (use prevState because endTurn changes currentPlayerIndex)
    const myIndex = room.getMyPlayerIndex()
    if (myIndex === null) return
    const wasMyTurn = prevState.currentPlayerIndex === myIndex
    if (!wasMyTurn) return

    // Sync when turnPhase transitions to a settled phase
    const phaseChanged = state.turnPhase !== prevState.turnPhase
    if (phaseChanged && SYNCABLE_PHASES.includes(state.turnPhase)) {
      room.pushStateToServer()
    }

    // Also sync when game is won
    if (state.phase === 'won' && prevState.phase !== 'won') {
      room.pushStateToServer()
    }
  })
}
