function getName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.name || 'Demo participant'
}

export function toDemoParticipant(user, logs = {}) {
  return {
    id: user.id,
    name: getName(user),
    age: Number(user.age) || 0,
    zipCode: user.zipCode || '',
    town: user.town || '',
    gender: user.gender || '',
    occupation: user.occupation || '',
    interests: user.interests || [],
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
