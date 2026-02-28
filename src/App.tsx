import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { AuthScreen } from './components/screens/AuthScreen'
import { SetupScreen } from './components/screens/SetupScreen'
import { GameScreen } from './components/screens/GameScreen'
import { WinScreen } from './components/screens/WinScreen'
import './index.css'

function App() {
  const phase = useGameStore((s) => s.phase)
  const { isAuthenticated, isGuest, isLoading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading while checking auth token
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0f1117' }}
      >
        <div className="text-slate-500 text-lg">Загрузка...</div>
      </div>
    )
  }

  // Show auth screen if not authenticated and not guest
  if (!isAuthenticated && !isGuest) {
    return <AuthScreen />
  }

  if (phase === 'setup') return <SetupScreen />
  if (phase === 'won') return <WinScreen />
  return <GameScreen />
}

export default App
