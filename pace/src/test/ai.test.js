import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { demoAggregateStats, demoUsers } from '../data/demoUsers'
import { buildAggregateStats } from '../lib/adminStats'

const VALID_ACTIVITY_TYPES = ['active', 'creative', 'social', 'intellectual', 'outdoor']
const BANNED_WORDS = ['lonely', 'isolated', 'depressed', 'alone', 'diagnostic', 'clinical']
const BALANCE_DIMS = ['physical', 'social', 'rest', 'nutrition', 'productivity']
const fetchMock = vi.fn()

const sampleUser = {
  age: 28,
  town: 'Barcelona',
  zipCode: '08001',
  occupation: 'part-time',
  interests: ['Walking', 'Coffee chats', 'Books'],
}

const footballUser = {
  ...sampleUser,
  interests: ['Football', 'Running', 'Local sports'],
}

const footballUsers = demoUsers.map((user) => ({
  ...user,
  interests: ['Football', 'Running', 'Outdoor games'],
  dailyLogs: user.dailyLogs.map((log) => ({
    ...log,
    movement: 'outside',
    outsideTime: 'long',
    social: 'conversations',
    wouldveLiked: ['played football', 'joined a casual football match'],
  })),
}))

const footballWishes = ['played football', 'joined a casual football match', 'spent time at a local pitch']

const lowSocialLog = {
  sleep: 'low',
  movement: 'short',
  food: 'mixed',
  activity: 'light',
  social: 'minimal',
  outsideTime: 'short',
  wouldveLiked: ['taken a walk outside', 'visited a museum'],
  moments: ['had a calm morning'],
}

const activeSocialLog = {
  sleep: 'good',
  movement: 'outside',
  food: 'home',
  activity: 'productive',
  social: 'conversations',
  outsideTime: 'long',
  wouldveLiked: [],
  moments: ['played football with neighbours'],
}

async function importAiModule(apiKey = 'test-key') {
  vi.resetModules()
  vi.stubEnv('VITE_GEMINI_API_KEY', apiKey)
  return import('../lib/openai')
}

function getLastRequest() {
  return {
    url: fetchMock.mock.calls.at(-1)[0],
    body: JSON.parse(fetchMock.mock.calls.at(-1)[1].body),
  }
}

function getUserPrompt() {
  return getLastRequest().body.contents[0].parts[0].text
}

function mockGeminiJson(payload) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify(payload) }],
          },
        },
      ],
    }),
  })
}

function mockGeminiText(text) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text }],
          },
        },
      ],
    }),
  })
}

function assertNoBannedLanguage(text) {
  for (const word of BANNED_WORDS) {
    expect(text.toLowerCase()).not.toContain(word)
  }
}

function assertActivityBalance(balance) {
  for (const dim of BALANCE_DIMS) {
    expect(balance[dim], `${dim} must be a number`).toEqual(expect.any(Number))
    expect(balance[dim], `${dim} below range`).toBeGreaterThanOrEqual(0)
    expect(balance[dim], `${dim} above range`).toBeLessThanOrEqual(100)
  }
}

