import { motion } from 'framer-motion'

const items = [
  { icon: '🎯', text: 'Цель: вырваться из "крысиных бегов"' },
  { icon: '💰', text: 'Наращивайте пассивный доход, покупая активы' },
  { icon: '🏆', text: 'Побеждает тот, кто первым достигнет финансовой свободы' },
]

export function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-7xl mb-4"
      >
        💰
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-2"
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        CASH FLOW 101
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 mb-8"
      >
        Настольная игра о финансовой грамотности
      </motion.p>

      <div className="space-y-4 w-full max-w-md">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-center gap-4 rounded-xl p-4 text-left"
            style={{ background: 'rgba(99, 102, 241, 0.08)' }}
          >
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <span className="text-sm text-slate-200">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-8 rounded-xl p-4 text-sm text-slate-400 border border-white/5"
        style={{ background: 'rgba(245, 158, 11, 0.06)' }}
      >
        Роберт Кийосаки создал эту игру, чтобы научить основам инвестирования
      </motion.div>
    </div>
  )
}
