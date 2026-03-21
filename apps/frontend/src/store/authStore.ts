import { create } from 'zustand'
import { authApi, setToken, clearToken, getToken, type AuthUser } from '../services/api'

const GUEST_MODE_KEY = 'cashflow_guest_mode'

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  shouldPromptTutorial: boolean
  error: string | null

  register: (name: string, username: string, password: string, passwordConfirmation: string) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  playAsGuest: () => void
  dismissTutorialPrompt: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
  shouldPromptTutorial: false,
  error: null,

  register: async (name, username, password, passwordConfirmation) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.register({
        name,
        username,
        password,
        password_confirmation: passwordConfirmation,
      })
      setToken(res.token)
      localStorage.removeItem(GUEST_MODE_KEY)
      localStorage.setItem('cashflow_tutorial_prompt_pending', '1')
      set({ user: res.user, isAuthenticated: true, isGuest: false, isLoading: false, shouldPromptTutorial: true })
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Ошибка регистрации'), isLoading: false })
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.login({ username, password })
      setToken(res.token)
      localStorage.removeItem(GUEST_MODE_KEY)
      set({
        user: res.user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        shouldPromptTutorial: localStorage.getItem('cashflow_tutorial_prompt_pending') === '1',
      })
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Ошибка входа'), isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Token may already be invalid
    }
    clearToken()
    localStorage.removeItem(GUEST_MODE_KEY)
    set({ user: null, isAuthenticated: false, isGuest: false, isLoading: false, shouldPromptTutorial: false })
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      const isGuest = localStorage.getItem(GUEST_MODE_KEY) === '1'
      set({ isGuest, isLoading: false, shouldPromptTutorial: false })
      return
    }
    try {
      const res = await authApi.getUser()
      localStorage.removeItem(GUEST_MODE_KEY)
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        shouldPromptTutorial: localStorage.getItem('cashflow_tutorial_prompt_pending') === '1',
      })
    } catch {
      clearToken()
      const isGuest = localStorage.getItem(GUEST_MODE_KEY) === '1'
      set({ user: null, isAuthenticated: false, isGuest, isLoading: false, shouldPromptTutorial: false })
    }
  },

  playAsGuest: () => {
    localStorage.setItem(GUEST_MODE_KEY, '1')
    set({ isGuest: true, isLoading: false, shouldPromptTutorial: false })
  },

  dismissTutorialPrompt: () => {
    localStorage.removeItem('cashflow_tutorial_prompt_pending')
    set({ shouldPromptTutorial: false })
  },

  clearError: () => set({ error: null }),
}))
