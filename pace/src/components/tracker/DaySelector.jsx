import { useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'

let savedScrollLeft = null

function getDays() {
  const today = new Date()
  const days = []
  for (let i = -30; i <= 2; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
      isFuture: i > 0,
    })
  }
  return days
}

export default function DaySelector() {
  const selectedDate = useStore((s) => s.selectedDate)
  const setSelectedDate = useStore((s) => s.setSelectedDate)
  const days = getDays()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!scrollRef.current) return
    if (savedScrollLeft !== null) {
      scrollRef.current.scrollLeft = savedScrollLeft
    } else {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [])

  const handleScroll = () => {
    if (scrollRef.current) savedScrollLeft = scrollRef.current.scrollLeft
  }

  return (
    <div className="bg-pace-card border-b border-pace-border py-3">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide px-4 gap-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        {days.map(({ date, dayName, dayNum, isToday, isFuture }) => {
          const isSelected = date === selectedDate
          return (
            <button
              key={date}
              onClick={() => !isFuture && setSelectedDate(date)}
              disabled={isFuture}
              className={`flex flex-col items-center gap-1 flex-shrink-0 w-12 py-1 rounded-2xl transition-all duration-150 ${
                isFuture ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: isFuture ? '#C5C5C5' : undefined }}
              >
                {dayName}
              </span>
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 ${
                  isSelected && !isFuture
                    ? 'bg-pace-green'
                    : isToday
                    ? 'bg-pace-green-light'
                    : ''
                }`}
              >
                <span
                  className={`text-sm font-semibold ${
                    isSelected && !isFuture
                      ? 'text-white'
                      : isToday
                      ? 'text-pace-green'
                      : 'text-pace-text'
                  }`}
                  style={{ color: isFuture ? '#C5C5C5' : undefined }}
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
