import { motion } from 'framer-motion'
import { PROFESSIONS } from '../../../data/professions'
import { formatCurrency } from '../../../utils'
import { computePlayerStats } from '../../../utils/playerStats'

const SHOWCASE_IDS = ['teacher', 'doctor', 'janitor', 'pilot']

function getStats(profId: string) {
  const prof = PROFESSIONS.find((p) => p.id === profId)!
  const mockPlayer = {
    statement: {
      ...prof.statement,
      realEstate: [],
      businesses: [],
      stocks: [],
      speculations: [],
      options: [],
      shortPositions: [],
      straddles: [],
      exchangeOpportunities: [],
    },
    babies: 0,
    cash: prof.startingCash,
  } as unknown as Parameters<typeof computePlayerStats>[0]
  return { prof, stats: computePlayerStats(mockPlayer) }
}

export function StepProfessions() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Выбор профессии
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-5 text-center"
      >
        Каждая профессия имеет разные стартовые условия
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {SHOWCASE_IDS.map((id, i) => {
          const { prof, stats } = getStats(id)
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="rounded-xl p-3 border border-white/5"
              style={{ background: 'rgba(45, 49, 84, 0.4)' }}
            >
              <div className="text-center mb-2">
                <span className="text-2xl">{prof.icon}</span>
                <div className="text-sm font-bold text-white mt-1">{prof.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="rounded-lg p-1.5" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  <div className="text-green-400 font-semibold">Зарплата</div>
                  <div className="text-white font-medium">{formatCurrency(prof.statement.salary)}</div>
                </div>
                <div className="rounded-lg p-1.5" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <div className="text-indigo-400 font-semibold">Поток</div>
                  <div className="text-white font-medium">{formatCurrency(stats.monthlyCashFlow)}</div>
                </div>
                <div className="rounded-lg p-1.5" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  <div className="text-red-400 font-semibold">Расходы</div>
                  <div className="text-white font-medium">{formatCurrency(stats.totalExpenses)}</div>
                </div>
                <div className="rounded-lg p-1.5" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <div className="text-yellow-400 font-semibold">Кэш</div>
                  <div className="text-white font-medium">{formatCurrency(prof.startingCash)}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 rounded-xl p-3 text-center text-xs border border-amber-500/10"
        style={{ background: 'rgba(245, 158, 11, 0.06)' }}
      >
        <span className="text-amber-400 font-semibold">Подсказка:</span>{' '}
        <span className="text-slate-400">
          Высокая зарплата не всегда выгодна — важен денежный поток!
        </span>
      </motion.div>
    </div>
  )
}
