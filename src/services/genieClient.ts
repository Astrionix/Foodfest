import type { DailyDish } from '../hooks/useDailyMenu'

export type GenieMood = 'idle' | 'delighted' | 'eyerolled' | 'warning' | 'sass'

export type GenieMessage = {
  id: string
  role: 'user' | 'genie'
  content: string
}

export type GenieChatResponse = {
  reply: string
  mood: GenieMood
  source: 'openai' | 'fallback' | 'openrouter'
}

const classifyMood = (text: string): GenieMood => {
  const lower = text.toLowerCase()
  if (lower.includes('ha!') || lower.includes('told you')) return 'sass'
  if (lower.includes('brave') || lower.includes('challenge')) return 'delighted'
  if (lower.includes('spice') || lower.includes('fire')) return 'eyerolled'
  if (lower.includes('careful') || lower.includes('warning')) return 'warning'
  return 'idle'
}

const buildFallbackReply = (prompt: string, dishes: DailyDish[]) => {
  const lower = prompt.toLowerCase()
  if (lower.includes('recommend')) {
    const pick = dishes.find((dish) => dish.available !== false) ?? dishes[0]
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

const toMenuSummary = (dishes: DailyDish[]) =>
  dishes
    .map((dish) => `${dish.name} (spice ${dish.spice ?? 'n/a'}) - ${dish.description ?? 'No description'} [${dish.available === false ? 'unavailable' : 'available'}]`)
    .join('\n')

const toLeaderboardSummary = (leaderboard: { name: string; dish: string; score: number }[]) =>
  leaderboard.map((entry) => `${entry.name}: ${entry.dish} (${entry.score} pts)`).join('\n')

export async function chatWithGenie(history: GenieMessage[], dishes: DailyDish[], leaderboard: { name: string; dish: string; score: number }[]): Promise<GenieChatResponse> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    const latestUser = [...history].reverse().find((message) => message.role === 'user')
    const fallback = buildFallbackReply(latestUser?.content ?? '', dishes)
    return { reply: fallback, mood: classifyMood(fallback), source: 'fallback' }
  }

  const systemPrompt = "You are ATRIA RUCHULU's Food Genie: a witty, sarcastic yet knowledgeable AI sommelier for fiery Andhra cuisine. Answer with playful snark while still giving accurate info about dishes, spice levels, availability, and trivia. Keep replies under 120 words. If a dish is unavailable, make that clear."

  const contextualPrompt = `Today's menu:\n${toMenuSummary(dishes) || 'No live dishes.'}\n\nLeaderboard:\n${toLeaderboardSummary(leaderboard) || 'No contenders yet.'}`

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: contextualPrompt },
    ...history.map((message) => ({
      role: message.role === 'genie' ? 'assistant' : 'user',
      content: message.content,
    })),
  ]

  const referer = import.meta.env.VITE_OPENROUTER_REFERER
  const title = import.meta.env.VITE_OPENROUTER_TITLE

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  if (referer) {
    headers['HTTP-Referer'] = referer
  }

  if (title) {
    headers['X-Title'] = title
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-8b-instruct:free',
        extra_body: {},
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const reply = payload.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      throw new Error('Empty response from OpenRouter')
    }

    return { reply, mood: classifyMood(reply), source: 'openrouter' }
  } catch (error) {
    console.error('OpenRouter chat failed', error)
    const latestUser = [...history].reverse().find((message) => message.role === 'user')
    const fallback = buildFallbackReply(latestUser?.content ?? '', dishes)
    return { reply: fallback, mood: classifyMood(fallback), source: 'fallback' }
  }
}
