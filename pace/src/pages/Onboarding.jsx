import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const INTERESTS = {
  Active: ['Walking', 'Hiking', 'Gym', 'Running', 'Sports', 'Yoga', 'Cycling'],
  Creative: ['Music', 'Art', 'Photography', 'Writing', 'Crafts', 'Cooking'],
  Entertainment: ['Movies', 'TV series', 'Video games', 'Board games', 'Anime'],
  Intellectual: ['Books', 'Learning', 'Languages', 'Museums', 'Technology'],
  Social: ['Coffee chats', 'Eating out', 'Volunteering', 'Exploring town', 'Local events'],
}

const TOTAL_STEPS = 6

function ProgressBar({ step }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full transition-all duration-300"
          style={{ backgroundColor: i < step ? '#7DC9A0' : '#EBEBF0' }}
        />
      ))}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-pace-text text-sm font-medium block mb-1.5">
        {label} {!required && <span className="text-pace-muted font-normal">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

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

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-pace-bg border border-pace-border text-pace-text text-sm outline-none focus:border-pace-green transition-colors appearance-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  )
}

function Chip({ label, selected, onToggle }) {
  return (
    <button
      onClick={() => onToggle(label)}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
        selected
          ? 'bg-pace-green border-pace-green text-white'
          : 'bg-white border-pace-border text-pace-secondary'
      }`}
    >
      {label}
    </button>
  )
}

export default function Onboarding() {
  const navigate = useNavigate()
  const setUser = useStore((s) => s.setUser)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', firstName: '', lastName: '', gender: '',
    age: '', country: '', town: '', zipCode: '', occupation: '',
    language: '', pets: '', interests: [],
  })

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))
  const toggleInterest = (interest) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }))
  }

  const goNext = () => { setDir(1); setStep((s) => s + 1) }
  const goBack = () => { setDir(-1); setStep((s) => s - 1) }

  const finish = () => {
    setUser({ ...form, id: `user_${Date.now()}` })
    navigate('/today')
  }

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 bg-pace-green rounded-3xl flex items-center justify-center mb-6 shadow-card">
        <span className="text-white text-2xl font-bold">p</span>
      </div>
      <h1 className="text-3xl font-bold text-pace-text mb-3">pace</h1>
      <p className="text-pace-secondary text-base leading-relaxed mb-2">
        A lightweight life rhythm tracker that helps you build healthier routines and meaningful shared experiences.
      </p>
      <p className="text-pace-muted text-sm leading-relaxed">
        Simple, private, and always at your own pace.
      </p>
      <button
        onClick={goNext}
        className="mt-10 w-full py-4 bg-pace-green text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
      >
        Get started <ChevronRight size={18} />
      </button>
    </div>,

    // Step 1: Account
    (() => {
      const pwTooShort = form.password.length > 0 && form.password.length < 8
      const pwMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword
      const accountValid = form.email && form.password.length >= 8 && form.password === form.confirmPassword
      return (
        <div key="account" className="flex flex-col h-full px-6 pt-2">
          <ProgressBar step={1} />
          <h2 className="text-pace-text font-bold text-xl mb-1">Create your account</h2>
          <p className="text-pace-muted text-sm mb-6">Your data stays private and is never shared individually.</p>
          <div className="flex flex-col gap-4 flex-1">
            <Field label="Email" required>
              <Input value={form.email} onChange={set('email')} placeholder="you@email.com" type="email" />
            </Field>
            <Field label="Password" required>
              <Input value={form.password} onChange={set('password')} placeholder="At least 8 characters" type="password" />
              {pwTooShort && <p className="text-pace-rose text-xs mt-1">Password must be at least 8 characters</p>}
            </Field>
            <Field label="Confirm Password" required>
              <Input value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" type="password" />
              {pwMismatch && <p className="text-pace-rose text-xs mt-1">Passwords do not match</p>}
            </Field>
          </div>
          <div className="flex gap-3 pb-6">
            <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
              <ChevronLeft size={20} className="text-pace-secondary" />
            </button>
            <button
              onClick={goNext}
              disabled={!accountValid}
              className="flex-1 py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )
    })(),

    // Step 2: Personal
    <div key="personal" className="flex flex-col h-full px-6 pt-2 overflow-y-auto scrollbar-hide">
      <ProgressBar step={2} />
      <h2 className="text-pace-text font-bold text-xl mb-1">About you</h2>
      <p className="text-pace-muted text-sm mb-6">Helps us personalise your experience.</p>
      <div className="flex flex-col gap-4 flex-1">
        <Field label="First Name" required>
          <Input value={form.firstName} onChange={set('firstName')} placeholder="Your first name" />
        </Field>
        <Field label="Last Name">
          <Input value={form.lastName} onChange={set('lastName')} placeholder="Your last name" />
        </Field>
        <Field label="Gender" required>
          <Select value={form.gender} onChange={set('gender')} placeholder="Select gender" options={['Male', 'Female', 'Other']} />
        </Field>
        <Field label="Age" required>
          <Input value={form.age} onChange={set('age')} placeholder="Your age" type="number" />
          {form.age && Number(form.age) < 18 && (
            <p className="text-pace-rose text-xs mt-1">You must be at least 18 years old to use Pace</p>
          )}
        </Field>
      </div>
      <div className="flex gap-3 py-6">
        <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <button
          onClick={goNext}
          disabled={!form.firstName || !form.gender || !form.age || Number(form.age) < 18}
          className="flex-1 py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>,

    // Step 3: Location
    <div key="location" className="flex flex-col h-full px-6 pt-2">
      <ProgressBar step={3} />
      <h2 className="text-pace-text font-bold text-xl mb-1">Where you are</h2>
      <p className="text-pace-muted text-sm mb-6">Used to suggest nearby activities. We never share exact addresses.</p>
      <div className="flex flex-col gap-4 flex-1">
        <Field label="Country" required>
          <Input value={form.country} onChange={set('country')} placeholder="Your country" />
        </Field>
        <Field label="Town" required>
          <Input value={form.town} onChange={set('town')} placeholder="Your town or city" />
        </Field>
        <Field label="ZIP Code" required>
          <Input value={form.zipCode} onChange={set('zipCode')} placeholder="Postal code" />
        </Field>
      </div>
      <div className="flex gap-3 pb-6">
        <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <button
          onClick={goNext}
          disabled={!form.country || !form.town || !form.zipCode}
          className="flex-1 py-3.5 bg-pace-green text-white font-semibold rounded-xl disabled:opacity-40 transition-opacity"
        >
          Continue
        </button>
      </div>
    </div>,

    // Step 4: Optional details
    <div key="optional" className="flex flex-col h-full px-6 pt-2 overflow-y-auto scrollbar-hide">
      <ProgressBar step={4} />
      <h2 className="text-pace-text font-bold text-xl mb-1">A little more</h2>
      <p className="text-pace-muted text-sm mb-6">All optional. Add what feels comfortable.</p>
      <div className="flex flex-col gap-4 flex-1">
        <Field label="Occupation / Status">
          <Select
            value={form.occupation}
            onChange={set('occupation')}
            placeholder="Select status"
            options={['Student', 'Full-time work', 'Part-time', 'Retired', 'Unemployed']}
          />
        </Field>
        <Field label="Language">
          <Input value={form.language} onChange={set('language')} placeholder="e.g. English, Spanish" />
        </Field>
        <Field label="Pets">
          <Select
            value={form.pets}
            onChange={set('pets')}
            placeholder="Do you have pets?"
            options={['Yes', 'No']}
          />
        </Field>
      </div>
      <div className="flex gap-3 py-6">
        <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <button onClick={goNext} className="flex-1 py-3.5 bg-pace-green text-white font-semibold rounded-xl">
          Continue
        </button>
      </div>
    </div>,

    // Step 5: Interests
    <div key="interests" className="flex flex-col h-full px-6 pt-2">
      <ProgressBar step={5} />
      <h2 className="text-pace-text font-bold text-xl mb-1">Your interests</h2>
      <p className="text-pace-muted text-sm mb-4">Optional. Select anything that resonates.</p>
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {Object.entries(INTERESTS).map(([category, items]) => (
          <div key={category} className="mb-5">
            <p className="text-pace-muted text-xs font-medium uppercase tracking-wide mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={form.interests.includes(item)}
                  onToggle={toggleInterest}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 pb-6 pt-2 border-t border-pace-border">
        <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <button onClick={finish} className="flex-1 py-3.5 bg-pace-green text-white font-semibold rounded-xl flex items-center justify-center gap-2">
          <Check size={18} /> All set
        </button>
      </div>
    </div>,
  ]

  return (
    <div className="h-full bg-pace-bg flex flex-col overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ x: dir * 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: dir * -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
