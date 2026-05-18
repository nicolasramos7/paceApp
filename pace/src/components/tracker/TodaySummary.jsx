import { useStore } from '../../store/useStore'

const dotColors = {
  sleep: 'bg-pace-purple',
  movement: 'bg-pace-blue',
  food: 'bg-pace-orange',
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
  food: {
    home: 'Cooked at home',
    mixed: 'Mixed meals today',
    convenience: 'Convenience food day',
    skipped: 'Skipped some meals',
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

  return (
    <div className="bg-pace-card rounded-2xl shadow-card mx-4 px-5 py-5">
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
