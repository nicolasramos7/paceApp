const SOCIAL_SCORE = {
  conversations: 82,
  minimal: 42,
  alone: 18,
}

const MOVEMENT_SCORE = {
  outside: 82,
  short: 48,
  stayed: 18,
}

const OUTSIDE_MINUTES = {
  none: 0,
  short: 20,
  moderate: 75,
  long: 150,
}

const AGE_GROUPS = [
  { label: '18-25', min: 18, max: 25 },
  { label: '26-35', min: 26, max: 35 },
  { label: '36-50', min: 36, max: 50 },
  { label: '50+', min: 51, max: Infinity },
]

const ZIP_AREAS = {
  '08001': 'Sant Pere',
  '08002': 'Eixample',
  '08003': 'Gracia',
}

const ACTIVITY_ALIASES = {
  'taken a walk outside': 'Walking',
  walk: 'Walking',
  walking: 'Walking',
  hiking: 'Hiking',
  run: 'Running',
  running: 'Running',
  gym: 'Gym',
  yoga: 'Yoga',
  cycling: 'Cycling',
  football: 'Football',
  sports: 'Sports',
  'coffee chat': 'Coffee chats',
  'coffee chats': 'Coffee chats',
  cafe: 'Coffee chats',
  café: 'Coffee chats',
  cafe: 'Coffee chats',
  'called a friend': 'Coffee chats',
  'eating out': 'Eating out',
  volunteering: 'Volunteering',
  'local event': 'Local events',
  'local events': 'Local events',
  music: 'Music',
  art: 'Art',
  photography: 'Photography',
  writing: 'Writing',
  crafts: 'Crafts',
  cooking: 'Cooking',
  books: 'Books',
  reading: 'Books',
  museum: 'Museums',
  museums: 'Museums',
  learning: 'Learning',
  languages: 'Languages',
  technology: 'Technology',
  'board games': 'Board games',
}

const INTELLECTUAL_TERMS = ['books', 'learning', 'languages', 'museums', 'technology']

