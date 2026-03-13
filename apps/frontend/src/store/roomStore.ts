import { create } from 'zustand'
import { roomApi, type RoomInfo, type RoomPlayerInfo } from '../services/api'
import { useGameStore } from './gameStore'
import { useAuthStore } from './authStore'
import { useStreamStore } from './streamStore'
import type { GameState, SetupPlayer } from '../types'

export type RoomScreen = 'none' | 'lobby' | 'waiting' | 'game_online'

const ROOM_CODE_KEY = 'cashflow_room_code'

function saveRoomCode(code: string) {
  localStorage.setItem(ROOM_CODE_KEY, code)
}
function clearRoomCode() {
  localStorage.removeItem(ROOM_CODE_KEY)
}

interface RoomState {
  // Room data
  room: RoomInfo | null
  screen: RoomScreen
  stateVersion: number
  error: string | null

  // Derived helpers
  getIsHost: () => boolean
  getMyPlayer: () => RoomPlayerInfo | null
  getMyPlayerIndex: () => number | null
  isMyTurn: () => boolean

  // Actions
  setScreen: (screen: RoomScreen) => void
  createRoom: (maxPlayers: number) => Promise<void>
  joinRoom: (code: string) => Promise<void>
  leaveRoom: () => Promise<void>
  updateMyPlayer: (data: { player_name?: string; profession_id?: string }) => Promise<void>
  toggleReady: () => Promise<void>
  startOnlineGame: () => Promise<void>
  refreshRoom: () => Promise<void>
  restoreSession: () => Promise<void>

  // Polling
  startPollingRoom: () => void
  stopPollingRoom: () => void
  startPollingState: () => void
  stopPollingState: () => void

  // Sync
  pushStateToServer: () => Promise<void>

  // Reset
  resetRoom: () => void
  clearError: () => void
}

let roomPollTimer: ReturnType<typeof setInterval> | null = null
let statePollTimer: ReturnType<typeof setInterval> | null = null
let statePushInFlight = false
let statePushQueued = false

