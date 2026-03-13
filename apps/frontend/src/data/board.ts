import type { BoardSpace } from '../types'

export const RAT_RACE_SPACES: BoardSpace[] = [
  { id: 0,  type: 'payday',   label: 'ЗАРПЛАТА',        color: '#16a34a', icon: '💰' },
  { id: 1,  type: 'deal',     label: 'СДЕЛКА',           color: '#2563eb', icon: '🤝' },
  { id: 2,  type: 'doodad',   label: 'ДУДАД',            color: '#dc2626', icon: '💸' },
  { id: 3,  type: 'market',   label: 'РЫНОК',            color: '#d97706', icon: '📈' },
  { id: 4,  type: 'payday',   label: 'ЗАРПЛАТА',         color: '#16a34a', icon: '💰' },
  { id: 5,  type: 'small_deal', label: 'МЕЛКАЯ СДЕЛКА', color: '#3b82f6', icon: '📋' },
  { id: 6,  type: 'doodad',   label: 'ДУДАД',            color: '#dc2626', icon: '💸' },
  { id: 7,  type: 'charity',  label: 'БЛАГОТВОРИТ.',    color: '#7c3aed', icon: '🙏' },
  { id: 8,  type: 'payday',   label: 'ЗАРПЛАТА',         color: '#16a34a', icon: '💰' },
  { id: 9,  type: 'deal',     label: 'СДЕЛКА',           color: '#2563eb', icon: '🤝' },
  { id: 10, type: 'doodad',   label: 'ДУДАД',            color: '#dc2626', icon: '💸' },
  { id: 11, type: 'market',   label: 'РЫНОК',            color: '#d97706', icon: '📈' },
  { id: 12, type: 'payday',   label: 'ЗАРПЛАТА',         color: '#16a34a', icon: '💰' },
  { id: 13, type: 'big_deal', label: 'КРУПНАЯ СДЕЛКА',  color: '#1d4ed8', icon: '🏢' },
  { id: 14, type: 'doodad',   label: 'ДУДАД',            color: '#dc2626', icon: '💸' },
  { id: 15, type: 'baby',     label: 'РЕБЁНОК',          color: '#ec4899', icon: '👶' },
  { id: 16, type: 'payday',   label: 'ЗАРПЛАТА',         color: '#16a34a', icon: '💰' },
  { id: 17, type: 'deal',     label: 'СДЕЛКА',           color: '#2563eb', icon: '🤝' },
  { id: 18, type: 'doodad',   label: 'ДУДАД',            color: '#dc2626', icon: '💸' },
  { id: 19, type: 'downsize', label: 'ДАУНСАЙЗ',         color: '#64748b', icon: '📉' },
  { id: 20, type: 'payday',   label: 'ЗАРПЛАТА',         color: '#16a34a', icon: '💰' },
  { id: 21, type: 'small_deal', label: 'МЕЛКАЯ СДЕЛКА', color: '#3b82f6', icon: '📋' },
  { id: 22, type: 'market',   label: 'РЫНОК',            color: '#d97706', icon: '📈' },
  { id: 23, type: 'baby',     label: 'РЕБЁНОК',          color: '#ec4899', icon: '👶' },
]

export const FAST_TRACK_SPACES: BoardSpace[] = [
  { id: 0,  type: 'payday',     label: 'ВЫХОД',         color: '#22c55e', icon: '🚀' },
  { id: 1,  type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
  { id: 2,  type: 'fast_market',label: 'РЫНОК',         color: '#d97706', icon: '📊' },
  { id: 3,  type: 'dream',      label: 'МЕЧТА',         color: '#f59e0b', icon: '⭐' },
  { id: 4,  type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
  { id: 5,  type: 'payday',     label: 'ЗАРПЛАТА',      color: '#16a34a', icon: '💰' },
  { id: 6,  type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
  { id: 7,  type: 'dream',      label: 'МЕЧТА',         color: '#f59e0b', icon: '⭐' },
  { id: 8,  type: 'fast_market',label: 'РЫНОК',         color: '#d97706', icon: '📊' },
  { id: 9,  type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
  { id: 10, type: 'dream',      label: 'МЕЧТА',         color: '#f59e0b', icon: '⭐' },
  { id: 11, type: 'payday',     label: 'ЗАРПЛАТА',      color: '#16a34a', icon: '💰' },
  { id: 12, type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
  { id: 13, type: 'dream',      label: 'МЕЧТА',         color: '#f59e0b', icon: '⭐' },
  { id: 14, type: 'fast_market',label: 'РЫНОК',         color: '#d97706', icon: '📊' },
  { id: 15, type: 'fast_deal',  label: 'КРУПНАЯ СДЕЛКА',color: '#1d4ed8', icon: '🏢' },
]

export const RAT_RACE_SIZE = RAT_RACE_SPACES.length // 24
export const FAST_TRACK_SIZE = FAST_TRACK_SPACES.length // 16
