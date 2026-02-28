import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

export function ActionLog() {
  const log = useGameStore((s) => s.log)

  return (
    <div
      className="rounded-xl p-3 h-full overflow-hidden flex flex-col"
      style={{
        background: 'rgba(15, 17, 23, 0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex-shrink-0">
        📜 Журнал событий
      </div>
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence initial={false}>
          {log.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 text-xs"
            >
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{ background: entry.playerColor }}
              />
              <div className="text-slate-400 leading-relaxed">
                <span className="font-medium" style={{ color: entry.playerColor }}>
                  {entry.playerName}
                </span>{' '}
                {entry.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {log.length === 0 && (
          <div className="text-xs text-slate-600 text-center py-2">
            Пока нет событий
          </div>
        )}
      </div>
    </div>
  )
}
