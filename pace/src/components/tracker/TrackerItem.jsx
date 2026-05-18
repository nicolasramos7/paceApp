import { ChevronRight } from 'lucide-react'

const valueLabels = {
  // Sleep
  good: '7-9h',
  low: '<6h',
  high: '>9h',
  // Movement
  outside: 'Outside',
  short: 'Short trip',
  stayed: 'Stayed in',
  // Food
  home: 'Home cooked',
  mixed: 'Mixed',
  convenience: 'Convenience',
  skipped: 'Skipped',
  // Activity
  productive: 'Productive',
  light: 'Light',
  // Social
  conversations: 'Social',
  minimal: 'Minimal',
  alone: 'Solo',
  // Outside time
  none: 'None',
  moderate: 'Moderate',
  long: 'Long',
}

export default function TrackerItem({ icon: Icon, iconBg, iconColor, title, subtitle, fieldKey, value, onClick }) {
  const displayValue = value ? (valueLabels[value] || value) : null

  return (
    <button
      onClick={onClick}
      className="w-full bg-pace-card rounded-2xl shadow-card px-4 py-4 flex items-center gap-4 active:scale-[0.98] transition-transform duration-100"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-pace-text font-medium text-sm">{title}</p>
        <p className="text-pace-muted text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {displayValue && (
          <span className="text-pace-blue text-sm font-medium">{displayValue}</span>
        )}
        <ChevronRight size={16} className="text-pace-muted" />
      </div>
    </button>
  )
}
