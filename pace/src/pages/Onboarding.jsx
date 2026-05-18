import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium',
  'Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic',
  'Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea',
  'Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands',
  'Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro',
  'Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand',
  'Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan',
  'Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia',
  'Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka',
  'Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay',
  'Uzbekistan','Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

// Countries supported by Zippopotam.us — others skip validation
const COUNTRY_CODES = {
  'Algeria':'DZ','Andorra':'AD','Argentina':'AR','Australia':'AU','Austria':'AT',
  'Azerbaijan':'AZ','Bangladesh':'BD','Belarus':'BY','Belgium':'BE','Brazil':'BR',
  'Bulgaria':'BG','Canada':'CA','Croatia':'HR','Czech Republic':'CZ','Denmark':'DK',
  'Dominican Republic':'DO','Estonia':'EE','Finland':'FI','France':'FR','Germany':'DE',
  'Guatemala':'GT','Hungary':'HU','Iceland':'IS','India':'IN','Ireland':'IE','Italy':'IT',
  'Japan':'JP','Latvia':'LV','Liechtenstein':'LI','Lithuania':'LT','Luxembourg':'LU',
  'Malawi':'MW','Malaysia':'MY','Malta':'MT','Marshall Islands':'MH','Mexico':'MX',
  'Moldova':'MD','Monaco':'MC','Morocco':'MA','Netherlands':'NL','New Zealand':'NZ',
  'North Macedonia':'MK','Norway':'NO','Pakistan':'PK','Philippines':'PH','Poland':'PL',
  'Portugal':'PT','Romania':'RO','Russia':'RU','San Marino':'SM','Slovakia':'SK',
  'Slovenia':'SI','South Africa':'ZA','Spain':'ES','Sweden':'SE','Switzerland':'CH',
  'Thailand':'TH','Turkey':'TR','Ukraine':'UA','United Kingdom':'GB','United States':'US',
  'Uruguay':'UY','Vatican City':'VA',
}

const LANGUAGES = [
  'English','Mandarin Chinese','Hindi','Spanish','French','Arabic','Bengali','Russian',
  'Portuguese','Urdu','Indonesian','German','Japanese','Marathi','Telugu','Turkish',
  'Tamil','Cantonese','Vietnamese','Korean','Tagalog','Persian','Swahili','Italian',
  'Punjabi','Gujarati','Polish','Ukrainian','Dutch','Thai',
]

