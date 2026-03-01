export type SpaceType =
  | 'payday'
  | 'small_deal'
  | 'big_deal'
  | 'deal'        // odd die = small, even die = big
  | 'doodad'
  | 'market'
  | 'baby'
  | 'downsize'
  | 'charity'
  | 'dream'       // fast track only
  | 'fast_deal'   // fast track deals
  | 'fast_market' // fast track market
  | 'surprise'    // quick mode only

export interface BoardSpace {
  id: number
  type: SpaceType
  label: string
  color: string
  icon: string
}

export type Track = 'rat' | 'fast'
