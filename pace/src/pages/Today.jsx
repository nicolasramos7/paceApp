import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon, Sun, Utensils, Zap, Users, Footprints, Plus, X,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import BottomNav from '../components/layout/BottomNav'
import DaySelector from '../components/tracker/DaySelector'
import TodaySummary from '../components/tracker/TodaySummary'
import TrackerItem from '../components/tracker/TrackerItem'
import TrackModal from '../components/tracker/TrackModal'
import MealsModal from '../components/tracker/MealsModal'
import WouldveLiked from '../components/tracker/WouldveLiked'
import { analyzeDayLog } from '../lib/openai'

const TRACKER_CONFIG = [
  {
    key: 'sleep',
    icon: Moon,
    iconBg: '#EEECFB',
    iconColor: '#9B8ECD',
    title: 'Sleep',
    subtitle: 'Hours of rest',
    options: [
      { value: 'good', label: 'Good', description: '7 to 9 hours', Icon: Moon, iconBg: '#EEECFB', iconColor: '#9B8ECD' },
      { value: 'low', label: 'Low', description: 'Under 6 hours', Icon: Moon, iconBg: '#FEF4DF', iconColor: '#F5C06B' },
      { value: 'high', label: 'High', description: 'Over 9 hours', Icon: Moon, iconBg: '#EAF3FB', iconColor: '#7BAFD4' },
    ],
  },
  {
    key: 'movement',
    icon: Footprints,
    iconBg: '#EAF3FB',
    iconColor: '#7BAFD4',
    title: 'Movement',
    subtitle: 'How you moved today',
    options: [
      { value: 'outside', label: 'Went outside', description: 'Left home at some point', Icon: Footprints, iconBg: '#E8F7F0', iconColor: '#7DC9A0' },
      { value: 'short', label: 'Short trip', description: 'A brief outing', Icon: Footprints, iconBg: '#FEF4DF', iconColor: '#F5C06B' },
      { value: 'stayed', label: 'Stayed in', description: 'Mostly at home', Icon: Footprints, iconBg: '#FEEFF2', iconColor: '#F2A0AE' },
    ],
  },
  {
    key: 'meals',
    icon: Utensils,
    iconBg: '#FEF0E7',
    iconColor: '#F0976A',
    title: 'Meals',
    subtitle: 'What you ate today',
    options: [],
  },
  {
    key: 'activity',
    icon: Zap,
    iconBg: '#EEECFB',
    iconColor: '#9B8ECD',
    title: 'Activity',
    subtitle: 'Energy and productivity',
    options: [
      { value: 'productive', label: 'Productive', description: 'Got things done', Icon: Zap, iconBg: '#E8F7F0', iconColor: '#7DC9A0' },
      { value: 'light', label: 'Light productivity', description: 'Some things done', Icon: Zap, iconBg: '#FEF4DF', iconColor: '#F5C06B' },
      { value: 'low', label: 'Low energy day', description: 'Restful and slow', Icon: Zap, iconBg: '#FEEFF2', iconColor: '#F2A0AE' },
    ],
  },
  {
    key: 'social',
    icon: Users,
    iconBg: '#FEEFF2',
    iconColor: '#F2A0AE',
    title: 'Social',
    subtitle: 'Interactions today',
    options: [
      { value: 'conversations', label: 'Conversations had', description: 'Meaningful exchanges', Icon: Users, iconBg: '#E8F7F0', iconColor: '#7DC9A0' },
      { value: 'minimal', label: 'Minimal interaction', description: 'Brief contact with others', Icon: Users, iconBg: '#FEF4DF', iconColor: '#F5C06B' },
      { value: 'alone', label: 'Mostly alone', description: 'Solo day', Icon: Users, iconBg: '#FEEFF2', iconColor: '#F2A0AE' },
    ],
  },
  {
    key: 'outsideTime',
    icon: Sun,
    iconBg: '#FEF4DF',
    iconColor: '#F5C06B',
    title: 'Outside Time',
    subtitle: 'Hours spent outdoors',
    options: [
      { value: 'none', label: 'None', description: 'Did not go outside', Icon: Sun, iconBg: '#FEEFF2', iconColor: '#F2A0AE' },
      { value: 'short', label: 'Short', description: 'Under 30 minutes', Icon: Sun, iconBg: '#FEF4DF', iconColor: '#F5C06B' },
      { value: 'moderate', label: 'Moderate', description: '30 min to 2 hours', Icon: Sun, iconBg: '#EAF3FB', iconColor: '#7BAFD4' },
      { value: 'long', label: 'Long', description: 'Over 2 hours', Icon: Sun, iconBg: '#E8F7F0', iconColor: '#7DC9A0' },
    ],
  },
]

