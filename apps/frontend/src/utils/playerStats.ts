import type { Player, PlayerStats, VariantState } from '../types'

function getOptionValue(player: Player): number {
  return player.statement.options.reduce((sum, option) => {
    const intrinsic = option.optionType === 'call'
      ? Math.max(option.currentPrice - option.strikePrice, 0)
      : Math.max(option.strikePrice - option.currentPrice, 0)
    return sum + intrinsic * option.contractSize
  }, 0)
}

function getStraddleValue(player: Player): number {
  return player.statement.straddles.reduce((sum, straddle) => {
    const callLeg = Math.max(straddle.currentPrice - straddle.strikePrice, 0)
    const putLeg = Math.max(straddle.strikePrice - straddle.currentPrice, 0)
    return sum + (callLeg + putLeg) * straddle.contractSize
  }, 0)
}

function getShortPnl(player: Player): number {
  return player.statement.shortPositions.reduce(
    (sum, position) => sum + (position.salePrice - position.currentPrice) * position.shares,
    0,
  )
}

export function computePlayerStats(player: Player, variantState?: VariantState): PlayerStats {
  const s = player.statement
  const realizedGains = variantState?.cashflow202.realizedGainsByPlayer[player.id] ?? 0
  const marginReservedCash = s.shortPositions.reduce((sum, position) => sum + position.marginReservedCash, 0)

  // Passive income from all assets
  const passiveIncome =
    s.realEstate.reduce((sum, re) => sum + re.monthlyCashflow, 0) +
    s.businesses.reduce((sum, b) => sum + b.monthlyCashflow, 0)
  // Note: stocks/speculations have 0 monthly cashflow — only realized on sale

  const totalIncome = s.salary + passiveIncome

  const childCosts = s.childExpenses * player.babies

  const totalExpenses =
    s.taxes +
    s.mortgage +
    s.carLoan +
    s.creditCard +
    s.schoolLoan +
    s.otherExpenses +
    childCosts

  const monthlyCashFlow = totalIncome - totalExpenses

  // Assets
  const stockValue = s.stocks.reduce(
    (sum, st) => sum + st.shares * st.currentPrice,
    0,
  )
  const realEstateValue = s.realEstate.reduce(
    (sum, re) => sum + re.purchasePrice,
    0,
  )
  const businessValue = s.businesses.reduce(
    (sum, b) => sum + b.purchasePrice,
    0,
  )
  const speculationValue = s.speculations.reduce((sum, spec) => sum + spec.purchasePrice, 0)
  const optionValue = getOptionValue(player)
  const straddleValue = getStraddleValue(player)
  const exchangeValue = s.exchangeOpportunities.reduce((sum, opportunity) => sum + opportunity.purchasePrice, 0)
  const shortValue = marginReservedCash + getShortPnl(player)
  const portfolioValue = stockValue + realEstateValue + businessValue + speculationValue + optionValue + straddleValue + exchangeValue + shortValue
  const totalAssets = player.cash + portfolioValue

  // Liabilities
  const reMortgages = s.realEstate.reduce((sum, re) => sum + re.mortgage, 0)
  const businessLoans = s.businesses.reduce((sum, b) => sum + b.loan, 0)
  const totalLiabilities =
    s.homeMortgageBalance +
    s.carLoanBalance +
    s.creditCardBalance +
    s.schoolLoanBalance +
    reMortgages +
    businessLoans

  const unrealizedGains =
    s.stocks.reduce((sum, stock) => sum + (stock.currentPrice - stock.purchasePrice) * stock.shares, 0) +
    s.options.reduce((sum, option) => {
      const intrinsic = option.optionType === 'call'
        ? Math.max(option.currentPrice - option.strikePrice, 0)
        : Math.max(option.strikePrice - option.currentPrice, 0)
      return sum + intrinsic * option.contractSize - option.premium
    }, 0) +
    s.straddles.reduce((sum, straddle) => {
      const callLeg = Math.max(straddle.currentPrice - straddle.strikePrice, 0)
      const putLeg = Math.max(straddle.strikePrice - straddle.currentPrice, 0)
      return sum + (callLeg + putLeg) * straddle.contractSize - straddle.premium
    }, 0) +
    getShortPnl(player)

  const netWorth = totalAssets - totalLiabilities

  return {
    totalIncome,
    passiveIncome,
    totalExpenses,
    monthlyCashFlow,
    totalAssets,
    totalLiabilities,
    netWorth,
    realizedGains,
    unrealizedGains,
    marginReservedCash,
    portfolioValue,
  }
}

export function canExitRatRace(player: Player): boolean {
  const stats = computePlayerStats(player)
  return stats.passiveIncome >= stats.totalExpenses
}
