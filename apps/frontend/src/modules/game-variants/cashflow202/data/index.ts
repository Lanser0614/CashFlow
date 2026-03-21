import type {
  BigDeal,
  Doodad,
  ExchangeOpportunity,
  MarketCard,
  OptionPosition,
  ProfessionCard,
  ShortPosition,
  SmallDeal,
  StockHolding,
  StraddlePosition,
} from '../../../../types'
import { FAST_TRACK_SIZE, FAST_TRACK_SPACES, RAT_RACE_SIZE, RAT_RACE_SPACES } from '../../../../data/board'
import { DOODADS } from '../../../../data/doodads'
import { PROFESSIONS } from '../../../../data/professions'

export const CASHFLOW_202_PROFESSIONS: ProfessionCard[] = PROFESSIONS

export const CASHFLOW_202_SMALL_DEALS: SmallDeal[] = [
  {
    id: 'cf202_call_alpha',
    type: 'small_deal',
    title: 'Call option ALPHA',
    description: 'Покупка call-опциона на ALPHA. Премия $400, strike $12, контракт 100 акций.',
    category: 'other',
    cost: 400,
    cashflow: 0,
    advancedInstrumentKind: 'option_call',
    underlyingSymbol: 'ALPHA',
    strikePrice: 12,
    contractSize: 100,
    pricePerShare: 10,
  },
  {
    id: 'cf202_put_beta',
    type: 'small_deal',
    title: 'Put option BETA',
    description: 'Покупка put-опциона на BETA. Премия $500, strike $18, контракт 100 акций.',
    category: 'other',
    cost: 500,
    cashflow: 0,
    advancedInstrumentKind: 'option_put',
    underlyingSymbol: 'BETA',
    strikePrice: 18,
    contractSize: 100,
    pricePerShare: 20,
  },
  {
    id: 'cf202_short_retail',
    type: 'small_deal',
    title: 'Short RETAIL',
    description: 'Открыть короткую позицию по RETAIL: 100 акций, цена входа $24, margin reserve $1200.',
    category: 'other',
    cost: 1200,
    cashflow: 0,
    advancedInstrumentKind: 'short_sale',
    underlyingSymbol: 'RETAIL',
    sharesPerLot: 100,
    pricePerShare: 24,
    marginRequirement: 1200,
  },
  {
    id: 'cf202_straddle_tech',
    type: 'small_deal',
    title: 'Straddle TECH',
    description: 'Straddle на TECH: premium $900, strike $30, контракт 100 акций.',
    category: 'other',
    cost: 900,
    cashflow: 0,
    advancedInstrumentKind: 'straddle',
    underlyingSymbol: 'TECH',
    strikePrice: 30,
    contractSize: 100,
    pricePerShare: 30,
  },
  {
    id: 'cf202_exchange_duplex',
    type: 'small_deal',
    title: 'Exchange note: Duplex',
    description: 'Подготовка к быстрой недвижимости сделке. Покупка exchange-right для сегмента duplex.',
    category: 'other',
    cost: 1800,
    cashflow: 0,
    advancedInstrumentKind: 'exchange',
    exchangeTag: 'duplex_exchange',
  },
  {
    id: 'cf202_rental_block',
    type: 'small_deal',
    title: 'Блок апартаментов',
    description: 'Взнос $7,000, ипотека $58,000, поток +$650/мес.',
    category: 'real_estate',
    cost: 7000,
    cashflow: 650,
    liability: 58000,
    speculationTag: 'apartment_block',
  },
  {
    id: 'cf202_cash_machine',
    type: 'small_deal',
    title: 'Cash machine route',
    description: 'Покупка точки cash-machine: взнос $3,000, кредит $12,000, поток +$250/мес.',
    category: 'business',
    cost: 3000,
    cashflow: 250,
    liability: 12000,
  },
  {
    id: 'cf202_stock_alpha',
    type: 'small_deal',
    title: 'ALPHA momentum',
    description: 'Купить 100 акций ALPHA по $10.',
    category: 'stock',
    cost: 1000,
    cashflow: 0,
    stockSymbol: 'ALPHA',
    sharesPerLot: 100,
    pricePerShare: 10,
  },
] 
export const CASHFLOW_202_BIG_DEALS: BigDeal[] = [
  {
    id: 'cf202_resort',
    type: 'big_deal',
    title: 'Курортный объект',
    description: 'Взнос $18,000, кредит $180,000, поток +$1,850/мес.',
    category: 'real_estate',
    cost: 18000,
    cashflow: 1850,
    liability: 180000,
    speculationTag: 'resort',
  },
  {
    id: 'cf202_franchise',
    type: 'big_deal',
    title: 'Франшиза городского формата',
    description: 'Взнос $24,000, кредит $110,000, поток +$2,200/мес.',
    category: 'business',
    cost: 24000,
    cashflow: 2200,
    liability: 110000,
  },
  {
    id: 'cf202_exchange_portfolio',
    type: 'big_deal',
    title: 'Exchange portfolio',
    description: 'Большой exchange-пакет для сегмента apartment_block.',
    category: 'other',
    cost: 4000,
    cashflow: 0,
    advancedInstrumentKind: 'exchange',
    exchangeTag: 'apartment_block',
  },
  {
    id: 'cf202_short_oil',
    type: 'big_deal',
    title: 'Short OIL',
    description: 'Открыть short по OIL: 200 акций, цена входа $32, margin reserve $2200.',
    category: 'other',
    cost: 2200,
    cashflow: 0,
    advancedInstrumentKind: 'short_sale',
    underlyingSymbol: 'OIL',
    contractSize: 200,
    pricePerShare: 32,
    marginRequirement: 2200,
  },
] 
export const CASHFLOW_202_MARKET_CARDS: MarketCard[] = [
  {
    id: 'cf202_mkt_alpha',
    type: 'market',
    title: 'ALPHA breakout',
    description: 'ALPHA торгуется по $18. Можно закрыть опционы и equity-позиции.',
    effect: { kind: 'stock_price', symbol: 'ALPHA', price: 18 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_beta',
    type: 'market',
    title: 'BETA selloff',
    description: 'BETA опускается до $8. Отличный момент для put-стратегий.',
    effect: { kind: 'stock_price', symbol: 'BETA', price: 8 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_tech',
    type: 'market',
    title: 'TECH volatility spike',
    description: 'TECH улетает к $42. Straddle и call-стратегии можно фиксировать.',
    effect: { kind: 'stock_price', symbol: 'TECH', price: 42 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_retail',
    type: 'market',
    title: 'RETAIL panic',
    description: 'RETAIL падает к $11. Короткие позиции становятся выгоднее.',
    effect: { kind: 'stock_price', symbol: 'RETAIL', price: 11 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_oil',
    type: 'market',
    title: 'OIL squeezes',
    description: 'OIL взлетает до $45. Short-идеи нужно пересчитывать.',
    effect: { kind: 'stock_price', symbol: 'OIL', price: 45 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_exchange_duplex',
    type: 'market',
    title: 'Duplex exchange window',
    description: 'Exchange-окно для duplex-позиций даёт multiplier x2.4.',
    effect: { kind: 'exchange_offer', tag: 'duplex_exchange', multiplier: 2.4 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_exchange_apart',
    type: 'market',
    title: 'Apartment block exchange',
    description: 'Exchange-окно для apartment_block даёт multiplier x2.8.',
    effect: { kind: 'exchange_offer', tag: 'apartment_block', multiplier: 2.8 },
    canSell: true,
  },
  {
    id: 'cf202_mkt_resort_boom',
    type: 'market',
    title: 'Resort boom',
    description: 'Рынок курортной недвижимости растёт.',
    effect: { kind: 'real_estate_boom', propertyTag: 'resort', multiplier: 1.8 },
    canSell: true,
  },
] 

export const CASHFLOW_202_DOODADS: Doodad[] = DOODADS

export const CASHFLOW_202_STARTING_PORTFOLIOS: Record<string, {
  stocks?: Array<Omit<StockHolding, 'name'> & { name?: string }>
  options?: Array<Omit<OptionPosition, 'id' | 'name'> & { name?: string }>
  shortPositions?: Array<Omit<ShortPosition, 'id' | 'name'> & { name?: string }>
  straddles?: Array<Omit<StraddlePosition, 'id' | 'name'> & { name?: string }>
  exchangeOpportunities?: Array<Omit<ExchangeOpportunity, 'id' | 'name'> & { name?: string }>
}> = {
  teacher: {
    stocks: [{ symbol: 'ALPHA', shares: 50, purchasePrice: 10, currentPrice: 10, name: 'ALPHA starter' }],
    options: [{ symbol: 'ALPHA', optionType: 'call', strikePrice: 12, premium: 200, contractSize: 50, currentPrice: 10, name: 'ALPHA call' }],
  },
  engineer: {
    stocks: [{ symbol: 'TECH', shares: 50, purchasePrice: 30, currentPrice: 30, name: 'TECH core' }],
    straddles: [{ symbol: 'TECH', strikePrice: 30, premium: 450, contractSize: 50, currentPrice: 30, name: 'TECH straddle' }],
  },
  nurse: {
    options: [{ symbol: 'BETA', optionType: 'put', strikePrice: 18, premium: 250, contractSize: 50, currentPrice: 20, name: 'BETA hedge' }],
    exchangeOpportunities: [{ tag: 'duplex_exchange', purchasePrice: 900, name: 'Duplex exchange' }],
  },
  cop: {
    shortPositions: [{ symbol: 'RETAIL', shares: 40, salePrice: 24, currentPrice: 24, marginReservedCash: 500, name: 'RETAIL short' }],
  },
  manager: {
    stocks: [{ symbol: 'ALPHA', shares: 100, purchasePrice: 10, currentPrice: 10, name: 'ALPHA scale' }],
  },
  truck_driver: {
    exchangeOpportunities: [{ tag: 'duplex_exchange', purchasePrice: 1200, name: 'Logistics duplex exchange' }],
  },
  secretary: {
    options: [{ symbol: 'ALPHA', optionType: 'call', strikePrice: 12, premium: 250, contractSize: 50, currentPrice: 10, name: 'ALPHA call' }],
  },
  janitor: {
    shortPositions: [{ symbol: 'RETAIL', shares: 30, salePrice: 24, currentPrice: 24, marginReservedCash: 300, name: 'RETAIL short' }],
  },
  lawyer: {
    stocks: [{ symbol: 'TECH', shares: 100, purchasePrice: 30, currentPrice: 30, name: 'TECH legal portfolio' }],
    exchangeOpportunities: [{ tag: 'apartment_block', purchasePrice: 1800, name: 'Apartment exchange' }],
  },
  doctor: {
    shortPositions: [{ symbol: 'OIL', shares: 80, salePrice: 32, currentPrice: 32, marginReservedCash: 1500, name: 'OIL hedge' }],
    options: [{ symbol: 'BETA', optionType: 'put', strikePrice: 18, premium: 400, contractSize: 100, currentPrice: 20, name: 'BETA put' }],
  },
  pilot: {
    straddles: [{ symbol: 'TECH', strikePrice: 30, premium: 700, contractSize: 75, currentPrice: 30, name: 'TECH flight straddle' }],
  },
}

export const cashflow202Data = {
  professions: CASHFLOW_202_PROFESSIONS,
  decks: {
    smallDeals: CASHFLOW_202_SMALL_DEALS,
    bigDeals: CASHFLOW_202_BIG_DEALS,
    doodads: CASHFLOW_202_DOODADS,
    marketCards: CASHFLOW_202_MARKET_CARDS,
    surpriseCards: [],
  },
  board: {
    ratRaceSpaces: RAT_RACE_SPACES,
    ratRaceSize: RAT_RACE_SIZE,
    fastTrackSpaces: FAST_TRACK_SPACES,
    fastTrackSize: FAST_TRACK_SIZE,
    legendItems: [
      { color: '#166534', icon: '💰', label: 'Зарплата' },
      { color: '#1e40af', icon: '🤝', label: 'Advanced deal' },
      { color: '#7f1d1d', icon: '💸', label: 'Дудад' },
      { color: '#78350f', icon: '📈', label: 'Volatility' },
      { color: '#831843', icon: '👶', label: 'Ребёнок' },
      { color: '#4c1d95', icon: '🏦', label: 'Margin/Exchange' },
      { color: '#1e293b', icon: '📉', label: 'Даунсайз' },
    ],
    centerLabel: 'ADVANCED MARKET',
    centerIcon: '📈',
  },
} as const
