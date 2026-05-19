import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full bg-pace-bg px-8 text-center pb-24">
      <img src="/pace_logo_transparent.png" alt="pace" className="h-44 mb-8 object-contain" />
      <p className="text-pace-secondary text-base leading-relaxed mb-2">
        A lightweight life rhythm tracker that helps you build healthier routines and meaningful shared experiences.
      </p>
      <p className="text-pace-muted text-sm leading-relaxed mb-14">
        Simple, private, and always at your own pace.
      </p>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => navigate('/signup')}
          className="w-full py-4 bg-pace-green text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
        >
          Get started <ChevronRight size={18} />
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-pace-card text-pace-text font-semibold rounded-2xl border border-pace-border shadow-card active:opacity-90 transition-opacity"
        >
          Log in
        </button>
      </div>
    </div>
  )
}