export const useRoomStore = create<RoomState>()((set, get) => ({
  room: null,
  screen: 'none',
  stateVersion: 0,
  error: null,

  getIsHost: () => {
    const { room } = get()
    const userId = useAuthStore.getState().user?.id
    return room?.host_user_id === userId
  },

  getMyPlayer: () => {
    const { room } = get()
    const userId = useAuthStore.getState().user?.id
    if (!room || !userId) return null
    return room.players.find((p) => p.user_id === userId) ?? null
  },

  getMyPlayerIndex: () => {
    const player = get().getMyPlayer()
    return player?.player_index ?? null
  },

  isMyTurn: () => {
    const myIndex = get().getMyPlayerIndex()
    if (myIndex === null) return false
    const currentPlayerIndex = useGameStore.getState().currentPlayerIndex
    return currentPlayerIndex === myIndex
  },

  setScreen: (screen) => set({ screen, error: null }),

  createRoom: async (maxPlayers) => {
    set({ error: null })
    try {
      const room = await roomApi.create(maxPlayers)
      set({ room, screen: 'waiting' })
      saveRoomCode(room.code)
    } catch (err: any) {
      set({ error: err.message || 'Failed to create room' })
    }
  },

  joinRoom: async (code) => {
    set({ error: null })
    try {
      const room = await roomApi.join(code.toUpperCase())
      set({ room, screen: 'waiting' })
      saveRoomCode(room.code)
    } catch (err: any) {
      set({ error: err.message || 'Failed to join room' })
    }
  },

  leaveRoom: async () => {
    const { room } = get()
    if (!room) return
    get().stopPollingRoom()
    get().stopPollingState()
    useStreamStore.getState().cleanup()
    try {
      await roomApi.leave(room.code)
    } catch {
      // ignore
    }
    set({ room: null, screen: 'none', stateVersion: 0 })
    clearRoomCode()
  },

  updateMyPlayer: async (data) => {
    const { room } = get()
    if (!room) return
    try {
      const updated = await roomApi.updatePlayer(room.code, data)
      set({ room: updated })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  toggleReady: async () => {
    const { room } = get()
    if (!room) return
    try {
      const updated = await roomApi.toggleReady(room.code)
      set({ room: updated })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  startOnlineGame: async () => {
    const { room } = get()
    if (!room) return
    set({ error: null })
    try {
      await roomApi.startGame(room.code)

      // Build players array from room players
      const roomPlayers = room.players
      const setupPlayers: SetupPlayer[] = roomPlayers.map((p) => ({
        name: p.player_name,
        professionId: p.profession_id,
      }))

      // Initialize game on this client (host)
      useGameStore.getState().startGame(setupPlayers)

      // Upload initial state to server
      set({ stateVersion: 0, screen: 'game_online' })
      saveRoomCode(room.code)

      // Small delay so gameStore finishes initialization
      await new Promise((r) => setTimeout(r, 100))
      await get().pushStateToServer()

      // Start polling for other players
      get().startPollingState()
    } catch (err: any) {
      set({ error: err.message || 'Failed to start game' })
    }
  },

  refreshRoom: async () => {
    const { room } = get()
    if (!room) return
    try {
      const updated = await roomApi.show(room.code)
      set({ room: updated })

      // If room status changed to 'playing', transition to game
      if (updated.status === 'playing' && get().screen === 'waiting') {
        set({ screen: 'game_online', stateVersion: 0 })
        saveRoomCode(updated.code)
        get().stopPollingRoom()
        get().startPollingState()
      }
    } catch {
      // Room might have been deleted
    }
  },

  startPollingRoom: () => {
    get().stopPollingRoom()
    roomPollTimer = setInterval(() => {
      get().refreshRoom()
    }, 2000)
  },

  stopPollingRoom: () => {
    if (roomPollTimer) {
      clearInterval(roomPollTimer)
      roomPollTimer = null
    }
  },

  startPollingState: () => {
    get().stopPollingState()
    statePollTimer = setInterval(async () => {
      const { room, stateVersion } = get()
      if (!room) return
      try {
        const data = await roomApi.getState(room.code, stateVersion)
        if (data) {
          // Don't override if it's my turn and I'm in the middle of an action
          const myIndex = get().getMyPlayerIndex()
          const currentState = useGameStore.getState()
          const isMyAction = currentState.currentPlayerIndex === myIndex &&
            (currentState.turnPhase === 'moving' || currentState.turnPhase === 'resolving')

          if (!isMyAction) {
            useGameStore.getState().syncFromServer(data.game_state as unknown as GameState)
          }
          set({ stateVersion: data.state_version })

          if (data.status === 'finished') {
            get().stopPollingState()
          }
        }
      } catch {
        // Silently retry on next poll
      }
    }, 2000)
  },

  stopPollingState: () => {
    if (statePollTimer) {
      clearInterval(statePollTimer)
      statePollTimer = null
    }
  },

  pushStateToServer: async () => {
    const { room, stateVersion } = get()
    if (!room) return

    if (statePushInFlight) {
      statePushQueued = true
      return
    }

    const state = useGameStore.getState()
    const serializable: Record<string, unknown> = {
      phase: state.phase,
      players: state.players,
      currentPlayerIndex: state.currentPlayerIndex,
      turnPhase: state.turnPhase,
      diceValues: state.diceValues,
      activeCard: state.activeCard,
      pendingMarketCard: state.pendingMarketCard,
      log: state.log,
      winner: state.winner,
      smallDeckIndex: state.smallDeckIndex,
      bigDeckIndex: state.bigDeckIndex,
      doodadDeckIndex: state.doodadDeckIndex,
      marketDeckIndex: state.marketDeckIndex,
      smallDeck: state.smallDeck,
      bigDeck: state.bigDeck,
      doodadDeck: state.doodadDeck,
      marketDeck: state.marketDeck,
      turnNumber: state.turnNumber,
    }

    statePushInFlight = true

    try {
      const newVersion = stateVersion + 1
      await roomApi.submitAction(room.code, serializable, newVersion)
      set({ stateVersion: newVersion })
    } catch (err: any) {
      console.error('Failed to push state:', err.message)
      // On turn/version drift, refresh from server and continue from canonical state.
      if (
        err.message?.includes('409') ||
        err.message?.includes('conflict') ||
        err.message?.includes('403') ||
        err.message?.toLowerCase?.().includes('not your turn')
      ) {
        const data = await roomApi.getState(room.code, 0)
        if (data) {
          useGameStore.getState().syncFromServer(data.game_state as unknown as GameState)
          set({ stateVersion: data.state_version })
        }
      }
    } finally {
      statePushInFlight = false

      if (statePushQueued) {
        statePushQueued = false
        void get().pushStateToServer()
      }
    }
  },

  restoreSession: async () => {
    const code = localStorage.getItem(ROOM_CODE_KEY)
    if (!code) return

    try {
      const room = await roomApi.show(code)

      if (room.status === 'playing') {
        set({ room, screen: 'game_online', stateVersion: 0 })
        get().startPollingState()
      } else if (room.status === 'waiting') {
        set({ room, screen: 'waiting' })
        get().startPollingRoom()
      } else {
        // finished or unknown
        clearRoomCode()
      }
    } catch {
      // Room not found or expired
      clearRoomCode()
    }
  },

  resetRoom: () => {
    get().stopPollingRoom()
    get().stopPollingState()
    set({ room: null, screen: 'none', stateVersion: 0, error: null })
    clearRoomCode()
  },

  clearError: () => set({ error: null }),
}))
