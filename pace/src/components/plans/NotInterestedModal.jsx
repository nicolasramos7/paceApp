import { useState } from 'react'
import Modal from '../ui/Modal'

const reasons = [
  'Schedule does not work',
  'Not my kind of activity',
  'Too far from me',
  'Not feeling social right now',
  'Prefer a different group size',
]

const REMOVE_WISH = '__remove_wish__'

export default function NotInterestedModal({ open, onClose, onSubmit, plan, currentWishes }) {
  const [selected, setSelected] = useState(null)
  const [wishToRemove, setWishToRemove] = useState(null)

  const wishOptions = plan?.relatedWishes?.length ? plan.relatedWishes : (currentWishes || [])

  const handleSelect = (reason) => {
    setSelected(selected === reason ? null : reason)
    setWishToRemove(null)
  }

  const handleSubmit = () => {
    onSubmit(selected, selected === REMOVE_WISH ? wishToRemove : null)
    setSelected(null)
    setWishToRemove(null)
    onClose()
  }

  const handleSkip = () => {
    onSubmit(null, null)
    setSelected(null)
    setWishToRemove(null)
    onClose()
  }

  const canSubmit = selected !== REMOVE_WISH || wishToRemove !== null

  return (
    <Modal open={open} onClose={handleSkip} title="Any reason? (optional)">
      <p className="text-pace-muted text-sm mb-4 -mt-2">
        This helps us suggest better plans. Feel free to skip.
      </p>
      <div className="flex flex-col gap-2 mb-5">
        {reasons.map((r) => (
          <button
            key={r}
            onClick={() => handleSelect(r)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 text-sm ${
              selected === r
                ? 'border-pace-green bg-pace-green-light text-pace-green font-medium'
                : 'border-pace-border text-pace-secondary'
            }`}
          >
            {r}
          </button>
        ))}

        <button
          onClick={() => handleSelect(REMOVE_WISH)}
          className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 text-sm ${
            selected === REMOVE_WISH
              ? 'border-pace-green bg-pace-green-light text-pace-green font-medium'
              : 'border-pace-border text-pace-secondary'
          }`}
        >
          I no longer wish for this
        </button>

        {selected === REMOVE_WISH && wishOptions.length > 0 && (
          <div className="ml-3 flex flex-col gap-1.5 mt-1">
            <p className="text-pace-muted text-xs px-1">Which wish should we remove?</p>
            {wishOptions.map((wish) => (
              <button
                key={wish}
                onClick={() => setWishToRemove(wishToRemove === wish ? null : wish)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-150 text-xs ${
                  wishToRemove === wish
                    ? 'border-pace-green bg-pace-green-light text-pace-green font-medium'
                    : 'border-pace-border text-pace-secondary'
                }`}
              >
                {wish}
              </button>
            ))}
          </div>
        )}
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
          disabled={!canSubmit}
          className="flex-1 py-3 rounded-xl bg-pace-green text-white text-sm font-medium disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </Modal>
  )
}
