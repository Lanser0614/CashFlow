import { useAuthStore } from '../store/authStore'
import { useRoomStore } from '../store/roomStore'
import { computePlayerStats } from '../utils/playerStats'
import type { CreateResultPayload } from './api'
import type { GameState, Player, VariantState } from '../types'

function getLeader(players: Player[], variantState: VariantState): Player {
  return [...players].sort((left, right) => {
    const leftStats = computePlayerStats(left, variantState)
    const rightStats = computePlayerStats(right, variantState)

    if (rightStats.passiveIncome !== leftStats.passiveIncome) {
      return rightStats.passiveIncome - leftStats.passiveIncome
    }

    if (rightStats.netWorth !== leftStats.netWorth) {
      return rightStats.netWorth - leftStats.netWorth
    }

    return right.cash - left.cash
  })[0]
}

export function buildGameResultPayload(
  state: GameState,
  sessionKey: string,
  isCompleted: boolean,
): CreateResultPayload | null {
  if (state.players.length === 0) {
    return null
  }

  const authUser = useAuthStore.getState().user
  const roomPlayer = useRoomStore.getState().getMyPlayer()
  const perspectivePlayer = state.players.find((player) => player.name === roomPlayer?.player_name)
    ?? state.players.find((player) => player.name === authUser?.name)
    ?? state.players[state.currentPlayerIndex]

  if (!perspectivePlayer) {
    return null
  }

  const winner = state.winner ?? getLeader(state.players, state.variantState)
  const perspectiveStats = computePlayerStats(perspectivePlayer, state.variantState)
  const winnerStats = computePlayerStats(winner, state.variantState)

  return {
    session_key: sessionKey,
    game_mode: state.gameMode,
    winner_name: winner.name,
    player_name: perspectivePlayer.name,
    winner_profession: winner.professionName,
    player_profession: perspectivePlayer.professionName,
    winner_cash: winner.cash,
    player_cash: perspectivePlayer.cash,
    winner_passive_income: winnerStats.passiveIncome,
    player_passive_income: perspectiveStats.passiveIncome,
    winner_net_worth: winnerStats.netWorth,
    player_net_worth: perspectiveStats.netWorth,
    player_count: state.players.length,
    did_win: isCompleted && perspectivePlayer.id === winner.id,
    is_completed: isCompleted,
    player_summaries: state.players.map((player) => {
      const stats = computePlayerStats(player, state.variantState)
      return {
        name: player.name,
        profession: player.professionName,
        cash: player.cash,
        passiveIncome: stats.passiveIncome,
        track: player.track,
      }
    }),
    journal: [...state.log].reverse(),
    total_turns: state.turnNumber,
  }
}

export function isSyncableGameState(state: GameState): boolean {
  return (state.phase === 'playing' || state.phase === 'won') && state.players.length > 0
}
