import { create } from 'zustand'
import type {
  GameState,
  GameMode,
  Player,
  SetupPlayer,
  SmallDeal,
  BigDeal,
  Doodad,
  MarketCard,
  SurpriseCard,
  RealEstateAsset,
  BusinessAsset,
  StockHolding,
  SpeculationAsset,
  OptionPosition,
  ShortPosition,
  StraddlePosition,
  ExchangeOpportunity,
} from '../types'
import { getGameVariantModule, isAdvancedVariant, isQuickVariant } from '../modules/game-variants'
import { computeOptionSettlementValue, computeShortSettlementValue, computeStraddleSettlementValue } from '../modules/game-variants/cashflow202/rules/trading'
import { shuffle, rollDice } from '../utils'
import { computePlayerStats, canExitRatRace } from '../utils/playerStats'
import { navigateToHome, navigateToLocalGame, navigateToLocalSetup, navigateToProfile } from '../utils'
import { createCustomProfessionCard, CUSTOM_PROFESSION_ID } from '../utils/customProfession'

// Player colors
const PLAYER_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ef4444', // red
  '#22c55e', // green
  '#ec4899', // pink
  '#14b8a6', // teal
]

// Dream positions on fast track (one per player, evenly spaced)
const DREAM_POSITIONS = [3, 7, 10, 13, 3, 7]

let logIdCounter = 0
let syncingFromServer = false

