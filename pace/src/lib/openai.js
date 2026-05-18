const apiKey = import.meta.env.VITE_GEMINI_API_KEY
const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite'

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const SYSTEM_PROMPT = `You are the AI behind Pace, a life rhythm tracker app. Your role is to analyze daily activity data and provide gentle, non-judgmental insights.

STRICT RULES:
- Never use words like "lonely", "isolated", "depressed", "alone", or any clinical/diagnostic terms
- Frame everything as "social wellness", "life rhythm", "connection opportunities", "routine balance", "rhythm"
- Focus on what activities could add richness, not what is missing or wrong
- Always be warm, gentle, and encouraging
- Keep all text brief and human
- Suggest group activities (3-5 people), never 1-on-1 meetups`

async function generateJson(prompt, { temperature = 0.7, maxOutputTokens = 500 } = {}) {
  if (!apiKey) throw new Error('Missing Gemini API key')

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim()

  if (!text) throw new Error('Gemini returned an empty response')

  return JSON.parse(text)
}

export async function analyzeDayLog(log, userProfile) {
  const prompt = `Analyze this daily log and return a JSON object.

User profile: ${JSON.stringify({ age: userProfile.age, occupation: userProfile.occupation, interests: userProfile.interests })}

Day log:
- Sleep: ${log.sleep || 'not logged'}
- Movement: ${log.movement || 'not logged'}
- Meals: ${
  log.meals
    ? Object.entries(log.meals)
        .filter(([, v]) => v?.type)
        .map(([k, v]) => `${k}: ${v.type}${v.description ? ` (${v.description})` : ''}`)
        .join(', ') || 'not logged'
    : log.food || 'not logged'
}
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
    return await generateJson(prompt, { temperature: 0.7, maxOutputTokens: 500 })
  } catch (error) {
    console.error('Gemini analyzeDayLog failed:', error)
    return getFallbackInsight(log)
  }
}

export async function generatePlans(wouldveLiked, userProfile, demoUsers) {
  const enrichedUsers = demoUsers.map((u) => ({
    name: u.name,
    age: u.age,
    town: u.town,
    zipCode: u.zipCode,
    interests: u.interests,
    wouldveLiked: [...new Set((u.dailyLogs || []).flatMap((l) => l.wouldveLiked || []))],
  }))

  const prompt = `You are matching a user with real people for casual group activities.

Current user:
- Age: ${userProfile.age}
- Location: ${[userProfile.town, userProfile.zipCode, userProfile.country].filter(Boolean).join(', ')}
- Interests: ${(userProfile.interests || []).join(', ')}
- Would've liked to do recently: ${wouldveLiked.join(', ')}

Available people:
${enrichedUsers.map((u) => `- ${u.name} (${u.age}yo, ${u.town} ZIP ${u.zipCode}): interests: ${u.interests.join(', ')}; would've liked: ${u.wouldveLiked.join(', ')}`).join('\n')}

TASK: Create 2-3 casual group activity proposals (3-5 people each).

MATCHING RULES:
1. Select participants whose "would've liked" or interests overlap with the current user's "would've liked" items
2. Prefer participants in nearby locations — be generous, people can travel within reasonable distance
3. If no one shares the exact activity, propose a similar one (e.g. nobody runs → suggest a walk with someone who likes walking)
4. Only use names from the list above in participantNames — never invent new names
5. Keep plans low-pressure and inviting

Return ONLY valid JSON array (no markdown) with this structure:
[
  {
    "id": "plan_1",
    "title": "Short, warm activity title",
    "description": "1-2 sentences, casual and inviting. No pressure language.",
    "activityType": "one of: active, creative, social, intellectual, outdoor",
    "suggestedTime": "e.g. This Saturday morning",
    "location": "a specific, real well-known venue or place near the user's area — use the actual name (e.g. a real park, plaza, beach, café, or landmark), NOT generic descriptions like 'Local park' or 'Neighbourhood café'. Base it on the user's town/ZIP.",
    "icon": "one of: coffee, walk, run, bike, food, book, art, music, nature, beach, sport, social, photo, game — pick the one that best matches the specific activity",
    "participantNames": ["name1", "name2", "name3"],
    "groupSize": <3-5>
  }
]`

  try {
    return await generateJson(prompt, { temperature: 0.8, maxOutputTokens: 800 })
  } catch (error) {
    console.error('Gemini generatePlans failed:', error)
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
      title: 'Morning Walk at Ciutadella',
      description: 'A relaxed stroll through Parc de la Ciutadella — no agenda, just fresh air and good company at whatever pace feels right.',
      activityType: 'outdoor',
      suggestedTime: 'This Saturday morning',
      location: 'Parc de la Ciutadella, Barcelona',
      icon: 'walk',
      participantNames: ['Sofia', 'Marcus', 'Elena'],
      groupSize: 4,
    },
    {
      id: 'plan_fallback_2',
      title: 'Coffee at El Born',
      description: 'An easy gathering at Bar del Pla in El Born — a chance to sit, talk, and see where the conversation goes.',
      activityType: 'social',
      suggestedTime: 'Sunday afternoon',
      location: 'Bar del Pla, El Born, Barcelona',
      icon: 'coffee',
      participantNames: ['Lucas', 'Mia', 'Tom'],
      groupSize: 4,
    },
    {
      id: 'plan_fallback_3',
      title: 'Casual Book Exchange',
      description: 'Bring a book you loved, leave with one you haven\'t read — a small gathering at the Mercat de Sant Antoni for people who like stories.',
      activityType: 'intellectual',
      suggestedTime: 'Next Friday evening',
      location: 'Mercat de Sant Antoni, Barcelona',
      icon: 'book',
      participantNames: ['Ava', 'Daniel', 'Lea'],
      groupSize: 5,
    },
  ]
  return plans.slice(0, 2)
}
