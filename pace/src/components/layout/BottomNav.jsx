import { NavLink } from 'react-router-dom'
import { CalendarDays, Compass, User } from 'lucide-react'

const tabs = [
  { to: '/today', label: 'Today', Icon: CalendarDays },
  { to: '/plans', label: 'Plans', Icon: Compass },
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function BottomNav() {
  return (
    <nav className="flex items-center justify-around px-4 py-3 bg-pace-card border-t border-pace-border">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className="flex-1 flex justify-center">
          {({ isActive }) => (
            <div
              className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 ${
                isActive ? 'bg-pace-nav' : ''
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? 'text-pace-green' : 'text-pace-muted'}
              />
              <span
                className={`text-[11px] font-medium ${
                  isActive ? 'text-pace-green' : 'text-pace-muted'
                }`}
              >
                {label}
              </span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
