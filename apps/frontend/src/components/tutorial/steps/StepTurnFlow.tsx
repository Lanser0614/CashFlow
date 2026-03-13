import { motion } from 'framer-motion'

const steps = [
  {
    icon: '🎲',
    title: 'Бросьте кубик',
    desc: 'Определите, на сколько клеток двигаться',
    color: '#818cf8',
  },
  {
    icon: '🏃',
    title: 'Переместитесь',
    desc: 'Фишка движется по доске. Если проходите ЗАРПЛАТУ — получаете деньги!',
    color: '#22c55e',
  },
  {
    icon: '⚡',
    title: 'Разрешите событие',
    desc: 'Действуйте в зависимости от клетки, на которую попали',
    color: '#f59e0b',
  },
  {
    icon: '➡️',
    title: 'Завершите ход',
    desc: 'Ход переходит к следующему игроку',
    color: '#94a3b8',
  },
]

export function StepTurnFlow() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Как проходит ход
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-6 text-center"
      >
        Каждый ход состоит из 4 простых шагов
      </motion.p>

      <div className="w-full max-w-sm space-y-1">
        {steps.map((step, i) => (
          <div key={i}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="flex items-center gap-4 rounded-xl p-3"
              style={{ background: 'rgba(45, 49, 84, 0.4)' }}
            >
              {/* Step number circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                style={{
                  background: `linear-gradient(135deg, ${step.color}33, ${step.color}11)`,
                  border: `2px solid ${step.color}44`,
                }}
              >
                {step.icon}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: step.color }}>
                  {i + 1}. {step.title}
                </div>
                <div className="text-xs text-slate-400">{step.desc}</div>
              </div>
            </motion.div>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.3 }}
                className="w-0.5 h-4 mx-auto"
                style={{ background: 'rgba(99, 102, 241, 0.3)', transformOrigin: 'top' }}
              />
            )}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="mt-5 rounded-xl p-3 text-center text-xs border border-green-500/10"
        style={{ background: 'rgba(34, 197, 94, 0.06)' }}
      >
        <span className="text-green-400 font-semibold">Важно:</span>{' '}
        <span className="text-slate-400">
          Проходя через клетку ЗАРПЛАТА, вы получаете свой месячный денежный поток!
        </span>
      </motion.div>
    </div>
  )
}
