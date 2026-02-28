import { motion } from 'framer-motion'

const formulaSteps = [
  {
    icon: '📥',
    label: 'Доход',
    detail: 'Зарплата + Пассивный доход',
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
  },
  {
    icon: '📤',
    label: 'Расходы',
    detail: 'Налоги, Кредиты, Дети...',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
  },
  {
    icon: '💰',
    label: 'Денежный поток',
    detail: 'Доход минус Расходы',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
  },
]

export function StepFinancialStatement() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Финансовый отчёт
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-6 text-center"
      >
        Ваш главный инструмент в игре
      </motion.p>

      {/* Formula */}
      <div className="w-full max-w-sm space-y-3">
        {formulaSteps.map((step, i) => (
          <div key={i}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.25 }}
              className="rounded-xl p-4 border"
              style={{ background: step.bg, borderColor: step.border }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <div className="font-bold" style={{ color: step.color }}>{step.label}</div>
                  <div className="text-xs text-slate-400">{step.detail}</div>
                </div>
              </div>
            </motion.div>

            {/* Operator between items */}
            {i < formulaSteps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.25 }}
                className="text-center text-2xl font-bold my-1"
                style={{ color: i === 0 ? '#f87171' : '#fbbf24' }}
              >
                {i === 0 ? '−' : '='}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Explanation callouts */}
      <div className="w-full mt-6 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="rounded-lg p-3 text-center"
          style={{ background: 'rgba(34, 197, 94, 0.08)' }}
        >
          <div className="text-lg mb-1">📈</div>
          <div className="text-xs text-green-400 font-semibold">Положительный</div>
          <div className="text-xs text-slate-400">Можете покупать активы</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="rounded-lg p-3 text-center"
          style={{ background: 'rgba(239, 68, 68, 0.08)' }}
        >
          <div className="text-lg mb-1">📉</div>
          <div className="text-xs text-red-400 font-semibold">Отрицательный</div>
          <div className="text-xs text-slate-400">Вы в долгах!</div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-xs text-slate-500 mt-4 text-center"
      >
        В игре вы увидите полный отчёт с вкладками: Обзор, Активы, Пассивы
      </motion.p>
    </div>
  )
}
