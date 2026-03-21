import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onStart: () => void
  onSkip: () => void
}

export function TutorialPromptModal({ open, onStart, onSkip }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: 'rgba(8, 10, 20, 0.72)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 210, damping: 20 }}
            className="w-full max-w-lg rounded-3xl border p-6 sm:p-7"
            style={{
              background: 'linear-gradient(180deg, rgba(20,24,40,0.96), rgba(12,16,30,0.98))',
              borderColor: 'rgba(99, 102, 241, 0.2)',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.45)',
            }}
          >
            <div className="flex items-center gap-4 mb-5">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(245,158,11,0.2))' }}
                animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎓
              </motion.div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-indigo-300 mb-1">
                  Первый вход
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Пройти короткое обучение?
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Покажем основы игры: что такое денежный поток, как работают активы, расходы, клетки поля и как быстрее выйти на быстрый трек.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                'Денежный поток и пассивный доход',
                'Что покупать и где смотреть показатели',
                'Путь к победе без лишней путаницы',
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.08 }}
                  className="rounded-2xl p-3 text-xs text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {item}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStart}
                className="btn-primary flex-1"
              >
                Пройти обучение
              </motion.button>
              <button
                onClick={onSkip}
                className="btn-ghost flex-1"
              >
                Позже
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
