import type { GameVariant } from '../types'

const VARIANT_LABELS: Record<GameVariant, string> = {
  cashflow101_classic: '101 Классическая',
  cashflow101_quick: '101 Быстрая',
  cashflow202: '202 Advanced',
}

export function getGameVariantLabel(variant: GameVariant): string {
  return VARIANT_LABELS[variant]
}
