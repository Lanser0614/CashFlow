import { motion } from 'framer-motion'

const terms = [
  {
    icon: '💵',
    title: 'Кэш',
    description: 'Деньги на руках. Ими вы оплачиваете первый взнос, карты-сюрпризы и закрываете кассовые разрывы.',
    accent: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.08)',
  },
  {
    icon: '📥',
    title: 'Пассивный доход',
    description: 'Ежемесячные поступления от активов: недвижимости, бизнеса и некоторых специальных позиций.',
    accent: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.08)',
  },
  {
    icon: '📤',
    title: 'Расходы',
    description: 'Обязательные платежи: налоги, кредиты, ипотека, дети и прочие личные траты.',
    accent: '#f87171',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
  {
    icon: '⚖️',
    title: 'Денежный поток',
    description: 'Главный показатель игры: доходы минус расходы. Чем он выше, тем быстрее вы выходите из Rat Race.',
    accent: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
]

const rulePoints = [
  'Активы обычно увеличивают пассивный доход или рыночную стоимость портфеля.',
  'Пассивы и doodad-карты уменьшают кэш и могут ухудшать денежный поток.',
  'Высокая зарплата помогает стартовать, но побеждает не зарплата, а устойчивый денежный поток.',
]

export function StepGlossary() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Быстрый словарь
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-5 text-center"
      >
        Что за что отвечает в игре
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {terms.map((term, index) => (
          <motion.div
            key={term.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.12 }}
            className="rounded-xl p-4 border"
            style={{ background: term.bg, borderColor: `${term.accent}33` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{term.icon}</span>
              <div>
                <div className="text-sm font-bold mb-1" style={{ color: term.accent }}>
                  {term.title}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {term.description}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full rounded-xl p-4 mt-5 border border-indigo-500/20"
        style={{ background: 'rgba(99, 102, 241, 0.08)' }}
      >
        <div className="text-sm font-semibold text-indigo-300 mb-2">
          Логика игры в одной цепочке
        </div>
        <div className="text-xs text-slate-300 mb-3">
          Покупаете активы → растёт пассивный доход → увеличивается денежный поток → проще выбраться на быстрый трек.
        </div>
        <div className="space-y-2">
          {rulePoints.map((point, index) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.95 + index * 0.12 }}
              className="text-xs text-slate-400 flex items-start gap-2"
            >
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{point}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
