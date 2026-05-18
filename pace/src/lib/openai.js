import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

const client = apiKey && apiKey !== 'sk-your-key-here'
  ? new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  : null

const SYSTEM_PROMPT = `You are the AI behind Pace, a life rhythm tracker app. Your role is to analyze daily activity data and provide gentle, non-judgmental insights.

STRICT RULES:
- Never use words like "lonely", "isolated", "depressed", "alone", or any clinical/diagnostic terms
- Frame everything as "social wellness", "life rhythm", "connection opportunities", "routine balance", "rhythm"
- Focus on what activities could add richness, not what is missing or wrong
- Always be warm, gentle, and encouraging
- Keep all text brief and human
- Suggest group activities (3-5 people), never 1-on-1 meetups`

export async function analyzeDayLog(log, userProfile) {
  if (!client) return getFallbackInsight(log)

  const prompt = `Analyze this daily log and return a JSON object.

User profile: ${JSON.stringify({ age: userProfile.age, occupation: userProfile.occupation, interests: userProfile.interests })}

Day log:
- Sleep: ${log.sleep || 'not logged'}
- Movement: ${log.movement || 'not logged'}
- Food: ${log.food || 'not logged'}
- Activity level: ${log.activity || 'not logged'}
- Social exposure: ${log.social || 'not logged'}
- Outside time: ${log.outsideTime || 'not logged'}
- Wished they had done: ${(log.wouldveLiked || []).join(', ') || 'nothing added'}
- Moments noted: ${(log.moments || []).join(', ') || 'none'}

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "insight": "1-2 warm sentences about their day rhythm, framed positively",
  "suggestion": "1 gentle sentence about something to try tomorrow",
  "activityBalance": {
    "physical": <0-100>,
    "social": <0-100>,
    "rest": <0-100>,
    "nutrition": <0-100>,
    "productivity": <0-100>
  },
  "socialFulfillment": <0-100>,
  "tags": ["up to 3 short activity-type tags like 'restful day', 'home-centered', 'low movement'"]
}`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    const text = response.choices[0].message.content.trim()
    return JSON.parse(text)
  } catch {
    return getFallbackInsight(log)
  }
}

export async function generatePlans(wouldveLiked, userProfile, demoUsers) {
  if (!client) return getFallbackPlans(wouldveLiked, userProfile)

  const matchedUsers = demoUsers
    .filter((u) =>
      u.interests.some((interest) => {
        const interestWords = interest.toLowerCase().split(/[\s,]+/)
        return wouldveLiked.some((w) => {
          const likedWords = w.toLowerCase().split(/[\s,]+/).filter((lw) => lw.length > 3)
          return interestWords.some((iw) =>
            likedWords.some((lw) => lw.includes(iw) || iw.includes(lw))
          )
        })
      })
    )
    .slice(0, 6)

  const prompt = `A user wants to do these activities: ${wouldveLiked.join(', ')}.

User profile: age ${userProfile.age}, location ${userProfile.town} (ZIP: ${userProfile.zipCode}), interests: ${(userProfile.interests || []).join(', ')}.

Nearby users who share interests: ${matchedUsers.map((u) => `${u.name} (${u.age}yo, likes: ${u.interests.join(', ')})`).join('; ')}

Create 2-3 gentle group activity plan proposals. Each should be casual, low-pressure, and for 3-5 people.

Return ONLY valid JSON array (no markdown) with this structure:
[
  {
    "id": "plan_1",
    "title": "Short, warm activity title",
    "description": "1-2 sentences, casual and inviting. No pressure language.",
    "activityType": "one of: active, creative, social, intellectual, outdoor",
    "suggestedTime": "e.g. This Saturday morning",
    "location": "general location type e.g. Local park, Neighbourhood café",
    "participantNames": ["name1", "name2", "name3"],
    "groupSize": <3-5>
  }
]`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 600,
    })

    const text = response.choices[0].message.content.trim()
    return JSON.parse(text)
  } catch {
    return getFallbackPlans(wouldveLiked, userProfile)
  }
}

function getFallbackInsight(log) {
  const hasSocial = log.social && log.social !== 'alone'
  const hasMovement = log.movement && log.movement !== 'stayed'
  const goodSleep = log.sleep === 'good'

  return {
    insight: goodSleep
      ? 'A well-rested day creates a steady foundation for everything else. Your rhythm looks calm today.'
      : hasSocial
      ? 'You made space for connection today — that shapes the texture of a day more than most things.'
      : 'Even quiet days have their own rhythm. Small habits build over time.',
    suggestion: hasMovement
      ? 'Tomorrow, try carrying that movement into something shared — even a short walk with someone nearby.'
      : 'A short step outside tomorrow can shift the whole day\'s feel.',
    activityBalance: {
      physical: log.movement === 'outside' ? 75 : log.movement === 'short' ? 45 : 20,
      social: log.social === 'conversations' ? 80 : log.social === 'minimal' ? 40 : 15,
      rest: log.sleep === 'good' ? 85 : log.sleep === 'high' ? 60 : 30,
      nutrition: log.food === 'home' ? 85 : log.food === 'mixed' ? 65 : log.food === 'convenience' ? 40 : 20,
      productivity: log.activity === 'productive' ? 85 : log.activity === 'light' ? 55 : 25,
    },
    socialFulfillment: log.social === 'conversations' ? 78 : log.social === 'minimal' ? 42 : 18,
    tags: ['day tracked'],
  }
}

function getFallbackPlans(wouldveLiked, userProfile) {
  const plans = [
    {
      id: 'plan_fallback_1',
      title: 'Morning Walk at the Park',
      description: 'A relaxed stroll through the local park — no agenda, just fresh air and good company at whatever pace feels right.',
      activityType: 'outdoor',
      suggestedTime: 'This Saturday morning',
      location: 'Local park',
      participantNames: ['Sofia', 'Marcus', 'Elena'],
      groupSize: 4,
    },
    {
      id: 'plan_fallback_2',
      title: 'Coffee and Conversation',
      description: 'An easy gathering at a neighbourhood café — a chance to sit, talk, and see where the conversation goes.',
      activityType: 'social',
      suggestedTime: 'Sunday afternoon',
      location: 'Neighbourhood café',
      participantNames: ['Lucas', 'Mia', 'Tom'],
      groupSize: 4,
    },
    {
      id: 'plan_fallback_3',
      title: 'Casual Book Exchange',
      description: 'Bring a book you loved, leave with one you haven\'t read — a small gathering for people who like stories.',
      activityType: 'intellectual',
      suggestedTime: 'Next Friday evening',
      location: 'Community library or café',
      participantNames: ['Ava', 'Daniel', 'Lea'],
      groupSize: 5,
    },
  ]
  return plans.slice(0, 2)
}
