import * as functions from 'firebase-functions/v2'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

export const submitFeedback = functions.https.onCall(async (request) => {
  const { sentiment, comment, emoji, dishId } = request.data as {
    sentiment: string
    comment?: string
    emoji: string
    dishId?: string | null
  }

  const docRef = await db.collection('feedback').add({
    sentiment,
    comment: comment ?? null,
    emoji,
    dishId: dishId ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { success: true, id: docRef.id }
})

export const getLeaderboard = functions.https.onCall(async () => {
  const snapshot = await db.collection('leaderboard').orderBy('score', 'desc').limit(10).get()
  const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  return { entries }
})

export const getTodaysMenu = functions.https.onCall(async () => {
  const today = new Date().toISOString().split('T')[0]
  const docRef = db.collection('dailyMenus').doc(today)
  const docSnap = await docRef.get()

  if (!docSnap.exists) {
    return { dishes: [] }
  }

  const data = docSnap.data()
  return { dishes: data?.dishes ?? [] }
})

type GenieMessage = {
  role: 'user' | 'assistant'
  content: string
}

type GenieRequest = {
  history: GenieMessage[]
  dishes?: Array<{
    id: string
    name: string
    spice?: number
    description?: string
    available?: boolean
  }>
  leaderboard?: Array<{
    name: string
    dish: string
    score: number
  }>
}

const classifyMood = (text: string): string => {
  const lower = text.toLowerCase()
  if (lower.includes('ha!') || lower.includes('told you')) return 'sass'
  if (lower.includes('brave') || lower.includes('challenge')) return 'delighted'
  if (lower.includes('spice') || lower.includes('fire')) return 'eyerolled'
  if (lower.includes('careful') || lower.includes('warning')) return 'warning'
  return 'idle'
}

const buildFallbackReply = (prompt: string, dishes: GenieRequest['dishes']): string => {
  const lower = prompt.toLowerCase()
  if (lower.includes('recommend')) {
    const pick = dishes?.find((dish) => dish.available !== false) ?? dishes?.[0]
    if (pick) {
      return `Fine. Order the ${pick.name}. It will probably set your eyebrows on fire, but you'll thank me.`
    }
    return 'No specials left, so maybe try water?'
  }
  if (lower.includes('spice') || lower.includes('hot')) {
    return "This is Andhra. Everything is hot. Bring tissues and bravery."
  }
  if (lower.includes('mild')) {
    return 'Mild? Cute. Try the punugulu and pretend they bite.'
  }
  return 'Ask me about dishes, spice levels, or why you should fear the chilli fryer.'
}

export const chatWithGenie = functions.https.onCall(async (request) => {
  const data = (request.data ?? {}) as GenieRequest
  const history = data.history ?? []
  const dishes = data.dishes ?? []
  const leaderboard = data.leaderboard ?? []

  const latestUser = [...history].reverse().find((message) => message.role === 'user')

  const hfUrl = process.env.HUGGINGFACE_API_URL
  const hfToken = process.env.HUGGINGFACE_API_TOKEN
  const apiKey = process.env.OPENAI_API_KEY

  if (!hfUrl && !apiKey) {
    const reply = buildFallbackReply(latestUser?.content ?? '', dishes)
    return { reply, mood: classifyMood(reply), source: 'fallback' }
  }

  const menuSummary = dishes
    .map((dish) => `${dish.name} (spice ${dish.spice ?? 'n/a'}) - ${dish.description ?? 'No description'} [${dish.available === false ? 'unavailable' : 'available'}]`)
    .join('\n')

  const leaderboardSummary = leaderboard
    .map((entry) => `${entry.name}: ${entry.dish} (${entry.score} pts)`)
    .join('\n')

  const systemPrompt = `You are ATRIA RUCHULU's Food Genie: a witty, sarcastic yet knowledgeable AI sommelier for fiery Andhra cuisine. Answer with playful snark while still giving accurate info about dishes, spice levels, availability, and trivia. Keep replies under 120 words. If a dish is unavailable, make that clear.`

  if (hfUrl && hfToken) {
    const conversation = history
      .map((message) => `${message.role === 'user' ? 'User' : 'Genie'}: ${message.content}`)
      .join('\n')

    const prompt = `${systemPrompt}\n\nContext:\n${menuSummary || 'No live dishes.'}\n\nLeaderboard:\n${leaderboardSummary || 'No contenders yet.'}\n\nConversation so far:\n${conversation}\nGenie:`

    const hfResponse = await fetch(hfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hfToken}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 180,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!hfResponse.ok) {
      const message = await hfResponse.text()
      console.error('HuggingFace error', message)
    } else {
      const hfPayload = (await hfResponse.json()) as
        | { generated_text?: string }
        | Array<{ generated_text?: string }>
        | { error: string }

      const generated = Array.isArray(hfPayload)
        ? hfPayload[0]?.generated_text
        : 'generated_text' in hfPayload
        ? hfPayload.generated_text
        : undefined

      if (generated) {
        const reply = generated.trim()
        return { reply, mood: classifyMood(reply), source: 'huggingface' }
      }
    }
  }

  if (!apiKey) {
    const reply = buildFallbackReply(latestUser?.content ?? '', dishes)
    return { reply, mood: classifyMood(reply), source: 'fallback' }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'system',
      content: `Today's menu:\n${menuSummary || 'No live dishes.'}\n\nLeaderboard:\n${leaderboardSummary || 'No contenders yet.'}`,
    },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.75,
      messages,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new functions.https.HttpsError('internal', `Genie failed: ${message}`)
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const reply = payload.choices?.[0]?.message?.content?.trim()
  if (!reply) {
    const fallback = buildFallbackReply(latestUser?.content ?? '', dishes)
    return { reply: fallback, mood: classifyMood(fallback), source: 'fallback' }
  }

  return { reply, mood: classifyMood(reply), source: 'openai' }
})
