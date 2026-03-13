export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(abs)
  return amount < 0 ? `-${formatted}` : formatted
}

export function formatCurrencyShort(amount: number): string {
  const abs = Math.abs(amount)
  let result: string
  if (abs >= 1_000_000) {
    result = `$${(abs / 1_000_000).toFixed(1)}M`
  } else if (abs >= 1_000) {
    result = `$${(abs / 1_000).toFixed(0)}K`
  } else {
    result = `$${abs}`
  }
  return amount < 0 ? `-${result}` : result
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}
