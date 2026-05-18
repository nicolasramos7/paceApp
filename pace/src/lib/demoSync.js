const COLORS = ['#7DC9A0', '#9B8ECD', '#7BAFD4', '#F5C06B', '#F2A0AE', '#F0976A']

function getName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.name || 'Demo participant'
}

function getInitials(name) {
  return name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase()
}

function pickColor(id) {
  let hash = 0
  for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return COLORS[hash % COLORS.length]
}

export function toDemoParticipant(user, logs = {}) {
  const name = getName(user)
  return {
    id: user.id,
    name,
    age: Number(user.age) || 0,
    zipCode: user.zipCode || '',
    town: user.town || '',
    country: user.country || '',
    gender: user.gender || '',
    occupation: user.occupation || '',
    interests: user.interests || [],
    avatar: getInitials(name),
    color: pickColor(user.id),
    dailyLogs: Object.entries(logs).map(([date, log]) => ({
      date,
      ...log,
    })),
  }
}

export async function fetchDemoParticipants() {
  try {
    const response = await fetch('/api/demo-participants')
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function saveDemoParticipant(user, logs) {
  if (!user?.id) return

  try {
    await fetch('/api/demo-participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toDemoParticipant(user, logs)),
    })
  } catch {
    // The shared demo API only exists in local dev mode.
  }
}