export function isApplyingServerState() {
  return syncingFromServer
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addLog(state: any, player: Player, message: string): any {
  return {
    ...state,
    log: [
      {
        id: logIdCounter++,
        playerName: player.name,
        playerColor: player.color,
        message,
        timestamp: Date.now(),
      },
      ...state.log,
    ].slice(0, 100),
  }
}

interface GameStore extends GameState {
  // Mode selection
  setGameMode: (mode: GameMode) => void
  openProfile: () => void
  showModeSelect: () => void

  // Setup
  startGame: (players: SetupPlayer[]) => void
  resetGame: () => void

  // Turn actions
  rollDiceAction: () => void
  endMoving: () => void
  resolveSpace: () => void
  buyDeal: (deal: SmallDeal | BigDeal, lots?: number) => void
  passDeal: () => void
  closeDoodad: () => void
  closeSurprise: () => void
  sellAsset: (assetId: string, assetType: 'stock' | 'real_estate' | 'business' | 'speculation' | 'option' | 'short' | 'straddle' | 'exchange', sellPrice?: number) => void
  passMarket: () => void
  endTurn: () => void
  loadGameState: (savedState: GameState) => void
  syncFromServer: (serverState: GameState) => void

  // Computed helpers (selectors)
  getCurrentPlayer: () => Player
  getPlayerStats: (playerId: string) => ReturnType<typeof computePlayerStats>
}

const INITIAL_STATE: Omit<GameState, never> = {
  phase: 'mode_select',
  gameMode: 'cashflow101_classic',
  players: [],
  currentPlayerIndex: 0,
  turnPhase: 'roll',
  diceValues: [],
  activeCard: null,
  pendingMarketCard: null,
  log: [],
  winner: null,
  smallDeckIndex: 0,
  bigDeckIndex: 0,
  doodadDeckIndex: 0,
  marketDeckIndex: 0,
  smallDeck: [],
  bigDeck: [],
  doodadDeck: [],
  marketDeck: [],
  turnNumber: 0,
  surpriseDeck: [],
  surpriseDeckIndex: 0,
  extraTurnFlag: false,
  variantState: {
    cashflow202: {
      realizedGainsByPlayer: {},
      marginReservedCashByPlayer: {},
      exchangeOffers: [],
      startingPortfolioGranted: false,
    },
  },
}

function drawCard<T extends { id: string }>(
  deck: string[],
  index: number,
  cards: T[],
): [T, number] {
  const cardMap = new Map(cards.map((c) => [c.id, c]))
  const id = deck[index % deck.length]
  const card = cardMap.get(id)!
  return [card, (index + 1) % deck.length]
}

export const useGameStore = create<GameStore>()((set, get) => ({
  ...INITIAL_STATE,

  setGameMode: (mode: GameMode) => {
    navigateToLocalSetup(mode)
    set({ gameMode: mode, phase: 'setup' })
  },

  openProfile: () => {
    navigateToProfile()
    set({ phase: 'profile' })
  },

  showModeSelect: () => {
    navigateToHome()
    set({ phase: 'mode_select' })
  },

  getCurrentPlayer: () => {
    const state = get()
    return state.players[state.currentPlayerIndex]
  },

  getPlayerStats: (playerId: string) => {
    const state = get()
    const player = state.players.find((p) => p.id === playerId)!
    return computePlayerStats(player, state.variantState)
  },

  startGame: (setupPlayers: SetupPlayer[]) => {
    const state = get()
    const variant = getGameVariantModule(state.gameMode)
    const isQuick = isQuickVariant(state.gameMode)

    const players: Player[] = setupPlayers.map((sp, i) => {
      const profession = sp.professionId === CUSTOM_PROFESSION_ID
        ? createCustomProfessionCard(sp.customFinancialProfile)
        : (variant.professions.find((p) => p.id === sp.professionId) ?? variant.professions[0])
      const initialStatement = variant.createInitialStatement({
        playerId: `player_${i}`,
        profession,
        color: PLAYER_COLORS[i],
      })
      return {
        id: `player_${i}`,
        name: sp.name,
        color: PLAYER_COLORS[i],
        professionId: profession.id,
        professionName: profession.name,
        position: 0,
        track: 'rat' as const,
        dreamPosition: DREAM_POSITIONS[i],
        cash: profession.startingCash,
        babies: 0,
        chariteTurnsLeft: 0,
        downsized: false,
        downsizeTurnsLeft: 0,
        inFastTrack: false,
        statement: {
          ...profession.statement,
          ...initialStatement,
        },
      }
    })
    const variantState = variant.createInitialVariantState(players)

    set({
      phase: 'playing',
      players,
      currentPlayerIndex: 0,
      turnPhase: 'roll',
      diceValues: [],
      activeCard: null,
      pendingMarketCard: null,
      log: [],
      winner: null,
      smallDeckIndex: 0,
      bigDeckIndex: 0,
      doodadDeckIndex: 0,
      marketDeckIndex: 0,
      smallDeck: shuffle(variant.decks.smallDeals.map((c) => c.id)),
      bigDeck: shuffle(variant.decks.bigDeals.map((c) => c.id)),
      doodadDeck: shuffle(variant.decks.doodads.map((c) => c.id)),
      marketDeck: shuffle(variant.decks.marketCards.map((c) => c.id)),
      turnNumber: 0,
      surpriseDeck: shuffle(variant.decks.surpriseCards.map((c) => c.id)),
      surpriseDeckIndex: 0,
      extraTurnFlag: false,
      variantState,
    })

    if (isQuick) {
      return
    }
  },

  resetGame: () => {
    navigateToHome()
    set({ ...INITIAL_STATE })
  },

  rollDiceAction: () => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const isQuick = isQuickVariant(state.gameMode)

    // Can't roll if not in roll phase
    if (state.turnPhase !== 'roll') return

    // Downsize: skip turn but pay expenses (classic only)
    if (!isQuick && player.downsized) {
      const expenses = computePlayerStats(player, state.variantState).totalExpenses
      const updatedPlayer: Player = {
        ...player,
        cash: Math.max(0, player.cash - expenses),
        downsizeTurnsLeft: player.downsizeTurnsLeft - 1,
        downsized: player.downsizeTurnsLeft - 1 > 0,
      }
      const newPlayers = state.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      )
      let newState = { ...state, players: newPlayers }
      newState = addLog(newState, updatedPlayer, `пропускает ход (даунсайз). Расходы: $${expenses.toLocaleString()}`)
      set({ ...newState, turnPhase: 'end_turn' })
      return
    }

    // Quick mode: always 1 die
    const numDice = isQuick
      ? 1
      : (player.track === 'fast' || player.chariteTurnsLeft > 0 ? 2 : 1)
    const values = rollDice(numDice)
    const total = values.reduce((a, b) => a + b, 0)

    set({ diceValues: values, turnPhase: 'moving' })

    // Move after short delay (for animation)
    setTimeout(() => {
      get().endMoving()
    }, 600)

    void total // total is used for reference; actual move happens in endMoving via diceValues
  },

  endMoving: () => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const total = state.diceValues.reduce((a, b) => a + b, 0)
    const variant = getGameVariantModule(state.gameMode)
    const isQuick = isQuickVariant(state.gameMode)

    const trackSize = isQuick
      ? variant.board.ratRaceSize
      : (player.track === 'rat' ? variant.board.ratRaceSize : variant.board.fastTrackSize)
    const boardSpaces = variant.board.ratRaceSpaces
    const newPosition = (player.position + total) % trackSize

    let updatedPlayer: Player = { ...player, position: newPosition }

    // Charity turns countdown (classic only)
    if (!isQuick && updatedPlayer.chariteTurnsLeft > 0) {
      updatedPlayer = {
        ...updatedPlayer,
        chariteTurnsLeft: updatedPlayer.chariteTurnsLeft - 1,
      }
    }

    // Count payday spaces PASSED (not including the landing space — handled by resolveSpace)
    let paydaysPassedCount = 0
    if (isQuick || player.track === 'rat') {
      for (let step = 1; step < total; step++) {
        const checkPos = (player.position + step) % trackSize
        if (boardSpaces[checkPos].type === 'payday') {
          paydaysPassedCount++
        }
      }
    }

    let logMsg = ''
    if (paydaysPassedCount > 0) {
      const cf = computePlayerStats(updatedPlayer, state.variantState).monthlyCashFlow
      const earned = cf * paydaysPassedCount
      updatedPlayer = { ...updatedPlayer, cash: updatedPlayer.cash + earned }
      logMsg = `прошёл ${paydaysPassedCount > 1 ? paydaysPassedCount + ' клетки' : ''} Зарплату. +$${earned.toLocaleString()}`
    }

    const newPlayers = state.players.map((p) =>
      p.id === player.id ? updatedPlayer : p,
    )

    let newState: GameStore = {
      ...state,
      players: newPlayers,
      turnPhase: 'resolving',
    } as GameStore

    if (logMsg) {
      newState = addLog(newState, updatedPlayer, logMsg) as GameStore
    }

    set(newState)

    // Quick mode: check win after payday pass-through
    if (isQuick && paydaysPassedCount > 0) {
      const stats = computePlayerStats(updatedPlayer, state.variantState)
      if (stats.passiveIncome >= stats.totalExpenses) {
        set({ phase: 'won', winner: updatedPlayer })
        return
      }
    }

    get().resolveSpace()
  },

  resolveSpace: () => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const variant = getGameVariantModule(state.gameMode)
    const isQuick = isQuickVariant(state.gameMode)

    // ── Quick Mode resolution ──
    if (isQuick) {
      const space = variant.board.ratRaceSpaces[player.position]
      if (!space) { set({ turnPhase: 'end_turn' }); return }

      switch (space.type) {
        case 'payday': {
          const cf = computePlayerStats(player, state.variantState).monthlyCashFlow
          const updatedPlayer = { ...player, cash: player.cash + cf }
          const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
          let newState = { ...state, players: newPlayers }
          newState = addLog(newState, updatedPlayer, `получил зарплату. +$${cf.toLocaleString()}`)
          set({ ...newState, turnPhase: 'end_turn' })
          // Check quick win
          const stats = computePlayerStats(updatedPlayer, state.variantState)
          if (stats.passiveIncome >= stats.totalExpenses) {
            set({ phase: 'won', winner: updatedPlayer })
          }
          break
        }

        case 'deal': {
          const [card, newIdx] = drawCard(state.smallDeck, state.smallDeckIndex, variant.decks.smallDeals)
          const newState = addLog(state, player, `попал на Сделку`)
          set({ ...newState, activeCard: card, smallDeckIndex: newIdx, turnPhase: 'card_shown' })
          break
        }

        case 'doodad': {
          const [card, newIdx] = drawCard(state.doodadDeck, state.doodadDeckIndex, variant.decks.doodads)
          const newState = addLog(state, player, `попал на Расход 😱`)
          set({ ...newState, activeCard: card, doodadDeckIndex: newIdx, turnPhase: 'card_shown' })
          break
        }

        case 'market': {
          const [card, newIdx] = drawCard(state.marketDeck, state.marketDeckIndex, variant.decks.marketCards)
          const newState = applyMarketCard({ ...state, marketDeckIndex: newIdx }, player, card)
          set({ ...newState, activeCard: card, pendingMarketCard: card, turnPhase: 'market_sell' })
          break
        }

        case 'surprise': {
          const [card, newIdx] = drawCard(state.surpriseDeck, state.surpriseDeckIndex, variant.decks.surpriseCards)
          const newState = addLog(state, player, `попал на Сюрприз 🎁`)
          set({ ...newState, activeCard: card, surpriseDeckIndex: newIdx, turnPhase: 'card_shown' })
          break
        }

        default:
          set({ turnPhase: 'end_turn' })
      }
      return
    }

    // ── Classic Mode resolution ──
    const spaces = player.track === 'rat' ? variant.board.ratRaceSpaces : []
    const space = player.track === 'rat' ? spaces[player.position] : null

    if (player.track === 'fast') {
      // Fast track: always draw big deal on fast_deal, market on fast_market
      // Check win condition: cash >= 50000 or landed on dream
      const isFastDeal = [1, 4, 6, 9, 12, 15].includes(player.position)
      const isDream = [3, 7, 10, 13].includes(player.position)

      if (isDream && player.position === player.dreamPosition) {
        // WIN
        set((s) => ({
          ...s,
          phase: 'won',
          winner: player,
        }))
        return
      }

        const fastTrackCashTarget = isAdvancedVariant(state.gameMode) ? 75000 : 50000
        if (player.cash >= fastTrackCashTarget) {
          set((s) => ({
            ...s,
            phase: 'won',
            winner: player,
        }))
        return
      }

      if (isFastDeal) {
        const [card, newIdx] = drawCard(state.bigDeck, state.bigDeckIndex, variant.decks.bigDeals)
        set({ activeCard: card, bigDeckIndex: newIdx, turnPhase: 'card_shown' })
        return
      }

      // market or payday on fast track
      if ([2, 8, 14].includes(player.position)) {
        const [card, newIdx] = drawCard(state.marketDeck, state.marketDeckIndex, variant.decks.marketCards)
        const newState = applyMarketCard({ ...state, marketDeckIndex: newIdx }, player, card)
        set({ ...newState, activeCard: card, pendingMarketCard: card, turnPhase: 'market_sell' })
        return
      }

      // payday on fast track
      if ([0, 5, 11].includes(player.position)) {
        const cf = computePlayerStats(player, state.variantState).monthlyCashFlow
        const updatedPlayer = { ...player, cash: player.cash + cf }
        const newPlayers = state.players.map((p) =>
          p.id === player.id ? updatedPlayer : p,
        )
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `получил зарплату $${cf.toLocaleString()}`)
        set({ ...newState, turnPhase: 'end_turn' })
        return
      }

      set({ turnPhase: 'end_turn' })
      return
    }

    if (!space) {
      set({ turnPhase: 'end_turn' })
      return
    }

    switch (space.type) {
      case 'payday': {
        const cf = computePlayerStats(player, state.variantState).monthlyCashFlow
        const updatedPlayer = { ...player, cash: player.cash + cf }
        const newPlayers = state.players.map((p) =>
          p.id === player.id ? updatedPlayer : p,
        )
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `попал на Зарплату. +$${cf.toLocaleString()}`)
        set({ ...newState, turnPhase: 'end_turn' })
        break
      }

      case 'small_deal': {
        const [card, newIdx] = drawCard(state.smallDeck, state.smallDeckIndex, variant.decks.smallDeals)
        const newState = addLog(state, player, `попал на Мелкую Сделку`)
        set({ ...newState, activeCard: card, smallDeckIndex: newIdx, turnPhase: 'card_shown' })
        break
      }

      case 'big_deal': {
        const [card, newIdx] = drawCard(state.bigDeck, state.bigDeckIndex, variant.decks.bigDeals)
        const newState = addLog(state, player, `попал на Крупную Сделку`)
        set({ ...newState, activeCard: card, bigDeckIndex: newIdx, turnPhase: 'card_shown' })
        break
      }

      case 'deal': {
        // Odd dice sum = small, even = big
        const total = state.diceValues.reduce((a, b) => a + b, 0)
        if (total % 2 !== 0) {
          const [card, newIdx] = drawCard(state.smallDeck, state.smallDeckIndex, variant.decks.smallDeals)
          const newState = addLog(state, player, `попал на Сделку (нечётное — мелкая)`)
          set({ ...newState, activeCard: card, smallDeckIndex: newIdx, turnPhase: 'card_shown' })
        } else {
          const [card, newIdx] = drawCard(state.bigDeck, state.bigDeckIndex, variant.decks.bigDeals)
          const newState = addLog(state, player, `попал на Сделку (чётное — крупная)`)
          set({ ...newState, activeCard: card, bigDeckIndex: newIdx, turnPhase: 'card_shown' })
        }
        break
      }

      case 'doodad': {
        const [card, newIdx] = drawCard(state.doodadDeck, state.doodadDeckIndex, variant.decks.doodads)
        const newState = addLog(state, player, `попал на Дудад 😱`)
        set({ ...newState, activeCard: card, doodadDeckIndex: newIdx, turnPhase: 'card_shown' })
        break
      }

      case 'market': {
        const [card, newIdx] = drawCard(state.marketDeck, state.marketDeckIndex, variant.decks.marketCards)
        const newState = applyMarketCard({ ...state, marketDeckIndex: newIdx }, player, card)
        set({ ...newState, activeCard: card, pendingMarketCard: card, turnPhase: 'market_sell' })
        break
      }

      case 'baby': {
        const updatedPlayer: Player = {
          ...player,
          babies: player.babies + 1,
        }
        const newPlayers = state.players.map((p) =>
          p.id === player.id ? updatedPlayer : p,
        )
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `у вас родился ребёнок 👶! Расходы выросли.`)
        set({ ...newState, turnPhase: 'end_turn' })
        break
      }

      case 'downsize': {
        const expenses = computePlayerStats(player, state.variantState).totalExpenses
        const updatedPlayer: Player = {
          ...player,
          downsized: true,
          downsizeTurnsLeft: 2,
          cash: Math.max(0, player.cash - expenses),
        }
        const newPlayers = state.players.map((p) =>
          p.id === player.id ? updatedPlayer : p,
        )
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `попал на ДАУНСАЙЗ 📉! Пропустите 2 хода. Расходы: -$${expenses.toLocaleString()}`)
        set({ ...newState, turnPhase: 'end_turn' })
        break
      }

      case 'charity': {
        const stats = computePlayerStats(player, state.variantState)
        const donation = Math.floor(stats.totalIncome * 0.1)
        const updatedPlayer: Player = {
          ...player,
          cash: Math.max(0, player.cash - donation),
          chariteTurnsLeft: 3,
        }
        const newPlayers = state.players.map((p) =>
          p.id === player.id ? updatedPlayer : p,
        )
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `попал на Благотворительность 🙏. Отдал $${donation.toLocaleString()} (10% дохода). Следующие 3 хода — 2 кубика!`)
        set({ ...newState, turnPhase: 'end_turn' })
        break
      }

      default:
        set({ turnPhase: 'end_turn' })
    }
  },

  buyDeal: (deal: SmallDeal | BigDeal, lots = 1) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const isAdvanced = isAdvancedVariant(state.gameMode)

    if (isAdvanced && deal.advancedInstrumentKind) {
      if (player.cash < deal.cost) return

      if (deal.advancedInstrumentKind === 'option_call' || deal.advancedInstrumentKind === 'option_put') {
        const instrumentDeal = deal as SmallDeal
        const option: OptionPosition = {
          id: `option_${Date.now()}`,
          symbol: instrumentDeal.underlyingSymbol ?? instrumentDeal.stockSymbol ?? 'UNKNOWN',
          name: deal.title,
          optionType: deal.advancedInstrumentKind === 'option_call' ? 'call' : 'put',
          strikePrice: instrumentDeal.strikePrice ?? 0,
          premium: deal.cost,
          contractSize: instrumentDeal.contractSize ?? instrumentDeal.sharesPerLot ?? 100,
          currentPrice: instrumentDeal.pricePerShare ?? instrumentDeal.strikePrice ?? 0,
        }

        const updatedPlayer: Player = {
          ...player,
          cash: player.cash - deal.cost,
          statement: {
            ...player.statement,
            options: [...player.statement.options, option],
          },
        }
        const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `открыл ${option.optionType === 'call' ? 'call' : 'put'} по ${option.symbol}`)
        set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
        return
      }

      if (deal.advancedInstrumentKind === 'short_sale') {
        const instrumentDeal = deal as SmallDeal
        const shortPosition: ShortPosition = {
          id: `short_${Date.now()}`,
          symbol: instrumentDeal.underlyingSymbol ?? instrumentDeal.stockSymbol ?? 'UNKNOWN',
          name: deal.title,
          shares: (instrumentDeal.contractSize ?? instrumentDeal.sharesPerLot ?? 100) * lots,
          salePrice: instrumentDeal.pricePerShare ?? 0,
          currentPrice: instrumentDeal.pricePerShare ?? 0,
          marginReservedCash: instrumentDeal.marginRequirement ?? deal.cost,
        }

        const updatedPlayer: Player = {
          ...player,
          cash: player.cash - shortPosition.marginReservedCash,
          statement: {
            ...player.statement,
            shortPositions: [...player.statement.shortPositions, shortPosition],
          },
        }
        const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
        const marginReservedCashByPlayer = {
          ...state.variantState.cashflow202.marginReservedCashByPlayer,
          [player.id]: (state.variantState.cashflow202.marginReservedCashByPlayer[player.id] ?? 0) + shortPosition.marginReservedCash,
        }
        let newState = {
          ...state,
          players: newPlayers,
          variantState: {
            ...state.variantState,
            cashflow202: {
              ...state.variantState.cashflow202,
              marginReservedCashByPlayer,
            },
          },
        }
        newState = addLog(newState, updatedPlayer, `открыл short по ${shortPosition.symbol} (${shortPosition.shares} акций)`)
        set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
        return
      }

      if (deal.advancedInstrumentKind === 'straddle') {
        const instrumentDeal = deal as SmallDeal
        const straddle: StraddlePosition = {
          id: `straddle_${Date.now()}`,
          symbol: instrumentDeal.underlyingSymbol ?? 'UNKNOWN',
          name: deal.title,
          strikePrice: instrumentDeal.strikePrice ?? 0,
          premium: deal.cost,
          contractSize: instrumentDeal.contractSize ?? instrumentDeal.sharesPerLot ?? 100,
          currentPrice: instrumentDeal.pricePerShare ?? instrumentDeal.strikePrice ?? 0,
        }
        const updatedPlayer: Player = {
          ...player,
          cash: player.cash - deal.cost,
          statement: {
            ...player.statement,
            straddles: [...player.statement.straddles, straddle],
          },
        }
        const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `открыл straddle по ${straddle.symbol}`)
        set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
        return
      }

      if (deal.advancedInstrumentKind === 'exchange') {
        const exchangeOpportunity: ExchangeOpportunity = {
          id: `exchange_${Date.now()}`,
          name: deal.title,
          tag: deal.exchangeTag ?? deal.speculationTag ?? 'exchange',
          purchasePrice: deal.cost,
        }
        const updatedPlayer: Player = {
          ...player,
          cash: player.cash - deal.cost,
          statement: {
            ...player.statement,
            exchangeOpportunities: [...player.statement.exchangeOpportunities, exchangeOpportunity],
          },
        }
        const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
        let newState = { ...state, players: newPlayers }
        newState = addLog(newState, updatedPlayer, `купил exchange opportunity "${deal.title}"`)
        set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
        return
      }
    }

    if (deal.type === 'small_deal' && deal.category === 'stock') {
      const cost = deal.cost * lots
      if (player.cash < cost) return

      const existing = player.statement.stocks.find(
        (s) => s.symbol === deal.stockSymbol,
      )
      let newStocks: StockHolding[]
      if (existing) {
        newStocks = player.statement.stocks.map((s) =>
          s.symbol === deal.stockSymbol
            ? { ...s, shares: s.shares + (deal.sharesPerLot ?? 100) * lots }
            : s,
        )
      } else {
        const newStock: StockHolding = {
          symbol: deal.stockSymbol!,
          name: deal.title,
          shares: (deal.sharesPerLot ?? 100) * lots,
          purchasePrice: deal.pricePerShare ?? 1,
          currentPrice: deal.pricePerShare ?? 1,
        }
        newStocks = [...player.statement.stocks, newStock]
      }

      const updatedPlayer: Player = {
        ...player,
        cash: player.cash - cost,
        statement: { ...player.statement, stocks: newStocks },
      }
      const newPlayers = state.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      )
      let newState = { ...state, players: newPlayers }
      newState = addLog(newState, updatedPlayer, `купил ${(deal.sharesPerLot ?? 100) * lots} акций ${deal.stockSymbol} за $${cost.toLocaleString()}`)
      set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
      return
    }

    if (deal.category === 'other' || (deal.type === 'small_deal' && deal.speculationTag && deal.cashflow === 0 && deal.category !== 'real_estate')) {
      // Speculation asset
      const cost = deal.cost
      if (player.cash < cost) return

      const spec: SpeculationAsset = {
        id: `spec_${Date.now()}`,
        dealId: deal.id,
        name: deal.title,
        purchasePrice: cost,
        tag: deal.speculationTag ?? 'other',
      }
      const updatedPlayer: Player = {
        ...player,
        cash: player.cash - cost,
        statement: { ...player.statement, speculations: [...player.statement.speculations, spec] },
      }
      const newPlayers = state.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      )
      let newState = { ...state, players: newPlayers }
      newState = addLog(newState, updatedPlayer, `купил "${deal.title}" за $${cost.toLocaleString()}`)
      set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
      return
    }

    if (deal.category === 'real_estate') {
      const cost = deal.cost
      if (player.cash < cost) return

      const re: RealEstateAsset = {
        id: `re_${Date.now()}`,
        dealId: deal.id,
        name: deal.title,
        purchasePrice: cost + (deal.liability ?? 0),
        downPayment: cost,
        mortgage: deal.liability ?? 0,
        monthlyMortgage: deal.liability ? Math.round(deal.liability * 0.01) : 0,
        monthlyCashflow: deal.cashflow ?? 0,
        propertyTag: deal.speculationTag,
      }

      const updatedPlayer: Player = {
        ...player,
        cash: player.cash - cost,
        statement: {
          ...player.statement,
          realEstate: [...player.statement.realEstate, re],
          // deal.cashflow is NET cashflow already (after mortgage), so no extra mortgage expense
        },
      }
      const newPlayers = state.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      )
      let newState = { ...state, players: newPlayers }
      newState = addLog(newState, updatedPlayer, `купил "${deal.title}". Поток: +$${deal.cashflow}/мес`)
      set({ ...newState, activeCard: null, turnPhase: 'end_turn' })

      // Check rat race exit or quick win
      if (isQuickVariant(state.gameMode)) {
        setTimeout(() => checkQuickWin(), 100)
      } else {
        setTimeout(() => checkRatRaceExit(), 100)
      }
      return
    }

    if (deal.category === 'business') {
      const cost = deal.cost
      if (player.cash < cost) return

      const biz: BusinessAsset = {
        id: `biz_${Date.now()}`,
        dealId: deal.id,
        name: deal.title,
        purchasePrice: cost + (deal.liability ?? 0),
        downPayment: cost,
        loan: deal.liability ?? 0,
        monthlyLoan: deal.liability ? Math.round(deal.liability * 0.01) : 0,
        monthlyCashflow: deal.cashflow ?? 0,
      }

      const updatedPlayer: Player = {
        ...player,
        cash: player.cash - cost,
        statement: {
          ...player.statement,
          businesses: [...player.statement.businesses, biz],
        },
      }
      const newPlayers = state.players.map((p) =>
        p.id === player.id ? updatedPlayer : p,
      )
      let newState = { ...state, players: newPlayers }
      newState = addLog(newState, updatedPlayer, `купил "${deal.title}". Поток: +$${deal.cashflow}/мес`)
      set({ ...newState, activeCard: null, turnPhase: 'end_turn' })

      // Check rat race exit or quick win
      if (isQuickVariant(state.gameMode)) {
        setTimeout(() => checkQuickWin(), 100)
      } else {
        setTimeout(() => checkRatRaceExit(), 100)
      }
      return
    }

    set({ activeCard: null, turnPhase: 'end_turn' })
  },

  passDeal: () => {
    set({ activeCard: null, turnPhase: 'end_turn' })
  },

  closeDoodad: () => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const card = state.activeCard as Doodad

    if (!card || card.type !== 'doodad') {
      set({ activeCard: null, turnPhase: 'end_turn' })
      return
    }

    let amount = 0
    if (card.effect === 'cash') {
      amount = card.amount
    } else if (card.effect === 'per_child') {
      amount = card.amount * player.babies
    } else if (card.effect === 'credit_card') {
      amount = card.amount // upfront (may be 0)
    }

    const newCreditCard = player.statement.creditCard + (card.addLiability ?? 0)

    const updatedPlayer: Player = {
      ...player,
      cash: Math.max(0, player.cash - amount),
      statement: {
        ...player.statement,
        creditCard: newCreditCard,
      },
    }
    const newPlayers = state.players.map((p) =>
      p.id === player.id ? updatedPlayer : p,
    )
    let newState = { ...state, players: newPlayers }
    const msg = amount > 0
      ? `заплатил $${amount.toLocaleString()} (${card.title})`
      : `Дудад: ${card.title}${card.addLiability ? ` +$${card.addLiability}/мес к расходам` : ''}`
    newState = addLog(newState, updatedPlayer, msg)
    set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
  },

  closeSurprise: () => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    const card = state.activeCard as SurpriseCard

    if (!card || card.type !== 'surprise') {
      set({ activeCard: null, turnPhase: 'end_turn' })
      return
    }

    const eff = card.effect
    let updatedPlayer = { ...player }
    let msg = ''

    if (eff.kind === 'bonus_cash') {
      updatedPlayer = { ...updatedPlayer, cash: updatedPlayer.cash + eff.amount }
      msg = `получил $${eff.amount.toLocaleString()}! (${card.title})`
    } else if (eff.kind === 'lose_cash') {
      updatedPlayer = { ...updatedPlayer, cash: Math.max(0, updatedPlayer.cash - eff.amount) }
      msg = `потерял $${eff.amount.toLocaleString()}. (${card.title})`
    } else if (eff.kind === 'free_asset') {
      const freeDeal = eff.deal
      const re: RealEstateAsset = {
        id: `re_${Date.now()}`,
        dealId: freeDeal.id,
        name: freeDeal.title,
        purchasePrice: 0,
        downPayment: 0,
        mortgage: 0,
        monthlyMortgage: 0,
        monthlyCashflow: freeDeal.cashflow ?? 0,
      }
      updatedPlayer = {
        ...updatedPlayer,
        statement: {
          ...updatedPlayer.statement,
          realEstate: [...updatedPlayer.statement.realEstate, re],
        },
      }
      msg = `получил бесплатный актив: "${freeDeal.title}" (+$${freeDeal.cashflow}/мес)`
    } else if (eff.kind === 'extra_turn') {
      msg = `получил дополнительный ход! 🎉`
      // Set extra turn flag
      const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
      let newState = { ...state, players: newPlayers, extraTurnFlag: true }
      newState = addLog(newState, updatedPlayer, msg)
      set({ ...newState, activeCard: null, turnPhase: 'end_turn' })
      return
    } else if (eff.kind === 'skip_turn') {
      msg = `пропускает следующий ход. (${card.title})`
      // For simplicity: just end turn, no skip tracking in quick mode
    }

    const newPlayers = state.players.map((p) => p.id === player.id ? updatedPlayer : p)
    let newState = { ...state, players: newPlayers }
    if (msg) newState = addLog(newState, updatedPlayer, msg)
    set({ ...newState, activeCard: null, turnPhase: 'end_turn' })

    // Check quick win after free_asset
    if (eff.kind === 'free_asset') {
      const stats = computePlayerStats(updatedPlayer, state.variantState)
      if (stats.passiveIncome >= stats.totalExpenses) {
        set({ phase: 'won', winner: updatedPlayer })
      }
    }
  },

  sellAsset: (assetId: string, assetType: 'stock' | 'real_estate' | 'business' | 'speculation' | 'option' | 'short' | 'straddle' | 'exchange', sellPrice?: number) => {
    const state = get()
    const player = state.players[state.currentPlayerIndex]
    let updatedPlayer = { ...player }
    let gained = 0
    let msg = ''
    let realizedGainDelta = 0

    if (assetType === 'stock') {
      const stock = player.statement.stocks.find((s) => s.symbol === assetId)
      if (!stock) return
      const price = sellPrice ?? stock.currentPrice
      gained = stock.shares * price
      realizedGainDelta = gained - stock.shares * stock.purchasePrice
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          stocks: updatedPlayer.statement.stocks.filter((s) => s.symbol !== assetId),
        },
      }
      msg = `продал акции ${assetId} за $${gained.toLocaleString()}`
    } else if (assetType === 'real_estate') {
      const re = player.statement.realEstate.find((r) => r.id === assetId)
      if (!re) return
      const salePrice = sellPrice ?? re.purchasePrice
      gained = salePrice - re.mortgage
      realizedGainDelta = gained - re.downPayment
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          realEstate: updatedPlayer.statement.realEstate.filter((r) => r.id !== assetId),
        },
      }
      msg = `продал "${re.name}" за $${salePrice.toLocaleString()}. Прибыль: $${gained.toLocaleString()}`
    } else if (assetType === 'business') {
      const biz = player.statement.businesses.find((b) => b.id === assetId)
      if (!biz) return
      const salePrice = sellPrice ?? biz.purchasePrice
      gained = salePrice - biz.loan
      realizedGainDelta = gained - biz.downPayment
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          businesses: updatedPlayer.statement.businesses.filter((b) => b.id !== assetId),
        },
      }
      msg = `продал "${biz.name}" за $${salePrice.toLocaleString()}`
    } else if (assetType === 'speculation') {
      const spec = player.statement.speculations.find((s) => s.id === assetId)
      if (!spec) return
      const salePrice = sellPrice ?? spec.purchasePrice
      gained = salePrice
      realizedGainDelta = gained - spec.purchasePrice
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          speculations: updatedPlayer.statement.speculations.filter((s) => s.id !== assetId),
        },
      }
      msg = `продал "${spec.name}" за $${salePrice.toLocaleString()}`
    } else if (assetType === 'option') {
      const option = player.statement.options.find((position) => position.id === assetId)
      if (!option) return
      gained = sellPrice ?? computeOptionSettlementValue(option)
      realizedGainDelta = gained - option.premium
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          options: updatedPlayer.statement.options.filter((position) => position.id !== assetId),
        },
      }
      msg = `закрыл опцион "${option.name}" за $${gained.toLocaleString()}`
    } else if (assetType === 'short') {
      const shortPosition = player.statement.shortPositions.find((position) => position.id === assetId)
      if (!shortPosition) return
      gained = sellPrice ?? computeShortSettlementValue(shortPosition)
      realizedGainDelta = gained - shortPosition.marginReservedCash
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          shortPositions: updatedPlayer.statement.shortPositions.filter((position) => position.id !== assetId),
        },
      }
      msg = `закрыл short "${shortPosition.name}" за $${gained.toLocaleString()}`
    } else if (assetType === 'straddle') {
      const straddle = player.statement.straddles.find((position) => position.id === assetId)
      if (!straddle) return
      gained = sellPrice ?? computeStraddleSettlementValue(straddle)
      realizedGainDelta = gained - straddle.premium
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          straddles: updatedPlayer.statement.straddles.filter((position) => position.id !== assetId),
        },
      }
      msg = `закрыл straddle "${straddle.name}" за $${gained.toLocaleString()}`
    } else if (assetType === 'exchange') {
      const exchangeOpportunity = player.statement.exchangeOpportunities.find((position) => position.id === assetId)
      if (!exchangeOpportunity) return
      gained = sellPrice ?? exchangeOpportunity.purchasePrice
      realizedGainDelta = gained - exchangeOpportunity.purchasePrice
      updatedPlayer = {
        ...updatedPlayer,
        cash: updatedPlayer.cash + gained,
        statement: {
          ...updatedPlayer.statement,
          exchangeOpportunities: updatedPlayer.statement.exchangeOpportunities.filter((position) => position.id !== assetId),
        },
      }
      msg = `реализовал exchange "${exchangeOpportunity.name}" за $${gained.toLocaleString()}`
    }

    const newPlayers = state.players.map((p) =>
      p.id === player.id ? updatedPlayer : p,
    )
    const realizedGainsByPlayer = {
      ...state.variantState.cashflow202.realizedGainsByPlayer,
      [player.id]: (state.variantState.cashflow202.realizedGainsByPlayer[player.id] ?? 0) + realizedGainDelta,
    }
    const marginReservedCashByPlayer = {
      ...state.variantState.cashflow202.marginReservedCashByPlayer,
      [player.id]: updatedPlayer.statement.shortPositions.reduce((sum, position) => sum + position.marginReservedCash, 0),
    }
    let newState = {
      ...state,
      players: newPlayers,
      variantState: {
        ...state.variantState,
        cashflow202: {
          ...state.variantState.cashflow202,
          realizedGainsByPlayer,
          marginReservedCashByPlayer,
        },
      },
    }
    if (msg) newState = addLog(newState, updatedPlayer, msg)
    set({ ...newState })

    // Check win on fast track (cash >= 50000)
    const fastTrackCashTarget = isAdvancedVariant(state.gameMode) ? 75000 : 50000
    if (updatedPlayer.track === 'fast' && updatedPlayer.cash >= fastTrackCashTarget) {
      set({ phase: 'won', winner: updatedPlayer })
    }
  },

  passMarket: () => {
    set({ activeCard: null, pendingMarketCard: null, turnPhase: 'end_turn' })
  },

  endTurn: () => {
    const state = get()

    // Quick mode: extra turn flag — same player rolls again
    if (state.extraTurnFlag) {
      set({ extraTurnFlag: false, turnPhase: 'roll', diceValues: [], activeCard: null, pendingMarketCard: null })
      return
    }

    const nextIndex = (state.currentPlayerIndex + 1) % state.players.length
    const newTurn = nextIndex === 0 ? state.turnNumber + 1 : state.turnNumber
    set({ currentPlayerIndex: nextIndex, turnPhase: 'roll', diceValues: [], activeCard: null, pendingMarketCard: null, turnNumber: newTurn })
  },

  loadGameState: (savedState: GameState) => {
    navigateToLocalGame(savedState.gameMode ?? 'cashflow101_classic')
    set({
      ...savedState,
      gameMode: savedState.gameMode ?? 'cashflow101_classic',
      variantState: savedState.variantState ?? INITIAL_STATE.variantState,
      // Recover from mid-animation states
      activeCard: null,
      pendingMarketCard: null,
      turnPhase:
        savedState.turnPhase === 'moving' || savedState.turnPhase === 'resolving'
          ? 'roll'
          : savedState.turnPhase,
    })
  },

  syncFromServer: (serverState: GameState) => {
    syncingFromServer = true
    set({
      ...serverState,
      gameMode: serverState.gameMode ?? 'cashflow101_classic',
      variantState: serverState.variantState ?? INITIAL_STATE.variantState,
      // Recover from mid-animation phases that may be in transit
      turnPhase:
        serverState.turnPhase === 'moving' || serverState.turnPhase === 'resolving'
          ? 'roll'
          : serverState.turnPhase,
    })
    syncingFromServer = false
  },
}))

