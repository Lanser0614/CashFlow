import type { CustomFinancialProfile, ProfessionCard } from '../types'

export const CUSTOM_PROFESSION_ID = 'custom_user_profile'

const DEFAULT_CUSTOM_FINANCIAL_PROFILE: CustomFinancialProfile = {
  startingCash: 2500,
  salary: 5000,
  taxes: 750,
  mortgage: 900,
  carLoan: 200,
  creditCard: 100,
  schoolLoan: 100,
  otherExpenses: 900,
  childExpenses: 150,
  homeMortgageBalance: 90000,
  carLoanBalance: 12000,
  creditCardBalance: 3500,
  schoolLoanBalance: 10000,
}

export const CUSTOM_FINANCIAL_FIELD_GROUPS: Array<{
  title: string
  fields: Array<{
    key: keyof CustomFinancialProfile
    label: string
    accentClass: string
    background: string
  }>
}> = [
  {
    title: 'Старт',
    fields: [
      { key: 'startingCash', label: 'Стартовый кэш', accentClass: 'text-yellow-400', background: 'rgba(245, 158, 11, 0.08)' },
      { key: 'salary', label: 'Зарплата / мес', accentClass: 'text-green-400', background: 'rgba(34, 197, 94, 0.08)' },
    ],
  },
  {
    title: 'Ежемесячные расходы',
    fields: [
      { key: 'taxes', label: 'Налоги', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'mortgage', label: 'Ипотека', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'carLoan', label: 'Автокредит', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'creditCard', label: 'Кредитная карта', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'schoolLoan', label: 'Студ. кредит', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'otherExpenses', label: 'Прочие расходы', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
      { key: 'childExpenses', label: 'Расходы на ребёнка', accentClass: 'text-red-400', background: 'rgba(239, 68, 68, 0.08)' },
    ],
  },
  {
    title: 'Остатки долгов',
    fields: [
      { key: 'homeMortgageBalance', label: 'Остаток ипотеки', accentClass: 'text-slate-300', background: 'rgba(148, 163, 184, 0.08)' },
      { key: 'carLoanBalance', label: 'Остаток автокредита', accentClass: 'text-slate-300', background: 'rgba(148, 163, 184, 0.08)' },
      { key: 'creditCardBalance', label: 'Долг по карте', accentClass: 'text-slate-300', background: 'rgba(148, 163, 184, 0.08)' },
      { key: 'schoolLoanBalance', label: 'Остаток студ. кредита', accentClass: 'text-slate-300', background: 'rgba(148, 163, 184, 0.08)' },
    ],
  },
]

export function getDefaultCustomFinancialProfile(): CustomFinancialProfile {
  return { ...DEFAULT_CUSTOM_FINANCIAL_PROFILE }
}

export function normalizeCustomFinancialProfile(profile?: Partial<CustomFinancialProfile> | null): CustomFinancialProfile {
  const fallback = getDefaultCustomFinancialProfile()

  return {
    startingCash: Math.max(0, Math.round(profile?.startingCash ?? fallback.startingCash)),
    salary: Math.max(0, Math.round(profile?.salary ?? fallback.salary)),
    taxes: Math.max(0, Math.round(profile?.taxes ?? fallback.taxes)),
    mortgage: Math.max(0, Math.round(profile?.mortgage ?? fallback.mortgage)),
    carLoan: Math.max(0, Math.round(profile?.carLoan ?? fallback.carLoan)),
    creditCard: Math.max(0, Math.round(profile?.creditCard ?? fallback.creditCard)),
    schoolLoan: Math.max(0, Math.round(profile?.schoolLoan ?? fallback.schoolLoan)),
    otherExpenses: Math.max(0, Math.round(profile?.otherExpenses ?? fallback.otherExpenses)),
    childExpenses: Math.max(0, Math.round(profile?.childExpenses ?? fallback.childExpenses)),
    homeMortgageBalance: Math.max(0, Math.round(profile?.homeMortgageBalance ?? fallback.homeMortgageBalance)),
    carLoanBalance: Math.max(0, Math.round(profile?.carLoanBalance ?? fallback.carLoanBalance)),
    creditCardBalance: Math.max(0, Math.round(profile?.creditCardBalance ?? fallback.creditCardBalance)),
    schoolLoanBalance: Math.max(0, Math.round(profile?.schoolLoanBalance ?? fallback.schoolLoanBalance)),
  }
}

export function createCustomProfessionCard(profile?: Partial<CustomFinancialProfile> | null): ProfessionCard {
  const normalized = normalizeCustomFinancialProfile(profile)
  return {
    id: CUSTOM_PROFESSION_ID,
    name: 'Свой профиль',
    icon: '✍️',
    startingCash: normalized.startingCash,
    statement: {
      salary: normalized.salary,
      taxes: normalized.taxes,
      mortgage: normalized.mortgage,
      carLoan: normalized.carLoan,
      creditCard: normalized.creditCard,
      schoolLoan: normalized.schoolLoan,
      otherExpenses: normalized.otherExpenses,
      childExpenses: normalized.childExpenses,
      homeMortgageBalance: normalized.homeMortgageBalance,
      carLoanBalance: normalized.carLoanBalance,
      creditCardBalance: normalized.creditCardBalance,
      schoolLoanBalance: normalized.schoolLoanBalance,
    },
  }
}
