import { useStore } from '../../store/useStore'

const dotColors = {
  sleep: 'bg-pace-purple',
  movement: 'bg-pace-blue',
  meals: 'bg-pace-orange',
  activity: 'bg-pace-green',
  social: 'bg-pace-rose',
  outsideTime: 'bg-pace-amber',
}

const summaryLabels = {
  sleep: {
    good: 'Got a good night of rest',
    low: 'Slept fewer hours than usual',
    high: 'Longer sleep than usual',
  },
  movement: {
    outside: 'Went outside today',
    short: 'Took a short trip',
    stayed: 'Stayed home today',
  },
  activity: {
    productive: 'Productive day',
    light: 'Light productivity',
    low: 'Low energy day',
  },
  social: {
    conversations: 'Had conversations today',
    minimal: 'Minimal social interaction',
    alone: 'Mostly by myself today',
  },
  outsideTime: {
    none: 'No time outside',
    short: 'Short time outdoors',
    moderate: 'Some time outside',
    long: 'Lots of time outdoors',
  },
}

function getMealsSummary(meals) {
  if (!meals) return null
  const entries = Object.entries(meals).filter(([, v]) => v?.type)
  if (!entries.length) return null
  const nonSkipped = entries.filter(([, v]) => v.type !== 'skipped')
  if (!nonSkipped.length) return 'Skipped all meals'
  return nonSkipped
    .map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}${v.description ? `: ${v.description}` : ''}`)
    .join(' · ')
}

export default function TodaySummary({ log, insight }) {
  const selectedDate = useStore((s) => s.selectedDate)
  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  const entries = Object.entries(summaryLabels)
    .filter(([key]) => log[key])
    .map(([key]) => ({
      key,
      label: summaryLabels[key][log[key]] || log[key],
      color: dotColors[key],
    }))

  const mealsSummary = getMealsSummary(log.meals)
  if (mealsSummary) {
    entries.push({ key: 'meals', label: mealsSummary, color: dotColors.meals })
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-pace-text font-semibold text-base">
          {isToday ? 'Today' : selectedDate}
        </h2>
        {entries.length > 0 && (
          <div className="w-2 h-2 rounded-full bg-pace-green" />
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-pace-muted text-sm">Start tracking to see your day take shape.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
              <span className="text-pace-secondary text-sm">{label}</span>
            </div>
          ))}
        </div>
      )}

      {insight && (
        <div className="mt-4 pt-4 border-t border-pace-border">
          <p className="text-pace-secondary text-sm leading-relaxed italic">{insight}</p>
        </div>
      )}
    </div>
  )
}
