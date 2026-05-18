import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, MapPin, Briefcase, Calendar, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import BottomNav from '../components/layout/BottomNav'

const INTEREST_COLORS = {
  Walking: '#7DC9A0', Hiking: '#7DC9A0', Gym: '#F2A0AE', Running: '#F2A0AE',
  Sports: '#7BAFD4', Yoga: '#9B8ECD', Cycling: '#7BAFD4',
  Music: '#9B8ECD', Art: '#F2A0AE', Photography: '#F5C06B', Writing: '#7BAFD4',
  Crafts: '#F0976A', Cooking: '#F0976A',
  Movies: '#7BAFD4', 'TV series': '#7BAFD4', 'Video games': '#9B8ECD',
  'Board games': '#F5C06B', Anime: '#9B8ECD',
  Books: '#F5C06B', Learning: '#7DC9A0', Languages: '#F0976A',
  Museums: '#9B8ECD', Technology: '#7BAFD4',
  'Coffee chats': '#F0976A', 'Eating out': '#F5C06B', Volunteering: '#7DC9A0',
  'Exploring town': '#7BAFD4', 'Local events': '#F2A0AE',
}

const INTEREST_BG = {
  Walking: '#E8F7F0', Hiking: '#E8F7F0', Gym: '#FEEFF2', Running: '#FEEFF2',
  Sports: '#EAF3FB', Yoga: '#EEECFB', Cycling: '#EAF3FB',
  Music: '#EEECFB', Art: '#FEEFF2', Photography: '#FEF4DF', Writing: '#EAF3FB',
  Crafts: '#FEF0E7', Cooking: '#FEF0E7',
  Movies: '#EAF3FB', 'TV series': '#EAF3FB', 'Video games': '#EEECFB',
  'Board games': '#FEF4DF', Anime: '#EEECFB',
  Books: '#FEF4DF', Learning: '#E8F7F0', Languages: '#FEF0E7',
  Museums: '#EEECFB', Technology: '#EAF3FB',
  'Coffee chats': '#FEF0E7', 'Eating out': '#FEF4DF', Volunteering: '#E8F7F0',
  'Exploring town': '#EAF3FB', 'Local events': '#FEEFF2',
}

function BalanceBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-pace-muted text-xs w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-pace-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value || 0}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-pace-muted text-xs w-7 text-right">{value || 0}</span>
    </div>
  )
}

