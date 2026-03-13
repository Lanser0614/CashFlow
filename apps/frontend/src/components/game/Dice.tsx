import { motion, AnimatePresence } from 'framer-motion'

interface DiceProps {
  values: number[]
  rolling?: boolean
}

const DICE_DOTS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 20 }, { x: 75, y: 20 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 80 }, { x: 75, y: 80 }],
}

function SingleDie({ value, rolling }: { value: number; rolling?: boolean }) {
  const dots = DICE_DOTS[value] ?? DICE_DOTS[1]

  return (
    <motion.div
      className="relative w-16 h-16 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
      animate={rolling ? {
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.15, 0.9, 1.1, 1],
      } : {
        rotate: 0,
        scale: 1,
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={8}
            fill="#1e293b"
          />
        ))}
      </svg>
    </motion.div>
  )
}

export function Dice({ values, rolling }: DiceProps) {
  if (values.length === 0 && !rolling) return null

  const displayValues = values.length > 0 ? values : [1]
  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <AnimatePresence mode="wait">
          {displayValues.map((v, i) => (
            <motion.div
              key={`die-${i}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <SingleDie value={v} rolling={rolling} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {values.length > 0 && !rolling && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold"
          style={{ color: '#f59e0b' }}
        >
          {values.length > 1 ? `${values.join(' + ')} = ${total}` : `Выпало: ${total}`}
        </motion.div>
      )}
    </div>
  )
}
