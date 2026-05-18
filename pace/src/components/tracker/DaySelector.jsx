import { useStore } from '../../store/useStore'

function getWeekDays() {
  const today = new Date()
  const days = []
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
    })
  }
  return days
}

export default function DaySelector() {
  const selectedDate = useStore((s) => s.selectedDate)
  const setSelectedDate = useStore((s) => s.setSelectedDate)
  const days = getWeekDays()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-pace-card rounded-2xl shadow-card mx-4 px-2 py-4">
      <div className="flex items-center justify-between">
        {days.map(({ date, dayName, dayNum, isToday }) => {
          const isSelected = date === selectedDate
          const isFuture = date > today
          return (
            <button
              key={date}
              onClick={() => !isFuture && setSelectedDate(date)}
              disabled={isFuture}
              className={`flex flex-col items-center gap-1 w-10 py-1 rounded-2xl transition-all duration-150 ${
                isFuture ? 'opacity-30 cursor-default' : 'cursor-pointer'
              }`}
            >
              <span className="text-[11px] font-medium text-pace-muted uppercase tracking-wide">
                {dayName}
              </span>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 ${
                  isSelected
                    ? 'bg-pace-green'
                    : isToday
                    ? 'bg-pace-green-light'
                    : ''
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    isSelected
                      ? 'text-white'
                      : isToday
                      ? 'text-pace-green'
                      : 'text-pace-text'
                  }`}
                >
                  {dayNum}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
