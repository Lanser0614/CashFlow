import { create } from 'zustand'
import { authApi, setToken, clearToken, getToken, type AuthUser } from '../services/api'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  error: string | null

  register: (name: string, username: string, password: string, passwordConfirmation: string) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  playAsGuest: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
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
      set({ user: res.user, isAuthenticated: true, isGuest: false, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Ошибка регистрации', isLoading: false })
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await authApi.login({ username, password })
      setToken(res.token)
      set({ user: res.user, isAuthenticated: true, isGuest: false, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Ошибка входа', isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Token may already be invalid
    }
    clearToken()
    set({ user: null, isAuthenticated: false, isGuest: false, isLoading: false })
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const res = await authApi.getUser()
      set({ user: res.user, isAuthenticated: true, isLoading: false })
    } catch {
      clearToken()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  playAsGuest: () => {
    set({ isGuest: true, isLoading: false })
  },

  clearError: () => set({ error: null }),
}))
