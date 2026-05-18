import { describe, it, expect } from 'vitest'
import { generatePlans, analyzeDayLog } from '../lib/openai'
import { demoUsers, demoAggregateStats } from '../data/demoUsers'

// ─── shared fixtures ──────────────────────────────────────────────────────────

const DEMO_USER_NAMES = demoUsers.map((u) => u.name)
const VALID_ACTIVITY_TYPES = ['active', 'creative', 'social', 'intellectual', 'outdoor']
const BANNED_WORDS = ['lonely', 'isolated', 'depressed', 'alone', 'diagnostic', 'clinical']

// A realistic user profile that overlaps with several demoUser interests
const sampleUser = {
  age: 28,
  town: 'Barcelona',
  zipCode: '08001',
  occupation: 'part-time',
  interests: ['Walking', 'Coffee chats', 'Books'],
}

// Items from WouldveLiked that map to demoUser interests after the word-level fix:
//   "taken a walk outside" → Sofia, Mia  (Walking)
//   "visited a museum"     → Elena, Ava  (Museums)
//   "attended a local event" → Marcus   (Local events)
const wouldveLiked = ['taken a walk outside', 'visited a museum', 'attended a local event']

// A low-social day log — should produce low socialFulfillment score
const lowSocialLog = {
  sleep: 'okay',
  movement: 'short',
  food: 'mixed',
  activity: 'light',
  social: 'minimal',
  outsideTime: 'short',
  wouldveLiked,
}

// A well-balanced day log — should produce high activityBalance scores
const activeSocialLog = {
  sleep: 'good',
  movement: 'outside',
  food: 'home',
  activity: 'productive',
  social: 'conversations',
  outsideTime: 'long',
  wouldveLiked: [],
}

// ─── generatePlans ────────────────────────────────────────────────────────────

describe('generatePlans — plan structure', () => {
  it('returns 2–3 plans', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    expect(plans.length).toBeGreaterThanOrEqual(2)
    expect(plans.length).toBeLessThanOrEqual(3)
  })

  it('each plan has all required fields', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    for (const plan of plans) {
      expect(plan.id).toBeTruthy()
      expect(plan.title).toBeTruthy()
      expect(plan.description).toBeTruthy()
      expect(plan.suggestedTime).toBeTruthy()
      expect(plan.location).toBeTruthy()
      expect(VALID_ACTIVITY_TYPES).toContain(plan.activityType)
      expect(Array.isArray(plan.participantNames)).toBe(true)
      expect(plan.groupSize).toBeGreaterThanOrEqual(3)
      expect(plan.groupSize).toBeLessThanOrEqual(5)
    }
  })

  it('groupSize matches the length of participantNames', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    for (const plan of plans) {
      expect(plan.participantNames.length).toBeLessThanOrEqual(plan.groupSize)
    }
  })
})

describe('generatePlans — demoUser alignment', () => {
  it('participant names come from the demoUsers list', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    for (const plan of plans) {
      for (const name of plan.participantNames) {
        expect(
          DEMO_USER_NAMES,
          `"${name}" is not a demoUser — AI invented a participant`
        ).toContain(name)
      }
    }
  })

  it('plan activities relate to the wouldveLiked input', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    // At least one plan should be outdoor or social (walking/museum/events input)
    const relevantTypes = plans.filter((p) =>
      ['outdoor', 'social', 'active', 'intellectual'].includes(p.activityType)
    )
    expect(relevantTypes.length).toBeGreaterThanOrEqual(1)
  })
})

describe('generatePlans — content safety', () => {
  it('titles and descriptions avoid banned language', async () => {
    const plans = await generatePlans(wouldveLiked, sampleUser, demoUsers)
    for (const plan of plans) {
      for (const word of BANNED_WORDS) {
        expect(plan.title.toLowerCase()).not.toContain(word)
        expect(plan.description.toLowerCase()).not.toContain(word)
      }
    }
  })
})

// ─── analyzeDayLog ────────────────────────────────────────────────────────────

