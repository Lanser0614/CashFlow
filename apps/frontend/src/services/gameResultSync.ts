import { gameApi } from './api'
import { buildGameResultPayload, isSyncableGameState } from './gameResultPayload'
import { useAuthStore } from '../store/authStore'
import { useGameStore } from '../store/gameStore'

const STORAGE_KEY = 'cashflow_active_result_session'

let initialized = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let lastSignature: string | null = null
let inFlightSignature: string | null = null

function getSessionKey(): string {
  let sessionKey = localStorage.getItem(STORAGE_KEY)
  if (!sessionKey) {
    sessionKey = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, sessionKey)
  }
  return sessionKey
}

function clearSessionKey(): void {
  localStorage.removeItem(STORAGE_KEY)
  lastSignature = null
  inFlightSignature = null
}

async function syncCurrentState(force = false): Promise<void> {
  const authState = useAuthStore.getState()
  if (!authState.isAuthenticated) {
    return
  }

  const gameState = useGameStore.getState()
  if (!isSyncableGameState(gameState)) {
    if (gameState.phase === 'mode_select' || gameState.phase === 'setup') {
      clearSessionKey()
    }
    return
  }

  const payload = buildGameResultPayload(gameState, getSessionKey(), gameState.phase === 'won')
  if (!payload) {
    return
  }

  const signature = JSON.stringify(payload)
  if (!force && (signature === lastSignature || signature === inFlightSignature)) {
    return
  }

  inFlightSignature = signature
  try {
    await gameApi.syncResult(payload)
    lastSignature = signature
    if (payload.is_completed) {
      clearSessionKey()
    }
  } catch (error) {
    console.error('Failed to sync game journal:', error)
  } finally {
    if (inFlightSignature === signature) {
      inFlightSignature = null
    }
  }
}

export function initializeGameResultSync(): void {
  if (initialized) {
    return
  }

  initialized = true

  useGameStore.subscribe((state) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!isSyncableGameState(state)) {
      if (state.phase === 'mode_select' || state.phase === 'setup') {
        clearSessionKey()
      }
      return
    }

    debounceTimer = setTimeout(() => {
      void syncCurrentState()
    }, 500)
  })
}

export async function flushGameResultSync(): Promise<void> {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  await syncCurrentState(true)
}