// Helper: apply market card effects to all players' asset prices
function applyMarketCard(state: GameState, _currentPlayer: Player, card: MarketCard): GameState {
  const effect = card.effect
  let newPlayers = [...state.players]

  if (effect.kind === 'stock_price') {
    newPlayers = newPlayers.map((p) => ({
      ...p,
      statement: {
        ...p.statement,
        stocks: p.statement.stocks.map((s) =>
          s.symbol === effect.symbol ? { ...s, currentPrice: effect.price } : s,
        ),
        options: p.statement.options.map((position) =>
          position.symbol === effect.symbol ? { ...position, currentPrice: effect.price } : position,
        ),
        shortPositions: p.statement.shortPositions.map((position) =>
          position.symbol === effect.symbol ? { ...position, currentPrice: effect.price } : position,
        ),
        straddles: p.statement.straddles.map((position) =>
          position.symbol === effect.symbol ? { ...position, currentPrice: effect.price } : position,
        ),
      },
    }))
  } else if (effect.kind === 'stock_crash') {
    newPlayers = newPlayers.map((p) => ({
      ...p,
      statement: {
        ...p.statement,
        stocks: p.statement.stocks.map((s) => ({ ...s, currentPrice: 0 })),
        options: p.statement.options.map((position) => ({ ...position, currentPrice: 0 })),
        shortPositions: p.statement.shortPositions.map((position) => ({ ...position, currentPrice: 0 })),
        straddles: p.statement.straddles.map((position) => ({ ...position, currentPrice: 0 })),
      },
    }))
  } else if (effect.kind === 'real_estate_crash') {
    // Reduce cashflow values (simplified)
    newPlayers = newPlayers.map((p) => ({
      ...p,
      statement: {
        ...p.statement,
        realEstate: p.statement.realEstate.map((re) => ({
          ...re,
          monthlyCashflow: Math.round(re.monthlyCashflow * (1 - effect.loss)),
        })),
      },
    }))
  }
  // interest_rate_cut, real_estate_boom, sell_speculation handled at sell time

  return { ...state, players: newPlayers }
}

