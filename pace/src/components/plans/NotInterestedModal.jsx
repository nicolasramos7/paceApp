import { useState } from 'react'
import Modal from '../ui/Modal'

const reasons = [
  'Schedule does not work',
  'Not my kind of activity',
  'Too far from me',
  'Not feeling social right now',
  'Prefer a different group size',
]

export default function NotInterestedModal({ open, onClose, onSubmit }) {
  const [selected, setSelected] = useState(null)

  const handleSubmit = () => {
    onSubmit(selected)
    setSelected(null)
    onClose()
  }

  const handleSkip = () => {
    onSubmit(null)
    setSelected(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleSkip} title="Any reason? (optional)">
      <p className="text-pace-muted text-sm mb-4 -mt-2">
        This helps us suggest better plans. Feel free to skip.
      </p>
      <div className="flex flex-col gap-2 mb-5">
        {reasons.map((r) => (
          <button
            key={r}
            onClick={() => setSelected(selected === r ? null : r)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 text-sm ${
              selected === r
                ? 'border-pace-green bg-pace-green-light text-pace-green font-medium'
                : 'border-pace-border text-pace-secondary'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSkip}
          className="flex-1 py-3 rounded-xl border border-pace-border text-pace-secondary text-sm font-medium"
        >
          Skip
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 rounded-xl bg-pace-green text-white text-sm font-medium"
        >
          Done
        </button>
      </div>
    </Modal>
  )
}
