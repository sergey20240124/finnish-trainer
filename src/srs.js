// Minimal SM-2 spaced-repetition scheduler.
// Card state: { repetition, easeFactor, intervalDays, dueAt (ISO string) }

const DAY_MS = 24 * 60 * 60 * 1000

export function newCardState() {
  return { repetition: 0, easeFactor: 2.5, intervalDays: 0, dueAt: new Date().toISOString() }
}

// quality: 0-5 (Anki-style simplified to 4 buttons in the UI: 0=again,3=hard,4=good,5=easy)
export function schedule(state, quality) {
  const s = { ...state }
  if (quality < 3) {
    s.repetition = 0
    s.intervalDays = 1
  } else {
    s.repetition += 1
    if (s.repetition === 1) s.intervalDays = 1
    else if (s.repetition === 2) s.intervalDays = 6
    else s.intervalDays = Math.round(s.intervalDays * s.easeFactor)
  }
  s.easeFactor = Math.max(1.3, s.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  s.dueAt = new Date(Date.now() + s.intervalDays * DAY_MS).toISOString()
  return s
}

export function isDue(state) {
  return new Date(state.dueAt).getTime() <= Date.now()
}
