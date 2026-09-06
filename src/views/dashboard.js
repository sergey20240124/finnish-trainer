import { vocab } from '../data/vocab.js'
import { grammarDrills } from '../data/grammar.js'
import { srsStore, progressStore, settingsStore } from '../storage.js'
import { isDue } from '../srs.js'

function allCardIds() {
  return [...vocab.map((_, i) => `v${i}`), ...grammarDrills.map((g) => g.id)]
}

export function render(container, { goto }) {
  const srs = srsStore.get()
  const progress = progressStore.get()
  const settings = settingsStore.get()
  const ids = allCardIds()
  const due = ids.filter((id) => !srs[id] || isDue(srs[id])).length
  const learned = ids.filter((id) => srs[id] && srs[id].repetition > 0).length
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = progress.reviewsByDate[today] || 0

  container.innerHTML = `
    <h1>Hei! Ready to practice?</h1>
    <p class="dim">Building toward YKI level ${settings.level} for your citizenship application.</p>

    <div class="stat-row">
      <div class="stat"><div class="num">${due}</div><div class="label">Cards due</div></div>
      <div class="stat"><div class="num">${learned}</div><div class="label">Cards learned</div></div>
      <div class="stat"><div class="num">${progress.streak}</div><div class="label">Day streak</div></div>
      <div class="stat"><div class="num">${todayCount}</div><div class="label">Reviews today</div></div>
    </div>

    <div class="card">
      <h2>Daily drills</h2>
      <p class="dim small">Spaced-repetition vocab and grammar. ${due} card${due === 1 ? '' : 's'} ready right now.</p>
      <button class="primary" id="start-drills">Start drills</button>
    </div>

    <div class="card">
      <h2>AI conversation practice</h2>
      <p class="dim small">Chat freely in Finnish with corrections, at your level.</p>
      <button class="ghost" id="start-chat">Open chat</button>
    </div>

    <div class="card">
      <h2>YKI writing practice</h2>
      <p class="dim small">Get an exam-style prompt and structured feedback on your answer.</p>
      <button class="ghost" id="start-writing">Practice writing</button>
    </div>

    ${!settings.apiKey ? `<div class="notice">Chat and writing feedback need an Anthropic API key. Add one in <b>Settings</b> to unlock them.</div>` : ''}
  `

  container.querySelector('#start-drills').onclick = () => goto('drills')
  container.querySelector('#start-chat').onclick = () => goto('chat')
  container.querySelector('#start-writing').onclick = () => goto('writing')
}
