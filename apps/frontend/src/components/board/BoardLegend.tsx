import { useGameStore } from '../../store/gameStore'
import { getGameVariantModule } from '../../modules/game-variants'

export function BoardLegend() {
  const gameMode = useGameStore((s) => s.gameMode)
  const items = getGameVariantModule(gameMode).board.legendItems

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1 text-xs">
          <div
            className="w-4 h-4 rounded flex items-center justify-center text-xs flex-shrink-0"
            style={{ background: item.color, border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {item.icon}
          </div>
          <span className="text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
