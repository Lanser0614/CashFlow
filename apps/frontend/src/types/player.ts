export interface StockHolding {
  symbol: string
  name: string
  shares: number
  purchasePrice: number  // price per share at purchase
  currentPrice: number   // updated by market cards
}

export interface OptionPosition {
  id: string
  symbol: string
  name: string
  optionType: 'call' | 'put'
  strikePrice: number
  premium: number
  contractSize: number
  currentPrice: number
}

export interface ShortPosition {
  id: string
  symbol: string
  name: string
  shares: number
  salePrice: number
  currentPrice: number
  marginReservedCash: number
}

export interface StraddlePosition {
  id: string
  symbol: string
  name: string
  strikePrice: number
  premium: number
  contractSize: number
  currentPrice: number
}

export interface ExchangeOpportunity {
  id: string
  name: string
  tag: string
  purchasePrice: number
}

export interface RealEstateAsset {
  id: string
  dealId: string
  name: string
  purchasePrice: number
  downPayment: number
  mortgage: number       // loan balance
  monthlyMortgage: number
  monthlyCashflow: number
  propertyTag?: string   // for market card matching
}

export interface BusinessAsset {
  id: string
  dealId: string
  name: string
  purchasePrice: number
  downPayment: number
  loan: number
  monthlyLoan: number
  monthlyCashflow: number
}

export interface SpeculationAsset {
  id: string
  dealId: string
  name: string
  purchasePrice: number
  tag: string
}

export interface FinancialStatement {
  // INCOME
  salary: number
  // Passive income is computed from assets
  // EXPENSES (fixed from profession card)
  taxes: number
  mortgage: number          // home mortgage payment
  carLoan: number
  creditCard: number        // monthly payment
  schoolLoan: number
  otherExpenses: number
  childExpenses: number     // per child
  // ASSETS
  realEstate: RealEstateAsset[]
  businesses: BusinessAsset[]
  stocks: StockHolding[]
  speculations: SpeculationAsset[]
  options: OptionPosition[]
  shortPositions: ShortPosition[]
  straddles: StraddlePosition[]
  exchangeOpportunities: ExchangeOpportunity[]
  // LIABILITIES (balances)
  homeMortgageBalance: number
  carLoanBalance: number
  creditCardBalance: number
  schoolLoanBalance: number
}

export interface Player {
  id: string
  name: string
  color: string
  professionId: string
  professionName: string
  position: number
  track: 'rat' | 'fast'
  dreamPosition: number   // fast track dream space index
  cash: number
  babies: number
  chariteTurnsLeft: number
  downsized: boolean
  downsizeTurnsLeft: number
  inFastTrack: boolean
  statement: FinancialStatement
}

// Computed from player state (not stored)
export interface PlayerStats {
  totalIncome: number
  passiveIncome: number
  totalExpenses: number
  monthlyCashFlow: number
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  realizedGains: number
  unrealizedGains: number
  marginReservedCash: number
  portfolioValue: number
}
