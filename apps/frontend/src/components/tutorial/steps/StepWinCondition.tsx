import { motion } from 'framer-motion'

export function StepWinCondition() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Как победить
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-6 text-center"
      >
        Два шага к победе
      </motion.p>

      {/* Step 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full rounded-xl p-4 border border-indigo-500/20 mb-3"
        style={{ background: 'rgba(99, 102, 241, 0.08)' }}
      >
        <div className="text-sm font-bold text-indigo-400 mb-3">
          Шаг 1: Выйти из крысиных бегов
        </div>

        {/* Animated progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Пассивный доход</span>
            <span>Расходы</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #22c55e)' }}
              initial={{ width: '10%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-300 text-center">
          Когда <span className="text-green-400 font-semibold">пассивный доход</span> {'>'}={' '}
          <span className="text-red-400 font-semibold">расходов</span> — вы выходите на Быстрый трек!
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="text-2xl mb-3"
      >
        ⬇️
      </motion.div>

      {/* Step 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full rounded-xl p-4 border border-amber-500/20"
        style={{ background: 'rgba(245, 158, 11, 0.08)' }}
      >
        <div className="text-sm font-bold text-amber-400 mb-3">
          Шаг 2: Победить на Быстром треке
        </div>

        <div className="space-y-2.5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-3 rounded-lg p-2.5"
            style={{ background: 'rgba(245, 158, 11, 0.08)' }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              ⭐
            </motion.span>
            <div>
              <div className="text-xs font-semibold text-amber-300">Попасть на клетку МЕЧТА</div>
              <div className="text-[10px] text-slate-400">У каждого игрока своя мечта на трекe</div>
            </div>
          </motion.div>

          <div className="text-center text-xs text-slate-500 font-medium">или</div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.15 }}
            className="flex items-center gap-3 rounded-lg p-2.5"
            style={{ background: 'rgba(245, 158, 11, 0.08)' }}
          >
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-xs font-semibold text-amber-300">Накопить $50,000 наличными</div>
              <div className="text-[10px] text-slate-400">Прямой путь к победе через капитал</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-5 text-sm text-slate-400 text-center"
      >
        Удачи! Пусть ваши инвестиции приведут к финансовой свободе!
      </motion.p>
    </div>
  )
}
