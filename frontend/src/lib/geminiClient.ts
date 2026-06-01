// src/lib/geminiClient.ts
// This wrapper enforces strict rate limits to protect free tier credits.
// Free Gemini tier: 15 requests/minute, 1500 requests/day, 1M tokens/minute

const RATE_LIMITS = {
  requestsPerMinute: 12,     // stay under 15 limit with buffer
  requestsPerDay: 1200,      // stay under 1500 limit with buffer
  minIntervalMs: 5000,       // minimum 5 seconds between requests
  maxTokensPerRequest: 800,  // cap output tokens per request
  maxInputChars: 2000,       // cap input length to save tokens
}

// Persistent counters stored in localStorage (survive page refresh)
const getCounters = () => ({
  minuteCount:  parseInt(localStorage.getItem('gemini_minute_count')  || '0'),
  dayCount:     parseInt(localStorage.getItem('gemini_day_count')     || '0'),
  minuteReset:  parseInt(localStorage.getItem('gemini_minute_reset')  || '0'),
  dayReset:     parseInt(localStorage.getItem('gemini_day_reset')      || '0'),
  lastRequest:  parseInt(localStorage.getItem('gemini_last_request')  || '0'),
})

const saveCounters = (c: ReturnType<typeof getCounters>) => {
  localStorage.setItem('gemini_minute_count',  c.minuteCount.toString())
  localStorage.setItem('gemini_day_count',      c.dayCount.toString())
  localStorage.setItem('gemini_minute_reset',   c.minuteReset.toString())
  localStorage.setItem('gemini_day_reset',      c.dayReset.toString())
  localStorage.setItem('gemini_last_request',   c.lastRequest.toString())
}

const resetIfExpired = (c: ReturnType<typeof getCounters>, now: number) => {
  if (now - c.minuteReset > 60_000) {
    c.minuteCount = 0
    c.minuteReset = now
  }
  if (now - c.dayReset > 86_400_000) {
    c.dayCount = 0
    c.dayReset = now
  }
  return c
}

export const canMakeRequest = (): { allowed: boolean; reason?: string } => {
  const now = Date.now()
  const c = resetIfExpired(getCounters(), now)

  if (now - c.lastRequest < RATE_LIMITS.minIntervalMs) {
    const wait = Math.ceil((RATE_LIMITS.minIntervalMs - (now - c.lastRequest)) / 1000)
    return { allowed: false, reason: `Please wait ${wait}s before asking again` }
  }
  if (c.minuteCount >= RATE_LIMITS.requestsPerMinute) {
    return { allowed: false, reason: 'Too many requests this minute. Please wait a moment.' }
  }
  if (c.dayCount >= RATE_LIMITS.requestsPerDay) {
    return { allowed: false, reason: 'Daily AI limit reached. Resets at midnight.' }
  }
  return { allowed: true }
}

export const recordRequest = () => {
  const now = Date.now()
  const c = resetIfExpired(getCounters(), now)
  c.minuteCount++
  c.dayCount++
  c.lastRequest = now
  saveCounters(c)
}

// Truncate input to save tokens
const truncateInput = (text: string): string => {
  if (text.length <= RATE_LIMITS.maxInputChars) return text
  return text.slice(0, RATE_LIMITS.maxInputChars) + '...'
}

// Main Gemini call — always goes through this function
export const callGemini = async (
  prompt: string,
  context?: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> => {
  const { allowed, reason } = canMakeRequest()
  if (!allowed) throw new Error(reason)

  // Build efficient system prompt — short but complete
  const systemPrompt = `You are KrishiMitra, an AI assistant for Karnataka farmers. 
Be concise. Answer in 2-4 sentences max unless a list is needed. 
Language: match the user (Kannada or English).
Context: ${context ? truncateInput(context) : 'Karnataka farmer, Kharif season'}`

  const fullPrompt = truncateInput(prompt)

  // Map history to backend expected structure
  const formattedHistory = history.map(item => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    content: item.content
  }))

  // Call via backend to keep API key secure
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mock-User-Id': localStorage.getItem('mock_user_id') || '1',
    },
    body: JSON.stringify({
      message: fullPrompt,
      systemContext: systemPrompt,
      maxTokens: RATE_LIMITS.maxTokensPerRequest,
      history: formattedHistory
    }),
  })

  if (!response.ok) throw new Error('AI service unavailable')

  recordRequest()
  const data = await response.json()
  return data.reply || data.response || 'Empty response received.'
}

// Usage stats for UI display
export const getUsageStats = () => {
  const c = getCounters()
  const now = Date.now()
  const reset = resetIfExpired(c, now)
  return {
    minuteUsed:  reset.minuteCount,
    minuteLimit: RATE_LIMITS.requestsPerMinute,
    dayUsed:     reset.dayCount,
    dayLimit:    RATE_LIMITS.requestsPerDay,
  }
}
