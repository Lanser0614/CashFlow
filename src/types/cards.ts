export type DealCategory = 'stock' | 'real_estate' | 'business' | 'other'

export interface SmallDeal {
  id: string
  type: 'small_deal'
  title: string
  description: string
  category: DealCategory
  cost: number             // down payment / purchase price
  cashflow?: number        // monthly cashflow (0 for stocks / speculation)
  liability?: number       // loan amount if any
  // For stocks
  stockSymbol?: string
  sharesPerLot?: number    // shares per lot purchased
  pricePerShare?: number
  // For speculation (coin, art, etc.)
  speculationTag?: string  // used by market cards to identify
}

export interface BigDeal {
  id: string
  type: 'big_deal'
  title: string
  description: string
  category: DealCategory
  cost: number
  cashflow: number
  liability?: number
  speculationTag?: string
}

export type DoodadEffect = 'cash' | 'credit_card' | 'per_child'

export interface Doodad {
  id: string
  type: 'doodad'
  title: string
  description: string
  amount: number
  effect: DoodadEffect
  addLiability?: number   // adds to monthly credit card payment
}

export type MarketEffect =
  | { kind: 'stock_price'; symbol: string; price: number }
  | { kind: 'sell_speculation'; tag: string; multiplier: number }
  | { kind: 'real_estate_boom'; propertyTag: string; multiplier: number }
  | { kind: 'real_estate_crash'; loss: number }
  | { kind: 'stock_crash' }
  | { kind: 'interest_rate_cut'; newRate: number }

export interface MarketCard {
  id: string
  type: 'market'
  title: string
  description: string
  effect: MarketEffect
  canSell: boolean        // whether player can sell assets
}

export interface SurpriseCard {
  id: string
  type: 'surprise'
  title: string
  description: string
  effect:
    | { kind: 'bonus_cash'; amount: number }
    | { kind: 'lose_cash'; amount: number }
    | { kind: 'free_asset'; deal: SmallDeal }
    | { kind: 'extra_turn' }
    | { kind: 'skip_turn' }
}

export type AnyCard = SmallDeal | BigDeal | Doodad | MarketCard | SurpriseCard