// Helper: check if current player wins in quick mode
function checkQuickWin() {
  const state = useGameStore.getState()
  if (!isQuickVariant(state.gameMode)) return
  const player = state.players[state.currentPlayerIndex]
  const stats = computePlayerStats(player, state.variantState)
  if (stats.passiveIncome >= stats.totalExpenses) {
    const logEntry = {
      id: logIdCounter++,
      playerName: player.name,
      playerColor: player.color,
      message: `🎉 ПОБЕДА! Пассивный доход покрывает расходы!`,
      timestamp: Date.now(),
    }
    useGameStore.setState({
      phase: 'won',
      winner: player,
      log: [logEntry, ...state.log],
    })
  }
}

// Helper: check if current player can exit rat race
function checkRatRaceExit() {
  const state = useGameStore.getState()
  const player = state.players[state.currentPlayerIndex]

  if (player.track === 'rat' && canExitRatRace(player)) {
    const updatedPlayer: Player = {
      ...player,
      track: 'fast',
      inFastTrack: true,
      position: 0,
    }
    const newPlayers = state.players.map((p) =>
      p.id === player.id ? updatedPlayer : p,
    )
    const logEntry = {
      id: logIdCounter++,
      playerName: player.name,
      playerColor: player.color,
      message: `🎉 ВЫШЕЛ ИЗ КРЫСИНЫХ БЕГОВ! Переходит на Быстрый Трек!`,
      timestamp: Date.now(),
    }
    useGameStore.setState({
      players: newPlayers,
      log: [logEntry, ...state.log],
    })
  }
}
