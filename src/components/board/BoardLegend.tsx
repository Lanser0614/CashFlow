export function BoardLegend() {
  const items = [
    { color: '#166534', icon: '💰', label: 'Зарплата' },
    { color: '#1e40af', icon: '🤝', label: 'Сделка' },
    { color: '#7f1d1d', icon: '💸', label: 'Дудад' },
    { color: '#78350f', icon: '📈', label: 'Рынок' },
    { color: '#831843', icon: '👶', label: 'Ребёнок' },
    { color: '#4c1d95', icon: '🙏', label: 'Благотворит.' },
    { color: '#1e293b', icon: '📉', label: 'Даунсайз' },
  ]

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
