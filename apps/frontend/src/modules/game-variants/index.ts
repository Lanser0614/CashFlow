import type { GameVariant } from '../../types'
import { cashflow101ClassicVariant } from './cashflow101Classic'
import { cashflow101QuickVariant } from './cashflow101Quick'
import { cashflow202Variant } from './cashflow202'
import type { GameVariantModule } from './types'

const GAME_VARIANTS: Record<GameVariant, GameVariantModule> = {
  cashflow101_classic: cashflow101ClassicVariant,
  cashflow101_quick: cashflow101QuickVariant,
  cashflow202: cashflow202Variant,
}

export function getGameVariantModule(variant: GameVariant): GameVariantModule {
  return GAME_VARIANTS[variant]
}

export function getAllGameVariants(): GameVariantModule[] {
  return Object.values(GAME_VARIANTS)
}

export function isQuickVariant(variant: GameVariant): boolean {
  return GAME_VARIANTS[variant].ruleset === 'quick'
}

export function isAdvancedVariant(variant: GameVariant): boolean {
  return GAME_VARIANTS[variant].ruleset === 'advanced'
}

export type * from './types'