describe('analyzeDayLog — response structure', () => {
  it('returns all required fields', async () => {
    const result = await analyzeDayLog(lowSocialLog, sampleUser)
    expect(result.insight).toBeTruthy()
    expect(result.suggestion).toBeTruthy()
    expect(typeof result.socialFulfillment).toBe('number')
    expect(typeof result.activityBalance).toBe('object')
    expect(Array.isArray(result.tags)).toBe(true)
  })

  it('activityBalance has all 5 dimensions within 0–100', async () => {
    const result = await analyzeDayLog(lowSocialLog, sampleUser)
    const dims = ['physical', 'social', 'rest', 'nutrition', 'productivity']
    for (const dim of dims) {
      expect(result.activityBalance[dim], `${dim} out of range`).toBeGreaterThanOrEqual(0)
      expect(result.activityBalance[dim], `${dim} out of range`).toBeLessThanOrEqual(100)
    }
  })

  it('socialFulfillment is within 0–100', async () => {
    const result = await analyzeDayLog(lowSocialLog, sampleUser)
    expect(result.socialFulfillment).toBeGreaterThanOrEqual(0)
    expect(result.socialFulfillment).toBeLessThanOrEqual(100)
  })

  it('tags is an array of up to 3 strings', async () => {
    const result = await analyzeDayLog(lowSocialLog, sampleUser)
    expect(result.tags.length).toBeLessThanOrEqual(3)
    for (const tag of result.tags) {
      expect(typeof tag).toBe('string')
    }
  })
})

describe('analyzeDayLog — content safety', () => {
  it('insight and suggestion avoid banned language', async () => {
    const result = await analyzeDayLog(lowSocialLog, sampleUser)
    for (const word of BANNED_WORDS) {
      expect(result.insight.toLowerCase()).not.toContain(word)
      expect(result.suggestion.toLowerCase()).not.toContain(word)
    }
  })
})

describe('analyzeDayLog — score direction', () => {
  it('active social day scores higher than low social day', async () => {
    const [active, low] = await Promise.all([
      analyzeDayLog(activeSocialLog, sampleUser),
      analyzeDayLog(lowSocialLog, sampleUser),
    ])
    expect(active.socialFulfillment).toBeGreaterThan(low.socialFulfillment)
    expect(active.activityBalance.physical).toBeGreaterThan(low.activityBalance.physical)
  })
})

// ─── demoAggregateStats — admin page data ─────────────────────────────────────

describe('demoAggregateStats — admin data integrity', () => {
  it('totalUsers is a realistic population figure', () => {
    expect(demoAggregateStats.totalUsers).toBeGreaterThan(100)
  })

  it('weeklyTrend has 7 entries with scores in 0–100', () => {
    expect(demoAggregateStats.weeklyTrend).toHaveLength(7)
    for (const week of demoAggregateStats.weeklyTrend) {
      expect(week.socialScore).toBeGreaterThanOrEqual(0)
      expect(week.socialScore).toBeLessThanOrEqual(100)
      expect(week.movementScore).toBeGreaterThanOrEqual(0)
      expect(week.movementScore).toBeLessThanOrEqual(100)
    }
  })

  it('outsideTimeDistribution sums to 100%', () => {
    const total = demoAggregateStats.outsideTimeDistribution.reduce(
      (sum, d) => sum + d.value,
      0
    )
    expect(total).toBe(100)
  })

  it('mostDesiredActivities align with demoUser interests', () => {
    const allInterests = demoUsers.flatMap((u) => u.interests.map((i) => i.toLowerCase()))
    for (const activity of demoAggregateStats.mostDesiredActivities) {
      const name = activity.name.toLowerCase()
      const matched = allInterests.some(
        (i) => i.includes(name) || name.includes(i)
      )
      expect(matched, `"${activity.name}" has no matching demoUser interest`).toBe(true)
    }
  })

  it('unmetActivitiesHeatmap percentages are 0–100', () => {
    for (const row of demoAggregateStats.unmetActivitiesHeatmap) {
      for (const val of [row.coffee, row.walking, row.events, row.yoga]) {
        expect(val).toBeGreaterThanOrEqual(0)
        expect(val).toBeLessThanOrEqual(100)
      }
    }
  })

  it('activityByDemographic covers expected age groups', () => {
    const groups = demoAggregateStats.activityByDemographic.map((d) => d.group)
    expect(groups).toContain('18-25')
    expect(groups).toContain('26-35')
    expect(groups).toContain('36-50')
    expect(groups).toContain('50+')
  })
})
