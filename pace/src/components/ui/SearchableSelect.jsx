import { useState, useEffect, useRef } from 'react'

export default function SearchableSelect({ value, onChange, options, placeholder }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = (() => {
    if (!query) return options
    const q = query.toLowerCase()
    const starts = options.filter((o) => o.toLowerCase().startsWith(q))
    const contains = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q))
    return [...starts, ...contains]
  })()

  const handleSelect = (option) => {
    onChange(option)
    setQuery(option)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(''); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-3 rounded-xl bg-pace-bg border border-pace-border text-pace-text text-sm placeholder-pace-muted outline-none focus:border-pace-green transition-colors"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-pace-border rounded-xl shadow-lg max-h-44 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <button
                key={option}
                onMouseDown={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  option === value
                    ? 'text-pace-green bg-pace-green-light font-medium'
                    : 'text-pace-text hover:bg-pace-bg'
                }`}
              >
                {option}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-pace-muted text-sm">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}
