import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const suggestions = [
  'taken a walk outside',
  'called a friend',
  'tried a new café',
  'joined a yoga class',
  'visited a museum',
  'cooked something new',
  'read for a while',
  'gone cycling',
  'attended a local event',
  'explored a new neighbourhood',
]

export default function WouldveLiked({ items, onChange, readOnly }) {
  const [inputOpen, setInputOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')

  const addItem = (text) => {
    const trimmed = text.trim()
    if (!trimmed || items.includes(trimmed)) return
    onChange([...items, trimmed])
    setInputVal('')
    setInputOpen(false)
  }

  const removeItem = (item) => {
    onChange(items.filter((i) => i !== item))
  }

  const availableSuggestions = suggestions.filter((s) => !items.includes(s))

  return (
    <div className="mx-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-pace-text font-semibold text-base">Would've Liked</h3>
          <p className="text-pace-muted text-xs mt-0.5">Things you wished you had done today</p>
        </div>
        {!readOnly && (
          <button
            onClick={() => setInputOpen(true)}
            className="w-8 h-8 bg-pace-green-light rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus size={16} className="text-pace-green" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 bg-pace-card border border-pace-border rounded-full px-3 py-1.5 shadow-card"
            >
              <span className="text-pace-text text-xs font-medium">{item}</span>
              {!readOnly && (
                <button onClick={() => removeItem(item)} className="text-pace-muted hover:text-pace-rose transition-colors">
                  <X size={12} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && !inputOpen && (
          <p className="text-pace-muted text-sm">Nothing added yet.</p>
        )}
      </div>

      <AnimatePresence>
        {inputOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 bg-pace-card rounded-2xl shadow-card p-4"
          >
            <div className="flex gap-2">
              <input
                autoFocus
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem(inputVal)}
                placeholder="e.g. taken a walk outside"
                className="flex-1 text-sm text-pace-text placeholder-pace-muted bg-pace-bg rounded-xl px-3 py-2 outline-none border border-pace-border focus:border-pace-green transition-colors"
              />
              <button
                onClick={() => addItem(inputVal)}
                className="px-4 py-2 bg-pace-green text-white text-sm font-medium rounded-xl active:scale-95 transition-transform"
              >
                Add
              </button>
            </div>

            {availableSuggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-pace-muted text-xs mb-2">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {availableSuggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      onClick={() => addItem(s)}
                      className="text-xs text-pace-secondary bg-pace-bg border border-pace-border rounded-full px-3 py-1 active:bg-pace-green-light active:border-pace-green active:text-pace-green transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setInputOpen(false); setInputVal('') }}
              className="mt-3 text-pace-muted text-xs"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