function SearchableSelect({ value, onChange, options, placeholder }) {
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

const INTERESTS = {
  Active: ['Walking', 'Hiking', 'Gym', 'Running', 'Sports', 'Yoga', 'Cycling'],
  Creative: ['Music', 'Art', 'Photography', 'Writing', 'Crafts', 'Cooking'],
  Entertainment: ['Movies', 'TV series', 'Video games', 'Board games', 'Anime'],
  Intellectual: ['Books', 'Learning', 'Languages', 'Museums', 'Technology'],
  Social: ['Coffee chats', 'Eating out', 'Volunteering', 'Exploring town', 'Local events'],
}

const TOTAL_STEPS = 5

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
  const register = useStore((s) => s.register)
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

  const [accountAttempted, setAccountAttempted] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [zipStatus, setZipStatus] = useState('idle') // idle | checking | valid | invalid | unsupported
  const [zipPlace, setZipPlace] = useState('')

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  useEffect(() => {
    const code = COUNTRY_CODES[form.country]
    if (!form.zipCode || !form.country) { setZipStatus('idle'); setZipPlace(''); return }
    if (!code) { setZipStatus('unsupported'); setZipPlace(''); return }

    setZipStatus('checking')
    setZipPlace('')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.zippopotam.us/${code}/${form.zipCode}`)
        if (res.ok) {
          const data = await res.json()
          setZipPlace(data.places?.[0]?.['place name'] || '')
          setZipStatus('valid')
        } else {
          setZipStatus('invalid')
        }
      } catch {
        setZipStatus('idle') // network error — don't block the user
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [form.country, form.zipCode])

  const goNext = () => { setDir(1); setStep((s) => s + 1) }
  const goBack = () => {
    if (step === 0) { navigate('/welcome'); return }
    setDir(-1)
    setStep((s) => s - 1)
  }

  const finish = () => {
    register(form)
    navigate('/today')
  }

  const steps = [
    // Step 0: Account
    (() => {
      const emailInvalid = form.email.length > 0 && !EMAIL_RE.test(form.email)
      const showEmailError = (emailTouched || accountAttempted) && emailInvalid
      const pwTooShort = form.password.length > 0 && form.password.length < 8
      const pwMismatch = form.password !== form.confirmPassword
      const accountValid = form.email && EMAIL_RE.test(form.email) && form.password.length >= 8 && !pwMismatch
      const handleContinue = () => {
        setAccountAttempted(true)
        if (accountValid) goNext()
      }
      return (
        <div key="account" className="flex flex-col h-full px-6 pt-2">
          <ProgressBar step={1} />
          <h2 className="text-pace-text font-bold text-xl mb-1">Create your account</h2>
          <p className="text-pace-muted text-sm mb-6">Your data stays private and is never shared individually.</p>
          <div className="flex flex-col gap-4 flex-1">
            <Field label="Email" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@email.com"
                className="w-full px-4 py-3 rounded-xl bg-pace-bg border border-pace-border text-pace-text text-sm placeholder-pace-muted outline-none focus:border-pace-green transition-colors"
              />
              {showEmailError && <p className="text-pace-rose text-xs mt-1">Please enter a valid email address</p>}
            </Field>
            <Field label="Password" required>
              <Input value={form.password} onChange={set('password')} placeholder="At least 8 characters" type="password" />
              {pwTooShort && <p className="text-pace-rose text-xs mt-1">Password must be at least 8 characters</p>}
            </Field>
            <Field label="Confirm Password" required>
              <Input value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" type="password" />
              {accountAttempted && pwMismatch && <p className="text-pace-rose text-xs mt-1">Passwords do not match</p>}
            </Field>
          </div>
          <div className="flex gap-3 pb-6">
            <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
              <ChevronLeft size={20} className="text-pace-secondary" />
            </button>
            <button
              onClick={handleContinue}
              disabled={!form.email || !EMAIL_RE.test(form.email) || form.password.length < 8 || !form.confirmPassword}
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
          <SearchableSelect value={form.country} onChange={set('country')} options={COUNTRIES} placeholder="Search your country" />
        </Field>
        <Field label="ZIP Code" required>
          <Input value={form.zipCode} onChange={set('zipCode')} placeholder="Postal code" />
          {zipStatus === 'checking' && (
            <p className="text-pace-muted text-xs mt-1 flex items-center gap-1">
              <span className="inline-block w-3 h-3 border border-pace-muted border-t-transparent rounded-full animate-spin" />
              Verifying…
            </p>
          )}
          {zipStatus === 'valid' && (
            <p className="text-pace-green text-xs mt-1">✓ {zipPlace || 'Valid postcode'}</p>
          )}
          {zipStatus === 'invalid' && (
            <p className="text-pace-rose text-xs mt-1">ZIP code not found in {form.country}</p>
          )}
        </Field>
      </div>
      <div className="flex gap-3 pb-6">
        <button onClick={goBack} className="w-12 h-12 rounded-xl border border-pace-border flex items-center justify-center">
          <ChevronLeft size={20} className="text-pace-secondary" />
        </button>
        <button
          onClick={goNext}
          disabled={!form.country || !form.zipCode || zipStatus === 'checking' || zipStatus === 'invalid'}
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
          <SearchableSelect value={form.language} onChange={set('language')} options={LANGUAGES} placeholder="Search your language" />
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
