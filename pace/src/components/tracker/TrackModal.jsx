import Modal from '../ui/Modal'

export default function TrackModal({ open, onClose, title, options, value, onChange }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); onClose() }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all duration-150 ${
                selected
                  ? 'border-pace-green bg-pace-green-light'
                  : 'border-pace-border bg-white active:bg-pace-bg'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: opt.iconBg || '#F4F4F8' }}
              >
                <opt.Icon size={18} style={{ color: opt.iconColor || '#6B7280' }} strokeWidth={1.8} />
              </div>
              <div className="text-left flex-1">
                <p className={`font-medium text-sm ${selected ? 'text-pace-green' : 'text-pace-text'}`}>
                  {opt.label}
                </p>
                {opt.description && (
                  <p className="text-pace-muted text-xs mt-0.5">{opt.description}</p>
                )}
              </div>
              {selected && (
                <div className="w-5 h-5 rounded-full bg-pace-green flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
