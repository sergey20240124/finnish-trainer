// Thin localStorage wrapper. Everything stays in the browser — nothing is sent anywhere
// except direct calls to the Anthropic API using the key you provide.

const KEYS = {
  settings: 'ft_settings_v1',
  srs: 'ft_srs_v1',
  progress: 'ft_progress_v1',
  chatHistory: 'ft_chat_v1',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const settingsStore = {
  get() {
    return read(KEYS.settings, { apiKey: '', model: 'claude-sonnet-5', level: 'B1' })
  },
  set(partial) {
    const next = { ...this.get(), ...partial }
    write(KEYS.settings, next)
    return next
  },
}

export const srsStore = {
  get() {
    return read(KEYS.srs, {})
  },
  setCard(id, state) {
    const all = this.get()
    all[id] = state
    write(KEYS.srs, all)
  },
}

export const progressStore = {
  get() {
    return read(KEYS.progress, { reviewsByDate: {}, streak: 0, lastReviewDate: null })
  },
  recordReview() {
    const p = this.get()
    const today = new Date().toISOString().slice(0, 10)
    p.reviewsByDate[today] = (p.reviewsByDate[today] || 0) + 1
    if (p.lastReviewDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      p.streak = p.lastReviewDate === yesterday ? p.streak + 1 : 1
      p.lastReviewDate = today
    }
    write(KEYS.progress, p)
    return p
  },
}

export const chatStore = {
  get() {
    return read(KEYS.chatHistory, [])
  },
  set(messages) {
    write(KEYS.chatHistory, messages)
  },
  clear() {
    write(KEYS.chatHistory, [])
  },
}

export function exportBackup() {
  const blob = {
    settings: settingsStore.get(),
    srs: srsStore.get(),
    progress: progressStore.get(),
  }
  return JSON.stringify(blob, null, 2)
}

export function importBackup(json) {
  const blob = JSON.parse(json)
  if (blob.settings) write(KEYS.settings, blob.settings)
  if (blob.srs) write(KEYS.srs, blob.srs)
  if (blob.progress) write(KEYS.progress, blob.progress)
}
