import type { CustomFinancialProfile, GameVariant } from '../types'

const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('auth_token')
}

export { getToken }

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    clearToken()
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = err.message || (err.errors ? Object.values(err.errors).flat().join(', ') : `HTTP ${res.status}`)
    throw new Error(message)
  }

  return res.json()
}

// Types
export interface AuthUser {
  id: number
  name: string
  username: string
}

export interface GameSaveListItem {
  id: number
  game_mode: GameVariant
  name: string
  player_count: number
  current_player_name: string
  turn_number: number
  created_at: string
  updated_at: string
}

export interface GameSaveDetail extends GameSaveListItem {
  game_state: Record<string, unknown>
}

export interface CreateSavePayload {
  game_mode: GameVariant
  name: string
  game_state: Record<string, unknown>
  player_count: number
  current_player_name: string
  turn_number?: number
}

export interface GameResultItem {
  id: number
  session_key: string | null
  game_mode: GameVariant
  winner_name: string
  player_name: string | null
  winner_profession: string
  player_profession: string | null
  winner_cash: number
  player_cash: number
  winner_passive_income: number
  player_passive_income: number
  winner_net_worth: number
  player_net_worth: number
  player_count: number
  did_win: boolean
  is_completed: boolean
  player_summaries: Array<{
    name: string
    profession: string
    cash: number
    passiveIncome: number
    track: string
  }>
  journal: Array<{
    id: number
    playerName: string
    playerColor: string
    message: string
    timestamp: number
  }>
  total_turns: number
  created_at: string
}

export interface CreateResultPayload {
  session_key: string
  game_mode: GameVariant
  winner_name: string
  player_name?: string
  winner_profession: string
  player_profession?: string
  winner_cash: number
  player_cash: number
  winner_passive_income: number
  player_passive_income: number
  winner_net_worth: number
  player_net_worth: number
  player_count: number
  did_win: boolean
  is_completed: boolean
  player_summaries: Array<{
    name: string
    profession: string
    cash: number
    passiveIncome: number
    track: string
  }>
  journal: Array<{
    id: number
    playerName: string
    playerColor: string
    message: string
    timestamp: number
  }>
  total_turns: number
}

// Auth API
export const authApi = {
  register: (data: { name: string; username: string; password: string; password_confirmation: string }) =>
    request<{ user: AuthUser; token: string }>('POST', '/register', data),

  login: (data: { username: string; password: string }) =>
    request<{ user: AuthUser; token: string }>('POST', '/login', data),

  getUser: () => request<{ user: AuthUser }>('GET', '/user'),

  logout: () => request<{ message: string }>('POST', '/logout'),
}

// Game API
export const gameApi = {
  listSaves: () => request<GameSaveListItem[]>('GET', '/games'),

  getSave: (id: number) => request<GameSaveDetail>('GET', `/games/${id}`),

  createSave: (data: CreateSavePayload) => request<GameSaveDetail>('POST', '/games', data),

  updateSave: (id: number, data: CreateSavePayload) => request<GameSaveDetail>('PUT', `/games/${id}`, data),

  deleteSave: (id: number) => request<{ message: string }>('DELETE', `/games/${id}`),

  listResults: () => request<GameResultItem[]>('GET', '/results'),

  storeResult: (data: CreateResultPayload) => request<GameResultItem>('POST', '/results', data),

  syncResult: (data: CreateResultPayload) => request<GameResultItem>('POST', '/results/sync', data),
}

// Room types
export interface RoomPlayerInfo {
  id: number
  user_id: number
  player_index: number
  player_name: string
  profession_id: string
  custom_financial_profile: CustomFinancialProfile | null
  color: string
  is_ready: boolean
}

export interface RoomInfo {
  id: number
  code: string
  game_mode: GameVariant
  host_user_id: number
  status: 'waiting' | 'playing' | 'finished'
  max_players: number
  state_version: number
  players: RoomPlayerInfo[]
}

export interface RoomStateResponse {
  game_state: Record<string, unknown>
  state_version: number
  status: string
}

// Room API
export const roomApi = {
  create: (maxPlayers: number, gameMode: GameVariant) =>
    request<RoomInfo>('POST', '/rooms', { max_players: maxPlayers, game_mode: gameMode }),

  show: (code: string) =>
    request<RoomInfo>('GET', `/rooms/${code}`),

  join: (code: string) =>
    request<RoomInfo>('POST', `/rooms/${code}/join`),

  leave: (code: string) =>
    request<{ message: string }>('POST', `/rooms/${code}/leave`),

  updateSettings: (code: string, data: { game_mode: GameVariant }) =>
    request<RoomInfo>('PATCH', `/rooms/${code}/settings`, data),

  updatePlayer: (code: string, data: {
    player_name?: string
    profession_id?: string
    custom_financial_profile?: CustomFinancialProfile
  }) =>
    request<RoomInfo>('PATCH', `/rooms/${code}/player`, data),

  toggleReady: (code: string) =>
    request<RoomInfo>('POST', `/rooms/${code}/ready`),

  startGame: (code: string) =>
    request<{ status: string; players: RoomPlayerInfo[] }>('POST', `/rooms/${code}/start`),

  getState: async (code: string, version: number): Promise<RoomStateResponse | null> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_BASE}/rooms/${code}/state?v=${version}`, { headers })
    if (res.status === 304) return null
    if (res.status === 401) {
      clearToken()
      throw new Error('Unauthorized')
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },

  submitAction: (code: string, gameState: Record<string, unknown>, stateVersion: number) =>
    request<{ state_version: number }>('POST', `/rooms/${code}/action`, {
      game_state: gameState,
      state_version: stateVersion,
    }),

  // Video streaming
  getLiveKitToken: (code: string) =>
    request<{
      token: string
      ws_url: string
      room_name: string
      participant_identity: string
      participant_name: string
    }>('POST', `/rooms/${code}/livekit/token`),

  updateStreaming: (code: string, isStreaming: boolean) =>
    request<{ is_streaming: boolean }>('POST', `/rooms/${code}/streaming`, { is_streaming: isStreaming }),
}
