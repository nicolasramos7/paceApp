import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { demoUsers } from '../data/demoUsers'
import { buildAggregateStats } from '../lib/adminStats'
import { ArrowLeft, Users, Clock, TrendingUp, Activity, MapPin } from 'lucide-react'

const COLORS = ['#7DC9A0', '#9B8ECD', '#7BAFD4', '#F5C06B', '#F2A0AE', '#F0976A']

function StatCard({ icon: Icon, iconBg, iconColor, label, value, unit, sublabel }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} strokeWidth={1.8} />
        </div>
      </div>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-gray-400 text-sm mb-1">{unit}</span>}
      </div>
      {sublabel && <p className="text-gray-400 text-xs mt-1">{sublabel}</p>}
    </div>
  )
}

function HeatmapCell({ value }) {
  const opacity = value / 100
  return (
    <td className="px-3 py-2 text-center">
      <div
        className="inline-flex items-center justify-center w-14 h-10 rounded-lg text-xs font-semibold"
        style={{
          backgroundColor: `rgba(125, 201, 160, ${opacity})`,
          color: opacity > 0.5 ? '#fff' : '#1A1A2E',
        }}
      >
        {value}%
      </div>
    </td>
  )
}

function AdminGate({ onEnter }) {
  const [country, setCountry] = useState('')
  const [zipCode, setZipCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (country.trim() && zipCode.trim()) onEnter(country.trim(), zipCode.trim())
  }

  return (
    <div className="min-h-screen bg-[#F4F4F8] font-sans flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#7DC9A0] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">p</span>
          </div>
          <span className="text-gray-900 font-semibold">pace</span>
          <span className="text-gray-400 text-sm">— Municipality Dashboard</span>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-[#E8F7F0] rounded-2xl mb-6">
          <MapPin size={22} className="text-[#7DC9A0]" strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter your area</h1>
        <p className="text-gray-400 text-sm mb-8">
          View anonymised wellness data for residents in your municipality.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Spain"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-[#7DC9A0] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">ZIP / Postal code</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 08001"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-[#7DC9A0] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!country.trim() || !zipCode.trim()}
            className="mt-2 w-full py-3 bg-[#7DC9A0] text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            View dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [area, setArea] = useState(null)

  if (!area) {
    return <AdminGate onEnter={(country, zipCode) => setArea({ country, zipCode })} />
  }

  const filteredUsers = demoUsers.filter(
    (u) =>
      u.zipCode === area.zipCode &&
      (u.country || '').toLowerCase() === area.country.toLowerCase()
  )
  const stats = buildAggregateStats(filteredUsers)

  return (
    <div className="min-h-screen bg-[#F4F4F8] font-sans">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to app
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <svg
              viewBox="470 328 660 240"
              style={{ height: 32, display: 'block', borderRadius: 6 }}
            >
              <image href="/pace_logo.jpg" width="1600" height="896" />
            </svg>
            <span className="text-gray-400 text-sm">— Municipality Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <MapPin size={13} />
            <span>{area.country} · {area.zipCode}</span>
          </div>
          <button
            onClick={() => setArea(null)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Change area
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7DC9A0]" />
            <span className="text-gray-400 text-xs">Live data</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Population Wellness Overview</h1>
          <p className="text-gray-400 text-sm">
            {filteredUsers.length > 0
              ? `${filteredUsers.length} registered user${filteredUsers.length !== 1 ? 's' : ''} in ${area.country}, ${area.zipCode} — anonymous aggregate patterns only.`
              : `No registered users found in ${area.country}, ${area.zipCode}.`}
          </p>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center mb-8">
            <div className="w-12 h-12 bg-[#E8F7F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={22} className="text-[#7DC9A0]" strokeWidth={1.8} />
            </div>
            <p className="text-gray-900 font-semibold mb-1">No data for this area</p>
            <p className="text-gray-400 text-sm">Try a different country or ZIP code.</p>
            <button
              onClick={() => setArea(null)}
              className="mt-4 px-5 py-2.5 bg-[#7DC9A0] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Change area
            </button>
          </div>
        )}

        {filteredUsers.length > 0 && (<>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            iconBg="#E8F7F0"
            iconColor="#7DC9A0"
            label="Total Users"
            value={stats.totalUsers}
            sublabel="Registered in area"
          />
          <StatCard
            icon={Activity}
            iconBg="#FEEFF2"
            iconColor="#F2A0AE"
            label="Low Social Exposure"
            value={stats.lowSocialExposure}
            unit="%"
            sublabel="of users this week"
          />
          <StatCard
            icon={Clock}
            iconBg="#FEF4DF"
            iconColor="#F5C06B"
            label="Avg Outside Time"
            value={stats.avgOutsideTimeMinutes}
            unit="min/day"
            sublabel="population average"
          />
          <StatCard
            icon={TrendingUp}
            iconBg="#EEECFB"
            iconColor="#9B8ECD"
            label="Social Fulfillment"
            value={stats.socialFulfillment}
            unit="/100"
            sublabel="avg score this week"
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Weekly trends */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-gray-900 font-semibold text-sm mb-1">Weekly Trends</h2>
            <p className="text-gray-400 text-xs mb-5">Social exposure and movement scores over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.weeklyTrend}>
                <defs>
                  <linearGradient id="gSocial" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9B8ECD" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9B8ECD" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMovement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7DC9A0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7DC9A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F8" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="socialScore" name="Social" stroke="#9B8ECD" strokeWidth={2} fill="url(#gSocial)" />
                <Area type="monotone" dataKey="movementScore" name="Movement" stroke="#7DC9A0" strokeWidth={2} fill="url(#gMovement)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Outside time distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-gray-900 font-semibold text-sm mb-1">Outside Time</h2>
            <p className="text-gray-400 text-xs mb-5">Distribution across population</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.outsideTimeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="label"
                >
                  {stats.outsideTimeDistribution.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-2">
              {stats.outsideTimeDistribution.map((item, i) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-400 text-xs">{item.label}</span>
                  </div>
                  <span className="text-gray-600 text-xs font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Most desired activities */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-gray-900 font-semibold text-sm mb-1">Unmet Activity Demand</h2>
            <p className="text-gray-400 text-xs mb-5">What residents repeatedly wish they were doing more — useful for low-pressure community programming</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.mostDesiredActivities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F8" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Bar dataKey="count" name="Unmet activity signals" radius={[0, 6, 6, 0]}>
                  {stats.mostDesiredActivities.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by demographic */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-gray-900 font-semibold text-sm mb-1">Activity by Age</h2>
            <p className="text-gray-400 text-xs mb-5">Social, physical, intellectual scores</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.activityByDemographic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F8" />
                <XAxis dataKey="group" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                />
                <Bar dataKey="social" name="Social" fill="#9B8ECD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="physical" name="Physical" fill="#7DC9A0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="intellectual" name="Intellectual" fill="#F5C06B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unmet activities heatmap */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-gray-900 font-semibold text-sm mb-1">Connection Opportunity Heatmap by Area</h2>
          <p className="text-gray-400 text-xs mb-5">
            Percentage of daily logs per area where residents wished for each activity — use this to prioritise social infrastructure
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-gray-400 text-xs font-medium">Area</th>
                  {stats.heatmapActivities.map((activity) => (
                    <th key={activity} className="px-3 py-2 text-gray-400 text-xs font-medium">{activity}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.unmetActivitiesHeatmap.map((row) => (
                  <tr key={row.area}>
                    <td className="px-3 py-2 text-gray-700 font-medium text-sm">{row.area}</td>
                    {row.activities.map((activity) => (
                      <HeatmapCell key={activity.name} value={activity.value} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </>)}

        <p className="text-center text-gray-300 text-xs pb-4">
          All data is anonymised and aggregated. No individual user information is accessible through this dashboard.
        </p>
      </main>
    </div>
  )
}
