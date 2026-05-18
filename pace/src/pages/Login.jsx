import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, X } from 'lucide-react'
import { useStore } from '../store/useStore'

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-pace-bg border border-pace-border text-pace-text text-sm placeholder-pace-muted outline-none focus:border-pace-green transition-colors"
    />
  )
}

export default function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const resetPassword = useStore((s) => s.resetPassword)
  const registeredUser = useStore((s) => s.registeredUser)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotNewPw, setForgotNewPw] = useState('')
  const [forgotConfirm, setForgotConfirm] = useState('')
  const [forgotError, setForgotError] = useState('')

  const handleLogin = () => {
    const ok = login(email, password)
    if (ok) {
      navigate('/today')
    } else {
      setError('Incorrect email or password')
    }
  }

  const handleForgotEmailNext = () => {
    if (!registeredUser || registeredUser.email !== forgotEmail) {
      setForgotError('No account found with this email')
      return
    }
    setForgotError('')
    setForgotStep('reset')
  }

  const handleForgotReset = () => {
    if (forgotNewPw.length < 8) {
      setForgotError('Password must be at least 8 characters')
      return
    }
    if (forgotNewPw !== forgotConfirm) {
      setForgotError('Passwords do not match')
      return
    }
    resetPassword(forgotEmail, forgotNewPw)
    setForgotStep('done')
  }

  const closeForgot = () => {
    setForgotOpen(false)
    setForgotEmail('')
    setForgotNewPw('')
    setForgotConfirm('')
    setForgotError('')
    setForgotStep('email')
  }

  return (
    <div className="flex flex-col h-full bg-pace-bg relative overflow-hidden">
      <div className="flex items-center px-6 pt-6 pb-4">
        <button
          onClick={() => navigate('/welcome')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-pace-card shadow-card mr-4"
        >
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <h1 className="text-pace-text text-xl font-bold">Log in</h1>
      </div>

      <div className="flex-1 px-6 pt-4 flex flex-col gap-4">
        <div>
          <p className="text-pace-muted text-xs mb-1">Email</p>
          <Input
            value={email}
            onChange={(v) => { setEmail(v); setError('') }}
            placeholder="you@email.com"
            type="email"
          />
        </div>
        <div>
          <p className="text-pace-muted text-xs mb-1">Password</p>
          <Input
            value={password}
            onChange={(v) => { setPassword(v); setError('') }}
            placeholder="Your password"
            type="password"
          />
        </div>

        {error && <p className="text-pace-rose text-xs">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={!email || !password}
          className="w-full py-4 bg-pace-green text-white font-semibold rounded-2xl disabled:opacity-40 active:opacity-90 transition-opacity mt-2"
        >
          Log in
        </button>

        <button
          onClick={() => setForgotOpen(true)}
          className="text-pace-secondary text-sm text-center active:opacity-70 transition-opacity"
        >
          Forgot your password?
        </button>
      </div>

      <AnimatePresence>
        {forgotOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 z-10"
              onClick={closeForgot}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 bg-pace-bg rounded-t-3xl z-20 px-6 pt-4 pb-10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-pace-text font-semibold text-base">Reset password</h3>
                <button
                  onClick={closeForgot}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-pace-card"
                >
                  <X size={16} className="text-pace-secondary" />
                </button>
              </div>

              {forgotStep === 'email' && (
                <div className="flex flex-col gap-4">
                  <p className="text-pace-muted text-sm">Enter the email address linked to your account.</p>
                  <Input
                    value={forgotEmail}
                    onChange={(v) => { setForgotEmail(v); setForgotError('') }}
                    placeholder="you@email.com"
                    type="email"
                  />
                  {forgotError && <p className="text-pace-rose text-xs">{forgotError}</p>}
                  <button
                    onClick={handleForgotEmailNext}
                    disabled={!forgotEmail}
                    className="w-full py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
                  >
                    Continue
                  </button>
                </div>
              )}

              {forgotStep === 'reset' && (
                <div className="flex flex-col gap-4">
                  <p className="text-pace-muted text-sm">
                    Choose a new password for{' '}
                    <span className="text-pace-text font-medium">{forgotEmail}</span>.
                  </p>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">New password</p>
                    <Input
                      value={forgotNewPw}
                      onChange={(v) => { setForgotNewPw(v); setForgotError('') }}
                      placeholder="At least 8 characters"
                      type="password"
                    />
                  </div>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">Confirm new password</p>
                    <Input
                      value={forgotConfirm}
                      onChange={(v) => { setForgotConfirm(v); setForgotError('') }}
                      placeholder="Repeat new password"
                      type="password"
                    />
                  </div>
                  {forgotError && <p className="text-pace-rose text-xs">{forgotError}</p>}
                  <button
                    onClick={handleForgotReset}
                    disabled={!forgotNewPw || !forgotConfirm}
                    className="w-full py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
                  >
                    Reset password
                  </button>
                </div>
              )}

              {forgotStep === 'done' && (
                <div className="flex flex-col gap-4 items-center text-center">
                  <div className="w-12 h-12 bg-pace-green-light rounded-2xl flex items-center justify-center">
                    <span className="text-pace-green text-xl font-bold">✓</span>
                  </div>
                  <p className="text-pace-text font-semibold">Password updated</p>
                  <p className="text-pace-muted text-sm">You can now log in with your new password.</p>
                  <button
                    onClick={closeForgot}
                    className="w-full py-3.5 bg-pace-green text-white font-semibold rounded-xl transition-opacity"
                  >
                    Got it
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