export default function Today() {
  const user = useStore((s) => s.user)
  const selectedDate = useStore((s) => s.selectedDate)
  const log = useStore((s) => s.logs[selectedDate] || {})
  const updateLog = useStore((s) => s.updateLog)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0]
  const isToday = selectedDate === today
  const isReadOnly = selectedDate !== today && selectedDate !== yesterday

  const [openModal, setOpenModal] = useState(null)
  const [mealsOpen, setMealsOpen] = useState(false)
  const [momentInput, setMomentInput] = useState('')
  const [momentOpen, setMomentOpen] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const mealsLogged = log.meals && Object.values(log.meals).some((m) => m?.type)
  const mealsDisplay = (() => {
    if (!log.meals) return null
    const entries = Object.entries(log.meals).filter(([, v]) => v?.type)
    if (!entries.length) return null
    const nonSkipped = entries.filter(([, v]) => v.type !== 'skipped')
    if (!nonSkipped.length) return 'All skipped'
    return nonSkipped.map(([k]) => k[0].toUpperCase() + k.slice(1)).join(', ')
  })()

  const loggedCount = TRACKER_CONFIG.filter((c) =>
    c.key === 'meals' ? mealsLogged : log[c.key]
  ).length

  useEffect(() => {
    if (isToday && loggedCount >= 3 && !log.insight && !analyzing) {
      setAnalyzing(true)
      analyzeDayLog(log, user).then((result) => {
        updateLog(selectedDate, {
          insight: result.insight,
          suggestion: result.suggestion,
          activityBalance: result.activityBalance,
          socialFulfillment: result.socialFulfillment,
          aiTags: result.tags,
        })
        setAnalyzing(false)
      })
    }
  }, [loggedCount, selectedDate])

  const handleTrack = (key, value) => {
    updateLog(selectedDate, { [key]: value })
    setOpenModal(null)
    if (log.insight) {
      updateLog(selectedDate, { insight: null })
    }
  }

  const addMoment = () => {
    if (!momentInput.trim()) return
    const moments = log.moments || []
    updateLog(selectedDate, { moments: [...moments, momentInput.trim()] })
    setMomentInput('')
    setMomentOpen(false)
  }

  const removeMoment = (i) => {
    const moments = (log.moments || []).filter((_, idx) => idx !== i)
    updateLog(selectedDate, { moments })
  }

  return (
    <div className="flex flex-col h-full bg-pace-bg">
      <div className="flex-1 overflow-y-auto scrollbar-hide phone-scroll pb-4">
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <p className="text-pace-muted text-xs font-medium uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-pace-text text-2xl font-bold">Day to Day</h1>
        </div>

        {/* Day selector */}
        <div className="sticky top-0 z-10 mb-2">
          <DaySelector />
        </div>

        {/* Today summary */}
        <div className="mb-4">
          <TodaySummary log={log} insight={log.insight} />
        </div>

        {/* Analyzing indicator */}
        {analyzing && (
          <div className="mx-4 mb-4 px-4 py-3 bg-pace-green-light rounded-2xl flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-pace-green border-t-transparent rounded-full animate-spin" />
            <span className="text-pace-green text-sm">Reflecting on your day...</span>
          </div>
        )}

        {/* Track Your Day */}
        <div className="px-4 mb-6">
          <h2 className="text-pace-text font-semibold text-base mb-3">Track Your Day</h2>
          <div className="flex flex-col gap-3">
            {TRACKER_CONFIG.map((config) => (
              <TrackerItem
                key={config.key}
                {...config}
                value={config.key === 'meals' ? null : log[config.key]}
                valueDisplay={config.key === 'meals' ? mealsDisplay : undefined}
                onClick={() => {
                  if (isReadOnly) return
                  config.key === 'meals' ? setMealsOpen(true) : setOpenModal(config.key)
                }}
              />
            ))}
          </div>
        </div>

        {/* Add a Moment */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-pace-text font-semibold text-base">Add a Moment</h3>
              <p className="text-pace-muted text-xs mt-0.5">A note from your day</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setMomentOpen(true)}
                className="w-8 h-8 bg-pace-blue-light rounded-full flex items-center justify-center"
              >
                <Plus size={16} className="text-pace-blue" />
              </button>
            )}
          </div>
          {(log.moments || []).length === 0 && !momentOpen && (
            <p className="text-pace-muted text-sm">Nothing added yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {(log.moments || []).map((m, i) => (
              <div key={i} className="bg-pace-card rounded-xl px-4 py-3 flex items-center justify-between shadow-card">
                <span className="text-pace-text text-sm">{m}</span>
                {!isReadOnly && (
                  <button onClick={() => removeMoment(i)}>
                    <X size={14} className="text-pace-muted" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <AnimatePresence>
            {momentOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-3 bg-pace-card rounded-2xl shadow-card p-4"
              >
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={momentInput}
                    onChange={(e) => setMomentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMoment()}
                    placeholder="Something worth remembering..."
                    className="flex-1 text-sm text-pace-text placeholder-pace-muted bg-pace-bg rounded-xl px-3 py-2 outline-none border border-pace-border focus:border-pace-blue transition-colors"
                  />
                  <button
                    onClick={addMoment}
                    className="px-4 py-2 bg-pace-blue text-white text-sm font-medium rounded-xl"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={() => { setMomentOpen(false); setMomentInput('') }}
                  className="mt-2 text-pace-muted text-xs"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Would've Liked */}
        <div className="mb-8">
          <WouldveLiked
            items={log.wouldveLiked || []}
            onChange={(items) => updateLog(selectedDate, { wouldveLiked: items })}
            readOnly={isReadOnly}
          />
        </div>

        {/* Suggestion */}
        {log.suggestion && (
          <div className="mx-4 mb-6 px-5 py-4 bg-pace-card rounded-2xl shadow-card border-l-4 border-pace-green">
            <p className="text-pace-muted text-xs font-medium uppercase tracking-wide mb-1">For tomorrow</p>
            <p className="text-pace-secondary text-sm leading-relaxed">{log.suggestion}</p>
          </div>
        )}
      </div>

      {/* Tracker modals */}
      {TRACKER_CONFIG.filter((c) => c.key !== 'meals').map((config) => (
        <TrackModal
          key={config.key}
          open={openModal === config.key}
          onClose={() => setOpenModal(null)}
          title={config.title}
          options={config.options}
          value={log[config.key]}
          onChange={(val) => handleTrack(config.key, val)}
        />
      ))}
      <MealsModal
        open={mealsOpen}
        onClose={() => setMealsOpen(false)}
        value={log.meals}
        onChange={(meals) => updateLog(selectedDate, { meals })}
      />

      <BottomNav />
    </div>
  )
}
