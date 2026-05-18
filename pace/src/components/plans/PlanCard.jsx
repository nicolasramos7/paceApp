import { motion } from 'framer-motion'
import { MapPin, Clock, Users } from 'lucide-react'

const typeColors = {
  outdoor: { bg: '#E8F7F0', icon: '#7DC9A0', dot: '#7DC9A0' },
  social: { bg: '#EAF3FB', icon: '#7BAFD4', dot: '#7BAFD4' },
  active: { bg: '#FEEFF2', icon: '#F2A0AE', dot: '#F2A0AE' },
  creative: { bg: '#EEECFB', icon: '#9B8ECD', dot: '#9B8ECD' },
  intellectual: { bg: '#FEF4DF', icon: '#F5C06B', dot: '#F5C06B' },
}

function AvatarCluster({ names, colors }) {
  return (
    <div className="flex -space-x-2">
      {(names || []).slice(0, 4).map((name, i) => (
        <div
          key={name}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
          style={{ backgroundColor: colors[i % colors.length] || '#9B8ECD', zIndex: names.length - i }}
        >
          {name[0]}
        </div>
      ))}
    </div>
  )
}

const avatarColors = ['#7DC9A0', '#9B8ECD', '#7BAFD4', '#F5C06B', '#F2A0AE']

export default function PlanCard({ plan, onAccept, onDecline, onCancel, status }) {
  const colors = typeColors[plan.activityType] || typeColors.social
  const accepted = status === 'accepted'
  const declined = status === 'declined'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-pace-card rounded-2xl shadow-card overflow-hidden transition-opacity ${
        declined ? 'opacity-40' : ''
      }`}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: colors.dot }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-pace-text font-semibold text-sm leading-snug">{plan.title}</h3>
            <p className="text-pace-secondary text-xs mt-1 leading-relaxed">{plan.description}</p>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: colors.bg }}
          >
            <Users size={18} style={{ color: colors.icon }} strokeWidth={1.8} />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-pace-muted" />
            <span className="text-pace-muted text-xs">{plan.suggestedTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-pace-muted" />
            <span className="text-pace-muted text-xs">{plan.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <AvatarCluster names={plan.participantNames} colors={avatarColors} />
          <span className="text-pace-muted text-xs">
            {plan.participantNames.length + (accepted ? 1 : 0)} people joining
          </span>
        </div>

        {!accepted && !declined && (
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 py-2.5 rounded-xl border border-pace-border text-pace-secondary text-sm font-medium active:bg-pace-bg transition-colors"
            >
              Not for me
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 rounded-xl bg-pace-green text-white text-sm font-medium active:opacity-90 transition-opacity"
            >
              I'm in
            </button>
          </div>
        )}

        {accepted && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-pace-green-light">
              <div className="w-4 h-4 rounded-full bg-pace-green flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-pace-green text-sm font-medium">You're joining</span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full py-2 text-pace-muted text-xs font-medium active:text-pace-rose transition-colors"
              >
                Cancel plan
              </button>
            )}
          </div>
        )}

        {declined && (
          <div className="flex items-center justify-center py-2.5">
            <span className="text-pace-muted text-sm">Skipped</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
