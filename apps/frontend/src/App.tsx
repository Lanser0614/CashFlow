import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useRoomStore } from './store/roomStore'
import { AuthScreen } from './components/screens/AuthScreen'
import { ModeSelectScreen } from './components/screens/ModeSelectScreen'
import { SetupScreen } from './components/screens/SetupScreen'
import { GameScreen } from './components/screens/GameScreen'
import { WinScreen } from './components/screens/WinScreen'
import { LobbyScreen } from './components/screens/LobbyScreen'
import { WaitingRoom } from './components/screens/WaitingRoom'
import './index.css'

function App() {
  const phase = useGameStore((s) => s.phase)
  const { isAuthenticated, isGuest, isLoading, checkAuth } = useAuthStore()
  const roomScreen = useRoomStore((s) => s.screen)
  const joinRoom = useRoomStore((s) => s.joinRoom)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Handle join link: ?join=ABC123
  useEffect(() => {
    if (!isAuthenticated) return
    const params = new URLSearchParams(window.location.search)
    const joinCode = params.get('join')
    if (joinCode) {
      joinRoom(joinCode)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [isAuthenticated, joinRoom])

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

  // Online multiplayer screens
  if (roomScreen === 'lobby') return <LobbyScreen />
  if (roomScreen === 'waiting') return <WaitingRoom />

  // Online game uses same GameScreen but with polling
  if (roomScreen === 'game_online') {
    if (phase === 'won') return <WinScreen />
    return <GameScreen />
  }

  // Local game flow
  if (phase === 'mode_select') return <ModeSelectScreen />
  if (phase === 'setup') return <SetupScreen />
  if (phase === 'won') return <WinScreen />
  return <GameScreen />
}

export default App
