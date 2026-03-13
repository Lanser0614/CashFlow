export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => rollDie())
}

export const DICE_FACES: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
}
