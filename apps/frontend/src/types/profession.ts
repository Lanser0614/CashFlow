import type { FinancialStatement } from './player'

export interface ProfessionCard {
  id: string
  name: string
  icon: string
  startingCash: number
  statement: Omit<FinancialStatement,
    'realEstate' | 'businesses' | 'stocks' | 'speculations' | 'options' | 'shortPositions' | 'straddles' | 'exchangeOpportunities'>
}
