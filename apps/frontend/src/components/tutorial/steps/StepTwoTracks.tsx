import { motion } from 'framer-motion'

export function StepTwoTracks() {
  return (
    <div className="flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-2 text-center"
      >
        Два трека
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-6 text-center"
      >
        Игровое поле состоит из двух колец
      </motion.p>

      {/* Mini SVG diagram */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="mb-6"
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Outer ring — Rat Race */}
          <motion.rect
            x="10" y="10" width="180" height="180" rx="16"
            fill="none" stroke="#6366f1" strokeWidth="3"
            strokeDasharray="720"
            initial={{ strokeDashoffset: 720 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
          <text x="100" y="30" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">
            КРЫСИНЫЕ БЕГА
          </text>

          {/* Inner ring — Fast Track */}
          <motion.circle
            cx="100" cy="110" r="50"
            fill="none" stroke="#f59e0b" strokeWidth="3"
            strokeDasharray="314"
            initial={{ strokeDashoffset: 314 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
          />
          <text x="100" y="108" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">
            БЫСТРЫЙ
          </text>
          <text x="100" y="120" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">
            ТРЕК
          </text>

          {/* Arrow from outer to inner */}
          <motion.path
            d="M 50 90 L 60 80"
            fill="none" stroke="#22c55e" strokeWidth="2"
            markerEnd="url(#arrowGreen)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          />
          <defs>
            <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 Z" fill="#22c55e" />
            </marker>
          </defs>
          <motion.text
            x="26" y="102"
            fill="#22c55e" fontSize="8" fontWeight="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            ВЫХОД!
          </motion.text>
        </svg>
      </motion.div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4 border border-indigo-500/20"
          style={{ background: 'rgba(99, 102, 241, 0.08)' }}
        >
          <div className="text-lg font-bold text-indigo-400 mb-2">🐀 Крысиные бега</div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li>Внешнее кольцо — 24 клетки</li>
            <li>Здесь вы начинаете игру</li>
            <li>Работайте и покупайте активы</li>
            <li>Бросаете 1 кубик</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4 border border-amber-500/20"
          style={{ background: 'rgba(245, 158, 11, 0.08)' }}
        >
          <div className="text-lg font-bold text-amber-400 mb-2">🚀 Быстрый трек</div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            <li>Внутреннее кольцо — 16 клеток</li>
            <li>Попадаете, когда доход {'>'} расходов</li>
            <li>Крупные сделки и мечты!</li>
            <li>Бросаете 2 кубика</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
