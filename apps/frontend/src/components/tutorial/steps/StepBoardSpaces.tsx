import { motion } from 'framer-motion'

const spaces = [
  {
    icon: '💰',
    name: 'Зарплата',
    desc: 'Получите свой месячный денежный поток',
    bg: '#166534',
  },
  {
    icon: '🤝',
    name: 'Сделка',
    desc: 'Возможность купить актив (малая или крупная)',
    bg: '#1e40af',
  },
  {
    icon: '💸',
    name: 'Дудад',
    desc: 'Непредвиденный расход — вы теряете деньги',
    bg: '#7f1d1d',
  },
  {
    icon: '📈',
    name: 'Рынок',
    desc: 'Рыночное событие — можно продать активы',
    bg: '#78350f',
  },
  {
    icon: '👶',
    name: 'Ребёнок',
    desc: 'У вас ребёнок — ежемесячные расходы растут',
    bg: '#831843',
  },
  {
    icon: '🙏',
    name: 'Благотворительность',
    desc: 'Пожертвуйте 10% — бросайте 2 кубика 3 хода',
    bg: '#4c1d95',
  },
  {
    icon: '📉',
    name: 'Даунсайз',
    desc: 'Потеря работы — пропустите 2 хода и заплатите расходы',
    bg: '#1e293b',
  },
]

export function StepBoardSpaces() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Типы клеток
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-5 text-center"
      >
        Каждая клетка на доске имеет своё действие
      </motion.p>

      <div className="w-full grid grid-cols-2 gap-2.5">
        {spaces.map((space, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-start gap-2.5 rounded-xl p-2.5"
            style={{ background: 'rgba(45, 49, 84, 0.4)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{ background: space.bg }}
            >
              {space.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">{space.name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{space.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
