import { create } from 'zustand'
import { authApi, setToken, clearToken, getToken, type AuthUser } from '../services/api'

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  shouldPromptTutorial: boolean
  error: string | null

  register: (name: string, username: string, password: string, passwordConfirmation: string) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  dismissTutorialPrompt: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
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
      set({ user: res.user, isAuthenticated: true, isLoading: false, shouldPromptTutorial: true })
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Ошибка регистрации'), isLoading: false })
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.login({ username, password })
      setToken(res.token)
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        shouldPromptTutorial: true,
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
    set({ user: null, isAuthenticated: false, isLoading: false, shouldPromptTutorial: false })
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      set({ isLoading: false, shouldPromptTutorial: false })
      return
    }
    try {
      const res = await authApi.getUser()
      set({
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
        shouldPromptTutorial: true,
      })
    } catch {
      clearToken()
      set({ user: null, isAuthenticated: false, isLoading: false, shouldPromptTutorial: false })
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.getGoogleRedirectUrl()
      window.location.href = res.url
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, 'Ошибка входа через Google'), isLoading: false })
    }
  },

  dismissTutorialPrompt: () => {
    set({ shouldPromptTutorial: false })
  },

  clearError: () => set({ error: null }),
}))