function EditInput({ value, onChange, type = 'text', placeholder }) {
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

export default function Profile() {
  const user = useStore((s) => s.user)
  const updateUser = useStore((s) => s.updateUser)
  const logs = useStore((s) => s.logs)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const openEdit = () => {
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      town: user.town || '',
      country: user.country || '',
    })
    setPw({ current: '', next: '', confirm: '' })
    setPwError('')
    setPwSaved(false)
    setEditOpen(true)
  }

  const setField = (field) => (val) => setEditForm((f) => ({ ...f, [field]: val }))

  const saveProfile = () => {
    updateUser(editForm)
    setEditOpen(false)
  }

  const savePassword = () => {
    if (pw.current !== user.password) { setPwError('Current password is incorrect'); return }
    if (pw.next.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (pw.next !== pw.confirm) { setPwError('New passwords do not match'); return }
    updateUser({ password: pw.next })
    setPw({ current: '', next: '', confirm: '' })
    setPwError('')
    setPwSaved(true)
  }

  const latestLog = Object.values(logs).sort((a, b) => b.date - a.date)[0] || {}
  const balance = latestLog.activityBalance || {}

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'ME'

  const profileItems = [
    { label: 'Location', value: user.town ? `${user.town}, ${user.country}` : null, Icon: MapPin },
    { label: 'Status', value: user.occupation || null, Icon: Briefcase },
    { label: 'Age', value: user.age ? `${user.age} years old` : null, Icon: Calendar },
  ].filter((i) => i.value)

  const hasBalance = Object.keys(balance).length > 0

  return (
    <div className="flex flex-col h-full bg-pace-bg relative overflow-hidden">
      <div className="flex-1 overflow-y-auto scrollbar-hide phone-scroll pb-4">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h1 className="text-pace-text text-2xl font-bold">Profile</h1>
          <button onClick={openEdit} className="w-9 h-9 bg-pace-card rounded-xl shadow-card flex items-center justify-center">
            <Edit3 size={16} className="text-pace-secondary" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 bg-pace-green rounded-3xl flex items-center justify-center shadow-card mb-3">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <h2 className="text-pace-text font-bold text-xl">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-pace-muted text-sm mt-0.5">{user.email}</p>
        </div>

        {/* Profile details */}
        {profileItems.length > 0 && (
          <div className="mx-4 mb-4 bg-pace-card rounded-2xl shadow-card overflow-hidden">
            {profileItems.map(({ label, value, Icon }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-4 ${
                  i < profileItems.length - 1 ? 'border-b border-pace-border' : ''
                }`}
              >
                <div className="w-8 h-8 bg-pace-green-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-pace-green" />
                </div>
                <div>
                  <p className="text-pace-muted text-xs">{label}</p>
                  <p className="text-pace-text text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity balance */}
        {hasBalance && (
          <div className="mx-4 mb-4 bg-pace-card rounded-2xl shadow-card px-5 py-5">
            <h3 className="text-pace-text font-semibold text-sm mb-4">Your Rhythm</h3>
            <div className="flex flex-col gap-3">
              <BalanceBar label="Physical" value={balance.physical} color="#7DC9A0" />
              <BalanceBar label="Social" value={balance.social} color="#9B8ECD" />
              <BalanceBar label="Rest" value={balance.rest} color="#7BAFD4" />
              <BalanceBar label="Nutrition" value={balance.nutrition} color="#F5C06B" />
              <BalanceBar label="Productivity" value={balance.productivity} color="#F2A0AE" />
            </div>
          </div>
        )}

        {/* Interests */}
        {(user.interests || []).length > 0 && (
          <div className="mx-4 mb-4 bg-pace-card rounded-2xl shadow-card px-5 py-5">
            <h3 className="text-pace-text font-semibold text-sm mb-4">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: INTEREST_BG[interest] || '#F4F4F8',
                    color: INTEREST_COLORS[interest] || '#6B7280',
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Optional info */}
        {(user.language || user.pets) && (
          <div className="mx-4 mb-4 bg-pace-card rounded-2xl shadow-card px-5 py-5">
            <h3 className="text-pace-text font-semibold text-sm mb-3">More about you</h3>
            <div className="flex flex-col gap-2">
              {user.language && (
                <div className="flex justify-between">
                  <span className="text-pace-muted text-sm">Language</span>
                  <span className="text-pace-text text-sm font-medium">{user.language}</span>
                </div>
              )}
              {user.pets && (
                <div className="flex justify-between">
                  <span className="text-pace-muted text-sm">Pets</span>
                  <span className="text-pace-text text-sm font-medium">{user.pets}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {/* Edit account bottom sheet */}
      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 z-10"
              onClick={() => setEditOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 bg-pace-bg rounded-t-3xl z-20 max-h-[85%] flex flex-col"
            >
              {/* Handle + header */}
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-pace-border flex-shrink-0">
                <h3 className="text-pace-text font-semibold text-base">Edit account</h3>
                <button onClick={() => setEditOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-pace-card">
                  <X size={16} className="text-pace-secondary" />
                </button>
              </div>

              <div className="overflow-y-auto scrollbar-hide px-6 py-4 flex flex-col gap-5">
                {/* Profile info */}
                <div className="flex flex-col gap-3">
                  <p className="text-pace-muted text-xs font-medium uppercase tracking-widest">Profile</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-pace-muted text-xs mb-1">First name</p>
                      <EditInput value={editForm.firstName} onChange={setField('firstName')} placeholder="First name" />
                    </div>
                    <div className="flex-1">
                      <p className="text-pace-muted text-xs mb-1">Last name</p>
                      <EditInput value={editForm.lastName} onChange={setField('lastName')} placeholder="Last name" />
                    </div>
                  </div>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">Email</p>
                    <EditInput value={editForm.email} onChange={setField('email')} placeholder="Email" type="email" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-pace-muted text-xs mb-1">Town</p>
                      <EditInput value={editForm.town} onChange={setField('town')} placeholder="Town" />
                    </div>
                    <div className="flex-1">
                      <p className="text-pace-muted text-xs mb-1">Country</p>
                      <EditInput value={editForm.country} onChange={setField('country')} placeholder="Country" />
                    </div>
                  </div>
                  <button
                    onClick={saveProfile}
                    className="w-full py-3 bg-pace-green text-white text-sm font-semibold rounded-xl active:opacity-80 transition-opacity"
                  >
                    Save changes
                  </button>
                </div>

                {/* Password change */}
                <div className="flex flex-col gap-3">
                  <p className="text-pace-muted text-xs font-medium uppercase tracking-widest">Change password</p>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">Current password</p>
                    <EditInput value={pw.current} onChange={(v) => { setPw((p) => ({ ...p, current: v })); setPwSaved(false); setPwError('') }} placeholder="Enter current password" type="password" />
                  </div>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">New password</p>
                    <EditInput value={pw.next} onChange={(v) => { setPw((p) => ({ ...p, next: v })); setPwSaved(false); setPwError('') }} placeholder="At least 8 characters" type="password" />
                  </div>
                  <div>
                    <p className="text-pace-muted text-xs mb-1">Confirm new password</p>
                    <EditInput value={pw.confirm} onChange={(v) => { setPw((p) => ({ ...p, confirm: v })); setPwSaved(false); setPwError('') }} placeholder="Repeat new password" type="password" />
                  </div>
                  {pwError && <p className="text-pace-rose text-xs">{pwError}</p>}
                  {pwSaved && <p className="text-pace-green text-xs">Password updated successfully</p>}
                  <button
                    onClick={savePassword}
                    disabled={!pw.current || !pw.next || !pw.confirm}
                    className="w-full py-3 bg-pace-text text-white text-sm font-semibold rounded-xl disabled:opacity-40 active:opacity-80 transition-opacity"
                  >
                    Update password
                  </button>
                </div>

                <div className="pb-4" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
