import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StepWelcome } from './steps/StepWelcome'
import { StepTwoTracks } from './steps/StepTwoTracks'
import { StepFinancialStatement } from './steps/StepFinancialStatement'
import { StepGlossary } from './steps/StepGlossary'
import { StepProfessions } from './steps/StepProfessions'
import { StepTurnFlow } from './steps/StepTurnFlow'
import { StepBoardSpaces } from './steps/StepBoardSpaces'
import { StepDealsAssets } from './steps/StepDealsAssets'
import { StepWinCondition } from './steps/StepWinCondition'

const STEPS = [
  { title: 'Добро пожаловать', component: StepWelcome },
  { title: 'Два трека', component: StepTwoTracks },
  { title: 'Финансовый отчёт', component: StepFinancialStatement },
  { title: 'Быстрый словарь', component: StepGlossary },
  { title: 'Выбор профессии', component: StepProfessions },
  { title: 'Ход игры', component: StepTurnFlow },
  { title: 'Типы клеток', component: StepBoardSpaces },
  { title: 'Сделки и активы', component: StepDealsAssets },
  { title: 'Как победить', component: StepWinCondition },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

interface Props {
  onClose: () => void
}

export function TutorialScreen({ onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)

  const goNext = useCallback(() => {
    if (currentStep === STEPS.length - 1) {
      onClose()
      return
    }
    setDirection(1)
    setCurrentStep((prev) => prev + 1)
  }, [currentStep, onClose])

  const goPrev = useCallback(() => {
    if (currentStep === 0) return
    setDirection(-1)
    setCurrentStep((prev) => prev - 1)
  }, [currentStep])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, onClose])

  const CurrentStepComponent = STEPS[currentStep].component
  const isLastStep = currentStep === STEPS.length - 1

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)' }}
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              background: i % 2 === 0 ? '#6366f1' : '#f59e0b',
              left: `${10 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
            transition={{ duration: 4 + i, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Top bar: step counter + skip */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500">
            {currentStep + 1} / {STEPS.length}
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1 rounded-lg
              border border-white/5 hover:border-white/10"
          >
            Пропустить
          </button>
        </div>

        {/* Content panel */}
        <div
          className="glass-panel p-6 overflow-hidden"
          style={{ minHeight: '460px' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <CurrentStepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between mt-5">
          {/* Prev button */}
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="btn-ghost text-sm disabled:opacity-0 disabled:pointer-events-none"
          >
            ← Назад
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setDirection(i > currentStep ? 1 : -1)
                  setCurrentStep(i)
                }}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  background: i === currentStep ? '#6366f1' : 'rgba(255,255,255,0.15)',
                }}
                animate={i === currentStep ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>

          {/* Next / Start button */}
          {isLastStep ? (
            <motion.button
              onClick={onClose}
              className="btn-success text-sm px-6"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Играть! 🎲
            </motion.button>
          ) : (
            <button onClick={goNext} className="btn-primary text-sm">
              Далее →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
