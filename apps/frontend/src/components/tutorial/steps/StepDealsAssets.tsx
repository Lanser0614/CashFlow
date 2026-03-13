import { motion } from 'framer-motion'

const assets = [
  {
    icon: '📊',
    title: 'Акции',
    desc: 'Покупайте дёшево, продавайте дорого. Нет ежемесячного дохода — заработок на рыночных событиях.',
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.15)',
  },
  {
    icon: '🏠',
    title: 'Недвижимость',
    desc: 'Арендный доход каждый месяц! Требует первый взнос, но приносит стабильный пассивный доход.',
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.08)',
    border: 'rgba(34, 197, 94, 0.15)',
  },
  {
    icon: '🏪',
    title: 'Бизнес',
    desc: 'Приносит ежемесячный доход. Крупные сделки — большие суммы и быстрый выход из крысиных бегов!',
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.15)',
  },
]

export function StepDealsAssets() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Сделки и активы
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-5 text-center"
      >
        Покупайте активы, которые генерируют пассивный доход
      </motion.p>

      <div className="w-full space-y-3">
        {assets.map((asset, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.15 }}
            className="rounded-xl p-4 border"
            style={{ background: asset.bg, borderColor: asset.border }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{asset.icon}</span>
              <div>
                <div className="font-bold text-sm" style={{ color: asset.color }}>
                  {asset.title}
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">{asset.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-5 w-full rounded-xl p-3 text-center border border-amber-500/20 glow-gold"
        style={{ background: 'rgba(245, 158, 11, 0.08)' }}
      >
        <div className="text-xs text-amber-300 font-semibold mb-1">
          Пассивный доход = Недвижимость + Бизнес
        </div>
        <div className="text-xs text-slate-400">
          Когда пассивный доход {'>'}= расходов — вы выходите из крысиных бегов!
        </div>
      </motion.div>
    </div>
  )
}
