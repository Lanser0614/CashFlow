import { useEffect, useState } from 'react'
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
import { ProfileScreen } from './components/screens/ProfileScreen'
import { TutorialScreen } from './components/tutorial/TutorialScreen'
import { TutorialPromptModal } from './components/tutorial/TutorialPromptModal'
import { initializeGameResultSync } from './services/gameResultSync'
import { setToken } from './services/api'
import type { GameState } from './types'
import { buildAppPath, navigateToPath, parseAppRoute } from './utils'
import './index.css'

const LOCAL_GAME_STATE_KEY = 'cashflow_local_game_state'

function serializeGameState(state: ReturnType<typeof useGameStore.getState>): GameState {
  return {
    phase: state.phase,
    gameMode: state.gameMode,
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
    surpriseDeck: state.surpriseDeck,
    surpriseDeckIndex: state.surpriseDeckIndex,
    extraTurnFlag: state.extraTurnFlag,
    variantState: state.variantState,
  }
}

function readPersistedGameState(): GameState | null {
  try {
    const raw = sessionStorage.getItem(LOCAL_GAME_STATE_KEY)
    if (!raw) {
      return null
    }
    return JSON.parse(raw) as GameState
  } catch {
    sessionStorage.removeItem(LOCAL_GAME_STATE_KEY)
    return null
  }
}

function App() {
  const [showTutorial, setShowTutorial] = useState(false)
  const phase = useGameStore((s) => s.phase)
  const gameMode = useGameStore((s) => s.gameMode)
  const { isAuthenticated, isLoading, checkAuth, shouldPromptTutorial, dismissTutorialPrompt } = useAuthStore()
  const roomScreen = useRoomStore((s) => s.screen)
  const room = useRoomStore((s) => s.room)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    initializeGameResultSync()
  }, [])

  useEffect(() => {
    const applyRoute = async () => {
      const route = parseAppRoute(window.location.pathname, window.location.search)
      if (route.canonicalPath !== window.location.pathname) {
        window.history.replaceState({}, '', route.canonicalPath)
      }

      if (route.kind === 'google-callback') {
        if (route.error) {
          useAuthStore.setState({ error: 'Ошибка входа через Google. Попробуйте снова.' })
          window.history.replaceState({}, '', '/')
          return
        }
        if (route.token && route.user) {
          setToken(route.token)
          const user = JSON.parse(decodeURIComponent(route.user))
          useAuthStore.setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            shouldPromptTutorial: true,
          })
          window.history.replaceState({}, '', '/')
        }
        return
      }

      if (route.kind === 'profile') {
        useRoomStore.getState().setScreen('none')
        useGameStore.setState({ phase: 'profile' })
        return
      }

      if (route.kind === 'local-setup') {
        useRoomStore.getState().setScreen('none')
        useGameStore.setState({ gameMode: route.variant, phase: 'setup' })
        return
      }

      if (route.kind === 'local-game' || route.kind === 'local-win') {
        useRoomStore.getState().setScreen('none')
        const persistedState = readPersistedGameState()

        if (
          persistedState &&
          persistedState.gameMode === route.variant &&
          (persistedState.phase === 'playing' || persistedState.phase === 'won')
        ) {
          useGameStore.getState().loadGameState({
            ...persistedState,
            phase: route.kind === 'local-win' ? 'won' : persistedState.phase,
          })
        } else {
          useGameStore.setState({ gameMode: route.variant, phase: 'setup' })
        }
        return
      }

      if (route.kind === 'online-lobby') {
        if (!isAuthenticated) return
        useRoomStore.getState().setScreen('lobby')
        return
      }

      if (route.kind === 'online-room') {
        if (!isAuthenticated) return

        const roomStore = useRoomStore.getState()
        if (roomStore.room?.code === route.code) {
          roomStore.setScreen(route.screen === 'game' ? 'game_online' : 'waiting')
          return
        }

        const savedRoomCode = localStorage.getItem('cashflow_room_code')
        if (savedRoomCode?.toUpperCase() === route.code) {
          await roomStore.restoreSession()
          return
        }

        await roomStore.joinRoom(route.code)
        return
      }

      useRoomStore.getState().setScreen('none')
      useGameStore.setState({ phase: 'mode_select' })
    }

    void applyRoute()

    const handlePopState = () => {
      void applyRoute()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isAuthenticated])

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (useRoomStore.getState().screen !== 'none') {
        sessionStorage.removeItem(LOCAL_GAME_STATE_KEY)
        return
      }

      if (state.phase === 'playing' || state.phase === 'won') {
        sessionStorage.setItem(LOCAL_GAME_STATE_KEY, JSON.stringify(serializeGameState(state)))
        return
      }

      sessionStorage.removeItem(LOCAL_GAME_STATE_KEY)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (roomScreen !== 'none') {
      sessionStorage.removeItem(LOCAL_GAME_STATE_KEY)
    }
  }, [roomScreen])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const nextPath = buildAppPath({
      phase,
      gameMode,
      roomScreen,
      roomCode: room?.code,
    })

    if (window.location.pathname !== nextPath) {
      navigateToPath(nextPath)
    }
  }, [gameMode, isAuthenticated, phase, room?.code, roomScreen])

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

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />
  }

  let screen = <GameScreen />

  if (roomScreen === 'lobby') {
    screen = <LobbyScreen />
  } else if (roomScreen === 'waiting') {
    screen = <WaitingRoom />
  } else if (roomScreen === 'game_online') {
    screen = phase === 'won' ? <WinScreen /> : <GameScreen />
  } else if (phase === 'mode_select') {
    screen = <ModeSelectScreen />
  } else if (phase === 'profile') {
    screen = <ProfileScreen />
  } else if (phase === 'setup') {
    screen = <SetupScreen />
  } else if (phase === 'won') {
    screen = <WinScreen />
  }

  if (showTutorial) {
    return (
      <TutorialScreen
        onClose={() => {
          setShowTutorial(false)
          dismissTutorialPrompt()
        }}
      />
    )
  }

  return (
    <>
      {screen}
      <TutorialPromptModal
        open={shouldPromptTutorial && !showTutorial}
        onStart={() => setShowTutorial(true)}
        onSkip={dismissTutorialPrompt}
      />
    </>
  )
}

export default App
