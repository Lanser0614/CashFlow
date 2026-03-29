import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { TutorialScreen } from '../tutorial/TutorialScreen'

type Tab = 'login' | 'register'

export function AuthScreen() {
  const [tab, setTab] = useState<Tab>('login')
  const [showTutorial, setShowTutorial] = useState(false)
  const { login, register, loginWithGoogle, isLoading, error, clearError } = useAuthStore()

  // Login form
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(loginUsername, loginPassword)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regPassword !== regConfirm) {
      useAuthStore.setState({ error: 'Пароли не совпадают' })
      return
    }
    await register(regName, regUsername, regPassword, regConfirm)
  }

  const switchTab = (t: Tab) => {
    clearError()
    setTab(t)
  }

  const inputClass =
    'w-full bg-transparent border-b border-white/20 px-1 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors'

  if (showTutorial) {
    return <TutorialScreen onClose={() => setShowTutorial(false)} />
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              background: i % 2 === 0 ? '#6366f1' : '#f59e0b',
              left: `${10 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4 + i, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-6xl mb-3"
          >
            💰
          </motion.div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CASH FLOW 101
          </h1>
          <p className="text-slate-400">Войдите, чтобы начать игру</p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'rgba(45, 49, 84, 0.4)' }}>
          <button
            onClick={() => switchTab('login')}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={{
              background: tab === 'login' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: tab === 'login' ? 'white' : '#94a3b8',
            }}
          >
            Вход
          </button>
          <button
            onClick={() => switchTab('register')}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={{
              background: tab === 'register' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
              color: tab === 'register' ? 'white' : '#94a3b8',
            }}
          >
            Регистрация
          </button>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg p-3 text-sm text-red-300 border border-red-500/20"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Логин</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className={inputClass}
                    placeholder="Введите логин"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Пароль</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full text-center">
                  {isLoading ? 'Вход...' : 'Войти'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Имя</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={inputClass}
                    placeholder="Ваше имя"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Логин</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className={inputClass}
                    placeholder="Придумайте логин"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Пароль</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Минимум 4 символа"
                    required
                    minLength={4}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Подтверждение пароля</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className={inputClass}
                    placeholder="Повторите пароль"
                    required
                    minLength={4}
                  />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full text-center">
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">или</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 mt-4 rounded-xl px-4 py-3 text-sm font-semibold text-white border transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </button>
        </div>

        {/* Tutorial */}
        <div className="text-center mt-6 space-y-3">
          <button
            onClick={() => setShowTutorial(true)}
            className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white border transition-colors"
            style={{
              background: 'rgba(20, 184, 166, 0.12)',
              borderColor: 'rgba(20, 184, 166, 0.28)',
            }}
          >
            📘 Ознакомиться с игрой
          </button>
        </div>
      </motion.div>
    </div>
  )
}
