import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'

const MEALS = [
  { key: 'breakfast', label: 'Breakfast', time: 'Morning' },
  { key: 'lunch',     label: 'Lunch',     time: 'Midday'  },
  { key: 'dinner',    label: 'Dinner',    time: 'Evening' },
  { key: 'snacks',    label: 'Snacks',    time: 'Anytime' },
]

const TYPES = [
  { value: 'homemade', label: 'Homemade', color: '#7DC9A0', bg: '#E8F7F0' },
  { value: 'premade',  label: 'Premade',  color: '#F0976A', bg: '#FEF0E7' },
  { value: 'skipped',  label: 'Skipped',  color: '#9CA3AF', bg: '#F4F4F8' },
]

export default function MealsModal({ open, onClose, value, onChange }) {
  const [local, setLocal] = useState({})
  const [active, setActive] = useState(null)
  const [desc, setDesc] = useState('')

  useEffect(() => {
    if (open) {
      setLocal(value || {})
      setActive(null)
      setDesc('')
    }
  }, [open])

  const selectMeal = (key) => {
    setActive(key)
    setDesc(local[key]?.description || '')
  }

  const setType = (type) => {
    setLocal((prev) => ({
      ...prev,
      [active]: { type, description: type === 'skipped' ? '' : desc },
    }))
  }

  const handleDescChange = (val) => {
    setDesc(val)
    setLocal((prev) => ({
      ...prev,
      [active]: { ...(prev[active] || {}), description: val },
    }))
  }

  const saveActive = () => {
    onChange(local)
    setActive(null)
  }

  const done = () => {
    onChange(local)
    onClose()
  }

  const activeMealData = active ? (local[active] || {}) : {}
  const activeLabel = active ? MEALS.find((m) => m.key === active)?.label : ''

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-20"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute bottom-0 left-0 right-0 bg-pace-bg rounded-t-3xl z-30"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-pace-border">
              {active ? (
                <button
                  onClick={() => setActive(null)}
                  className="flex items-center gap-1.5 text-pace-secondary"
                >
                  <ChevronLeft size={18} />
                  <span className="text-sm font-medium">{activeLabel}</span>
                </button>
              ) : (
                <h3 className="text-pace-text font-semibold text-base">Meals</h3>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-pace-card"
              >
                <X size={16} className="text-pace-secondary" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!active ? (
                /* ── Overview: 4 meal cards ── */
                <motion.div
                  key="overview"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-5 py-4 flex flex-col gap-3"
                >
                  {MEALS.map(({ key, label, time }) => {
                    const data = local[key]
                    const typeInfo = data ? TYPES.find((t) => t.value === data.type) : null
                    return (
                      <button
                        key={key}
                        onClick={() => selectMeal(key)}
                        className="w-full flex items-center justify-between px-4 py-4 bg-pace-card rounded-2xl shadow-card active:scale-[0.98] transition-transform"
                      >
                        <div className="text-left">
                          <p className="text-pace-text font-medium text-sm">{label}</p>
                          <p className="text-pace-muted text-xs mt-0.5">
                            {data
                              ? data.type === 'skipped'
                                ? 'Skipped'
                                : `${typeInfo?.label}${data.description ? ` · ${data.description}` : ''}`
                              : time}
                          </p>
                        </div>
                        {typeInfo && (
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                          >
                            {typeInfo.label}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  <button
                    onClick={done}
                    className="mt-1 mb-3 w-full py-3.5 bg-pace-green text-white font-semibold rounded-xl active:opacity-80 transition-opacity"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                /* ── Detail: type + description ── */
                <motion.div
                  key={active}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-5 py-4 flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-2">
                    {TYPES.map(({ value: tval, label }) => {
                      const selected = activeMealData.type === tval
                      return (
                        <button
                          key={tval}
                          onClick={() => setType(tval)}
                          className={`w-full px-4 py-3.5 rounded-2xl border-2 text-left font-medium text-sm transition-all ${
                            selected
                              ? 'border-pace-green bg-pace-green-light text-pace-green'
                              : 'border-pace-border bg-white text-pace-text active:bg-pace-bg'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {activeMealData.type && activeMealData.type !== 'skipped' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <p className="text-pace-muted text-xs mb-2">What did you have?</p>
                        <input
                          autoFocus
                          value={desc}
                          onChange={(e) => handleDescChange(e.target.value)}
                          placeholder="e.g. eggs and toast, salad with chicken..."
                          className="w-full px-4 py-3 rounded-xl bg-pace-bg border border-pace-border text-pace-text text-sm placeholder-pace-muted outline-none focus:border-pace-green transition-colors"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={saveActive}
                    disabled={!activeMealData.type}
                    className="w-full py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 active:opacity-80 transition-opacity"
                  >
                    Save
                  </button>
                  <div className="pb-2" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