function average(values) {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function percent(part, total) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

function percentDistribution(items, getCount) {
  const total = items.reduce((sum, item) => sum + getCount(item), 0)
  if (total === 0) return items.map((item) => ({ item, value: 0 }))

  const raw = items.map((item) => {
    const exact = (getCount(item) / total) * 100
    return {
      item,
      value: Math.floor(exact),
      remainder: exact % 1,
    }
  })

  let remaining = 100 - raw.reduce((sum, entry) => sum + entry.value, 0)
  const byRemainder = [...raw].sort((a, b) => b.remainder - a.remainder)

  for (const entry of byRemainder) {
    if (remaining <= 0) break
    entry.value += 1
    remaining -= 1
  }

  return raw.map(({ item, value }) => ({ item, value }))
}

function scoreSocial(log) {
  return log.socialFulfillment || SOCIAL_SCORE[log.social] || 35
}

function scoreMovement(log) {
  const movement = MOVEMENT_SCORE[log.movement] || 35
  const outside = log.outsideTime ? (OUTSIDE_MINUTES[log.outsideTime] / 150) * 100 : movement
  return Math.round((movement + outside) / 2)
}

function getArea(user) {
  return user.area || ZIP_AREAS[user.zipCode] || user.town || 'Unknown area'
}

function getAgeGroup(age) {
  return AGE_GROUPS.find((group) => age >= group.min && age <= group.max)?.label || 'Unknown'
}

function normalizeActivity(activity) {
  const cleaned = activity.trim().toLowerCase()
  const direct = ACTIVITY_ALIASES[cleaned]
  if (direct) return direct

  const matched = Object.entries(ACTIVITY_ALIASES).find(([term]) => cleaned.includes(term))
  if (matched) return matched[1]

  return activity.trim().replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getLogs(users) {
  return users.flatMap((user) =>
    (user.dailyLogs || []).map((log) => ({
      ...log,
      userId: user.id,
      userAge: Number(user.age),
      userArea: getArea(user),
      userInterests: user.interests || [],
    }))
  )
}

function getDesiredActivities(logs) {
  const counts = new Map()

  for (const log of logs) {
    const activities = new Set((log.wouldveLiked || []).map(normalizeActivity))
    for (const activity of activities) {
      const name = normalizeActivity(activity)
      counts.set(name, (counts.get(name) || 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

function getOutsideDistribution(logs) {
  const labels = ['None', 'Short', 'Moderate', 'Long']
  const counts = { None: 0, Short: 0, Moderate: 0, Long: 0 }

  for (const log of logs) {
    const key = log.outsideTime ? log.outsideTime.replace(/^\w/, (letter) => letter.toUpperCase()) : 'None'
    counts[key] = (counts[key] || 0) + 1
  }

  return percentDistribution(labels, (label) => counts[label]).map(({ item, value }) => ({
    label: item,
    value,
  }))
}

function getWeeklyTrend(logs) {
  const byDate = new Map()

  for (const log of logs) {
    if (!log.date) continue
    if (!byDate.has(log.date)) byDate.set(log.date, [])
    byDate.get(log.date).push(log)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, weekLogs]) => ({
      week: formatWeek(date),
      socialScore: average(weekLogs.map(scoreSocial)),
      movementScore: average(weekLogs.map(scoreMovement)),
    }))
}

function getActivityByDemographic(users) {
  return AGE_GROUPS.map(({ label }) => {
    const groupUsers = users.filter((user) => getAgeGroup(Number(user.age)) === label)
    const logs = getLogs(groupUsers)
    const interests = groupUsers.flatMap((user) => user.interests || [])
    const desired = logs.flatMap((log) => log.wouldveLiked || [])
    const intellectualSignals = [...interests, ...desired].filter((item) =>
      INTELLECTUAL_TERMS.some((term) => item.toLowerCase().includes(term))
    ).length
    const intellectualTotal = Math.max(interests.length + desired.length, 1)

    return {
      group: label,
      social: average(logs.map(scoreSocial)),
      physical: average(logs.map(scoreMovement)),
      intellectual: percent(intellectualSignals, intellectualTotal),
    }
  }).filter((group) => group.social || group.physical || group.intellectual)
}

function getUnmetActivitiesHeatmap(logs, topActivities) {
  const activities = topActivities.slice(0, 4).map((activity) => activity.name)
  const areas = [...new Set(logs.map((log) => log.userArea))]

  return areas.map((area) => {
    const areaLogs = logs.filter((log) => log.userArea === area)
    const areaActivityCounts = new Map()

    for (const log of areaLogs) {
      const wanted = new Set((log.wouldveLiked || []).map(normalizeActivity))
      for (const activity of wanted) {
        areaActivityCounts.set(activity, (areaActivityCounts.get(activity) || 0) + 1)
      }
    }

    return {
      area,
      activities: activities.map((activity) => ({
        name: activity,
        value: percent(areaActivityCounts.get(activity) || 0, areaLogs.length),
      })),
    }
  })
}

export function buildAggregateStats(users) {
  const logs = getLogs(users)
  const desiredActivities = getDesiredActivities(logs)
  const lowSocialLogs = logs.filter((log) => scoreSocial(log) < 45).length
  const outsideMinutes = logs.map((log) => OUTSIDE_MINUTES[log.outsideTime] ?? 0)
  const socialScores = logs.map(scoreSocial)

  return {
    totalUsers: users.length,
    lowSocialExposure: percent(lowSocialLogs, logs.length),
    avgOutsideTimeMinutes: average(outsideMinutes),
    socialFulfillment: average(socialScores),
    mostDesiredActivities: desiredActivities.slice(0, 6),
    weeklyTrend: getWeeklyTrend(logs),
    activityByDemographic: getActivityByDemographic(users),
    outsideTimeDistribution: getOutsideDistribution(logs),
    unmetActivitiesHeatmap: getUnmetActivitiesHeatmap(logs, desiredActivities),
    heatmapActivities: desiredActivities.slice(0, 4).map((activity) => activity.name),
  }
}