function assertPlanContract(plan, allowedNames) {
  expect(plan.id).toBeTruthy()
  expect(plan.title).toBeTruthy()
  expect(plan.description).toBeTruthy()
  expect(plan.suggestedTime).toBeTruthy()
  expect(plan.location).toBeTruthy()
  expect(VALID_ACTIVITY_TYPES).toContain(plan.activityType)
  expect(plan.groupSize).toBeGreaterThanOrEqual(3)
  expect(plan.groupSize).toBeLessThanOrEqual(5)
  expect(plan.participantNames.length).toBeGreaterThanOrEqual(3)
  expect(plan.participantNames.length).toBeLessThanOrEqual(plan.groupSize)

  for (const name of plan.participantNames) {
    expect(allowedNames, `${name} should come from the provided demo users`).toContain(name)
  }

  assertNoBannedLanguage(`${plan.title} ${plan.description}`)
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('generatePlans', () => {
  it('builds a prompt from the user wish list and the matching demo users', async () => {
    mockGeminiJson([
      {
        id: 'plan_football_1',
        title: 'Casual Football at the Park',
        description: 'A relaxed small-sided match at a nearby pitch with people who enjoy easy outdoor games.',
        activityType: 'active',
        suggestedTime: 'This Saturday morning',
        location: 'Local football pitch',
        participantNames: ['Sofia', 'Marcus', 'Elena'],
        groupSize: 4,
      },
      {
        id: 'plan_football_2',
        title: 'Neighbourhood Kickabout',
        description: 'A low-pressure group football session with room to play, chat, and take breaks.',
        activityType: 'outdoor',
        suggestedTime: 'Sunday afternoon',
        location: 'Community sports field',
        participantNames: ['Lucas', 'Mia', 'Tom'],
        groupSize: 4,
      },
    ])

    const { generatePlans } = await importAiModule()
    const plans = await generatePlans(footballWishes, footballUser, footballUsers)
    const request = getLastRequest()
    const prompt = getUserPrompt()

    expect(request.url).toContain('gemini-2.5-flash-lite:generateContent')
    expect(request.body.generationConfig.responseMimeType).toBe('application/json')
    expect(prompt).toContain('played football')
    expect(prompt).toContain('joined a casual football match')
    expect(prompt).toContain('Football')
    expect(prompt).toContain('Local sports')

    for (const user of footballUsers.slice(0, 6)) {
      expect(prompt).toContain(user.name)
      expect(prompt).toContain('Football')
    }

    expect(plans).toHaveLength(2)
    for (const plan of plans) {
      assertPlanContract(plan, footballUsers.map((user) => user.name))
      expect(`${plan.title} ${plan.description} ${plan.location}`).toMatch(/football|pitch|kickabout|sports field/i)
    }
  })

  it('limits matched participants in the prompt to the first six relevant demo users', async () => {
    mockGeminiJson([])

    const { generatePlans } = await importAiModule()
    await generatePlans(footballWishes, footballUser, footballUsers)
    const prompt = getUserPrompt()

    for (const user of footballUsers.slice(0, 6)) {
      expect(prompt).toContain(user.name)
    }

    for (const user of footballUsers.slice(6)) {
      expect(prompt).not.toContain(`${user.name} (${user.age}yo`)
    }
  })

  it('falls back to safe default plans when the model response is not valid JSON', async () => {
    mockGeminiText('not json')

    const { generatePlans } = await importAiModule()
    const plans = await generatePlans(footballWishes, footballUser, footballUsers)

    expect(plans).toHaveLength(2)
    for (const plan of plans) {
      assertPlanContract(plan, demoUsers.map((user) => user.name))
    }
  })
})

describe('analyzeDayLog', () => {
  it('sends the full day log context to the model and parses the returned scores', async () => {
    mockGeminiJson({
      insight: 'Your day had a steady rhythm with movement, shared moments, and good recovery.',
      suggestion: 'Tomorrow, a casual group activity could keep that rhythm feeling easy.',
      activityBalance: {
        physical: 88,
        social: 82,
        rest: 85,
        nutrition: 90,
        productivity: 78,
      },
      socialFulfillment: 84,
      tags: ['active day', 'shared rhythm', 'well rested'],
    })

    const { analyzeDayLog } = await importAiModule()
    const result = await analyzeDayLog(activeSocialLog, footballUser)
    const prompt = getUserPrompt()

    expect(prompt).toContain('Sleep: good')
    expect(prompt).toContain('Movement: outside')
    expect(prompt).toContain('Food: home')
    expect(prompt).toContain('Social exposure: conversations')
    expect(prompt).toContain('Moments noted: played football with neighbours')
    expect(prompt).toContain('"interests":["Football","Running","Local sports"]')

    expect(result.insight).toBeTruthy()
    expect(result.suggestion).toBeTruthy()
    expect(result.socialFulfillment).toBe(84)
    expect(result.tags).toHaveLength(3)
    assertActivityBalance(result.activityBalance)
    assertNoBannedLanguage(`${result.insight} ${result.suggestion} ${result.tags.join(' ')}`)
  })

  it('keeps fallback scoring direction sensible when no API key is configured', async () => {
    const { analyzeDayLog } = await importAiModule('')

    const active = await analyzeDayLog(activeSocialLog, sampleUser)
    const low = await analyzeDayLog(lowSocialLog, sampleUser)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(active.socialFulfillment).toBeGreaterThan(low.socialFulfillment)
    expect(active.activityBalance.physical).toBeGreaterThan(low.activityBalance.physical)
    expect(active.activityBalance.rest).toBeGreaterThan(low.activityBalance.rest)
    assertActivityBalance(active.activityBalance)
    assertActivityBalance(low.activityBalance)
    assertNoBannedLanguage(`${active.insight} ${active.suggestion}`)
    assertNoBannedLanguage(`${low.insight} ${low.suggestion}`)
  })

  it('falls back to safe analysis when the model response is not valid JSON', async () => {
    mockGeminiText('not json')

    const { analyzeDayLog } = await importAiModule()
    const result = await analyzeDayLog(lowSocialLog, sampleUser)

    expect(result.socialFulfillment).toBe(42)
    assertActivityBalance(result.activityBalance)
    assertNoBannedLanguage(`${result.insight} ${result.suggestion} ${result.tags.join(' ')}`)
  })
})

describe('demoAggregateStats admin dashboard data', () => {
  it('uses internally consistent dashboard source data', () => {
    expect(demoAggregateStats.totalUsers).toBe(demoUsers.length)
    expect(demoAggregateStats.weeklyTrend).toHaveLength(7)
    expect(demoAggregateStats.outsideTimeDistribution.reduce((sum, item) => sum + item.value, 0)).toBe(100)
    expect(demoAggregateStats.socialFulfillment).toBeGreaterThan(0)
  })

  it('keeps all dashboard percentages and scores in the 0-100 range', () => {
    for (const week of demoAggregateStats.weeklyTrend) {
      expect(week.socialScore).toBeGreaterThanOrEqual(0)
      expect(week.socialScore).toBeLessThanOrEqual(100)
      expect(week.movementScore).toBeGreaterThanOrEqual(0)
      expect(week.movementScore).toBeLessThanOrEqual(100)
    }

    for (const row of demoAggregateStats.unmetActivitiesHeatmap) {
      for (const activity of row.activities) {
        const { value } = activity
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(100)
      }
    }

    for (const group of demoAggregateStats.activityByDemographic) {
      for (const value of [group.social, group.physical, group.intellectual]) {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(100)
      }
    }
  })

  it('keeps desired activities aligned with the demo population interests', () => {
    const interests = demoUsers.flatMap((user) => user.interests.map((interest) => interest.toLowerCase()))

    for (const activity of demoAggregateStats.mostDesiredActivities) {
      const activityName = activity.name.toLowerCase()
      const matchedInterest = interests.some((interest) =>
        interest.includes(activityName) || activityName.includes(interest)
      )

      expect(matchedInterest, `${activity.name} should map to at least one demo user interest`).toBe(true)
      expect(activity.count).toBeGreaterThan(0)
    }
  })

  it('is derived from raw users and daily logs instead of preset aggregate numbers', () => {
    const stats = buildAggregateStats(footballUsers)

    expect(stats.totalUsers).toBe(footballUsers.length)
    expect(stats.avgOutsideTimeMinutes).toBe(150)
    expect(stats.lowSocialExposure).toBe(0)
    expect(stats.mostDesiredActivities[0].name).toBe('Football')
    expect(stats.mostDesiredActivities[0].count).toBe(footballUsers.length * footballUsers[0].dailyLogs.length)
    expect(stats.weeklyTrend.every((week) => week.movementScore > 80)).toBe(true)
    expect(stats.weeklyTrend.every((week) => week.socialScore > 80)).toBe(true)
    expect(stats.unmetActivitiesHeatmap.every((row) =>
      row.activities.some((activity) => activity.name === 'Football' && activity.value === 100)
    )).toBe(true)
  })
})
