import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { demoUsers } from '../data/demoUsers'
import { buildAggregateStats } from '../lib/adminStats'
import { ArrowLeft, Users, Clock, TrendingUp, Activity } from 'lucide-react'

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

export default function Admin() {
  const navigate = useNavigate()
  const stats = buildAggregateStats(demoUsers)

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
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7DC9A0]" />
          <span className="text-gray-400 text-xs">Live data</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Population Wellness Overview</h1>
          <p className="text-gray-400 text-sm">
            Anonymous aggregate patterns from account details and daily activity logs only.
          </p>
        </div>

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

        <p className="text-center text-gray-300 text-xs pb-4">
          All data is anonymised and aggregated. No individual user information is accessible through this dashboard.
        </p>
      </main>
    </div>
  )
}
