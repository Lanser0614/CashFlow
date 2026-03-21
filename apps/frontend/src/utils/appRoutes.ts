import type { GameState, GameVariant } from '../types'

export type RouteScreen = 'waiting' | 'game'

type ParsedAppRoute =
  | { kind: 'home'; canonicalPath: string }
  | { kind: 'profile'; canonicalPath: string }
  | { kind: 'online-lobby'; canonicalPath: string }
  | { kind: 'online-room'; code: string; screen: RouteScreen; canonicalPath: string }
  | { kind: 'local-setup'; variant: GameVariant; canonicalPath: string }
  | { kind: 'local-game'; variant: GameVariant; canonicalPath: string }
  | { kind: 'local-win'; variant: GameVariant; canonicalPath: string }

const VARIANT_SLUGS: Record<GameVariant, string> = {
  cashflow101_classic: 'cashflow-101-classic',
  cashflow101_quick: 'cashflow-101-quick',
  cashflow202: 'cashflow-202',
}

const SLUG_TO_VARIANT = Object.fromEntries(
  Object.entries(VARIANT_SLUGS).map(([variant, slug]) => [slug, variant]),
) as Record<string, GameVariant>

export interface AppPathState {
  phase: GameState['phase']
  gameMode: GameVariant
  roomScreen: 'none' | 'lobby' | 'waiting' | 'game_online'
  roomCode?: string | null
}

export function getVariantSlug(variant: GameVariant): string {
  return VARIANT_SLUGS[variant]
}

export function parseVariantSlug(slug: string): GameVariant | null {
  return SLUG_TO_VARIANT[slug] ?? null
}

export function getOnlineLobbyPath(): string {
  return '/online'
}

export function getOnlineRoomPath(code: string, screen: RouteScreen = 'waiting'): string {
  const normalizedCode = code.trim().toUpperCase()
  return screen === 'game'
    ? `/online/room/${normalizedCode}/game`
    : `/online/room/${normalizedCode}`
}

export function getLocalSetupPath(variant: GameVariant): string {
  return `/play/${getVariantSlug(variant)}`
}

export function getLocalGamePath(variant: GameVariant): string {
  return `${getLocalSetupPath(variant)}/game`
}

export function getLocalWinPath(variant: GameVariant): string {
  return `${getLocalSetupPath(variant)}/win`
}

export function navigateToPath(path: string, options?: { replace?: boolean }): void {
  const normalizedPath = normalizePath(path)
  if (window.location.pathname === normalizedPath) {
    return
  }

  if (options?.replace) {
    window.history.replaceState({}, '', normalizedPath)
    return
  }

  window.history.pushState({}, '', normalizedPath)
}

export function navigateToHome(options?: { replace?: boolean }): void {
  navigateToPath('/', options)
}

export function navigateToProfile(options?: { replace?: boolean }): void {
  navigateToPath('/profile', options)
}

export function navigateToOnlineLobby(options?: { replace?: boolean }): void {
  navigateToPath(getOnlineLobbyPath(), options)
}

export function navigateToOnlineRoom(code: string, screen: RouteScreen = 'waiting', options?: { replace?: boolean }): void {
  navigateToPath(getOnlineRoomPath(code, screen), options)
}

export function navigateToLocalSetup(variant: GameVariant, options?: { replace?: boolean }): void {
  navigateToPath(getLocalSetupPath(variant), options)
}

export function navigateToLocalGame(variant: GameVariant, options?: { replace?: boolean }): void {
  navigateToPath(getLocalGamePath(variant), options)
}

export function navigateToLocalWin(variant: GameVariant, options?: { replace?: boolean }): void {
  navigateToPath(getLocalWinPath(variant), options)
}

export function buildAppPath(state: AppPathState): string {
  if (state.roomScreen === 'lobby') {
    return getOnlineLobbyPath()
  }

  if (state.roomScreen === 'waiting' && state.roomCode) {
    return getOnlineRoomPath(state.roomCode, 'waiting')
  }

  if (state.roomScreen === 'game_online' && state.roomCode) {
    return getOnlineRoomPath(state.roomCode, 'game')
  }

  if (state.phase === 'profile') {
    return '/profile'
  }

  if (state.phase === 'setup') {
    return getLocalSetupPath(state.gameMode)
  }

  if (state.phase === 'playing') {
    return getLocalGamePath(state.gameMode)
  }

  if (state.phase === 'won') {
    return getLocalWinPath(state.gameMode)
  }

  return '/'
}

export function parseAppRoute(pathname: string, search: string): ParsedAppRoute {
  const params = new URLSearchParams(search)
  const joinCode = params.get('join')?.trim().toUpperCase()
  if (joinCode) {
    return {
      kind: 'online-room',
      code: joinCode,
      screen: 'waiting',
      canonicalPath: getOnlineRoomPath(joinCode),
    }
  }

  const normalizedPath = normalizePath(pathname)

  if (normalizedPath === '/' || normalizedPath === '/auth') {
    return { kind: 'home', canonicalPath: normalizedPath === '/auth' ? '/auth' : '/' }
  }

  if (normalizedPath === '/profile') {
    return { kind: 'profile', canonicalPath: '/profile' }
  }

  if (normalizedPath === '/online') {
    return { kind: 'online-lobby', canonicalPath: '/online' }
  }

  const onlineMatch = normalizedPath.match(/^\/online\/room\/([A-Za-z0-9_-]+?)(?:\/(game))?$/)
  if (onlineMatch) {
    const [, code, screen] = onlineMatch
    return {
      kind: 'online-room',
      code: code.toUpperCase(),
      screen: screen === 'game' ? 'game' : 'waiting',
      canonicalPath: getOnlineRoomPath(code, screen === 'game' ? 'game' : 'waiting'),
    }
  }

  const localMatch = normalizedPath.match(/^\/play\/([a-z0-9-]+?)(?:\/(game|win))?$/)
  if (localMatch) {
    const [, slug, screen] = localMatch
    const variant = parseVariantSlug(slug)
    if (variant) {
      if (screen === 'game') {
        return { kind: 'local-game', variant, canonicalPath: getLocalGamePath(variant) }
      }
      if (screen === 'win') {
        return { kind: 'local-win', variant, canonicalPath: getLocalWinPath(variant) }
      }
      return { kind: 'local-setup', variant, canonicalPath: getLocalSetupPath(variant) }
    }
  }

  return { kind: 'home', canonicalPath: '/' }
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed || '/'
}
