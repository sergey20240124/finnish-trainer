// Direct browser calls to the Anthropic API using the user's own key (stored in
// localStorage via settings.js, never in the repo). This is fine for a single-user
// personal tool; do not reuse this pattern for anything with other users.

const API_URL = 'https://api.anthropic.com/v1/messages'

export class AIError extends Error {}

async function callClaude({ apiKey, model, system, messages, maxTokens = 1024 }) {
  if (!apiKey) throw new AIError('No API key set. Add one in Settings.')
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new AIError(`API error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.content?.map((b) => b.text).join('') ?? ''
}

export function tutorSystemPrompt(level) {
  return `You are a friendly, encouraging Finnish language tutor helping an adult learner (CEFR level ${level}, studying toward the YKI exam for Finnish citizenship) practice conversational Finnish.

Rules:
- Reply mostly in Finnish, matched to their level (${level}) — simple sentences, common vocabulary.
- If they write something ungrammatical or unnatural, gently correct it: show "Korjaus:" with the fixed sentence, then continue the conversation naturally in Finnish.
- If they write in English or ask for an explanation, you may explain in English, then return to Finnish.
- Keep replies short (2-5 sentences) so it feels like a real chat, not a lecture.
- Do not use emojis — replies are read aloud by text-to-speech, and emoji get spoken as literal descriptions.
- Do not use markdown formatting (no **bold**, no _italics_, no backticks). Plain text only — this chat displays raw text and reads it aloud as-is, so "**word**" would literally show and be spoken as asterisks.
- Occasionally ask a follow-up question to keep the conversation going.`
}

export async function chatReply({ apiKey, model, level, history }) {
  return callClaude({
    apiKey,
    model,
    system: tutorSystemPrompt(level),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
    maxTokens: 500,
  })
}

export async function translateToEnglish({ apiKey, model, text }) {
  return callClaude({
    apiKey,
    model,
    system: 'Translate the given Finnish text to natural, fluent English. Output ONLY the translation — no preamble, no quotes.',
    messages: [{ role: 'user', content: text }],
    maxTokens: 300,
  })
}

export async function generateWritingPrompt({ apiKey, model, level }) {
  const system = `You generate short YKI (Finnish national language exam) style writing prompts for level ${level}. Output ONLY the prompt itself in Finnish, 1-2 sentences, describing a realistic everyday writing task (e.g. write a message to a colleague, describe your weekend, give an opinion on a topic). No preamble, no quotes.`
  return callClaude({
    apiKey,
    model,
    system,
    messages: [{ role: 'user', content: 'Anna uusi kirjoitustehtävä.' }],
    maxTokens: 150,
  })
}

export async function gradeWriting({ apiKey, model, level, prompt, response }) {
  const system = `You are a YKI (Finnish exam) writing evaluator for level ${level}. Given a writing prompt and the learner's Finnish response, give concise structured feedback in this exact format:

Arvio: <one of: Ei vielä tasolla / Lähellä tasoa / Tasolla ${level} / Ylittää tason ${level}>
Vahvuudet: <1-2 short bullet points in English>
Korjattavaa: <1-3 short bullet points in English, each showing the original phrase -> corrected phrase>
Korjattu teksti: <the learner's full response rewritten with corrections, in Finnish>

Be encouraging but honest and specific.`
  return callClaude({
    apiKey,
    model,
    system,
    messages: [{ role: 'user', content: `Tehtävä: ${prompt}\n\nVastaus: ${response}` }],
    maxTokens: 700,
  })
}
