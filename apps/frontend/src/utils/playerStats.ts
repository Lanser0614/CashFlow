import type { Player, PlayerStats } from '../types'

export function computePlayerStats(player: Player): PlayerStats {
  const s = player.statement

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
  const totalAssets = player.cash + stockValue + realEstateValue + businessValue

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

  const netWorth = totalAssets - totalLiabilities

  return {
    totalIncome,
    passiveIncome,
    totalExpenses,
    monthlyCashFlow,
    totalAssets,
    totalLiabilities,
    netWorth,
  }
}

export function canExitRatRace(player: Player): boolean {
  const stats = computePlayerStats(player)
  return stats.passiveIncome >= stats.totalExpenses
}
