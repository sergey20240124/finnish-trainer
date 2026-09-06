import { vocab } from '../data/vocab.js'
import { grammarDrills } from '../data/grammar.js'
import { srsStore, progressStore } from '../storage.js'
import { newCardState, schedule, isDue } from '../srs.js'

const NEW_CARD_LIMIT = 12
const SESSION_LIMIT = 20

function buildDeck() {
  const srs = srsStore.get()
  const vocabCards = vocab.map((v, i) => ({ id: `v${i}`, kind: 'vocab', data: v }))
  const grammarCards = grammarDrills.map((g) => ({ id: g.id, kind: 'grammar', data: g }))
  const all = [...vocabCards, ...grammarCards]

  const due = all.filter((c) => srs[c.id] && isDue(srs[c.id]))
  const fresh = all.filter((c) => !srs[c.id]).slice(0, NEW_CARD_LIMIT)

  const deck = [...due, ...fresh]
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck.slice(0, SESSION_LIMIT)
}

export function render(container) {
  const deck = buildDeck()
  let index = 0
  let revealed = false

  function normalize(s) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  function renderCard() {
    if (index >= deck.length) {
      container.innerHTML = `
        <div class="card drill-card">
          <div class="drill-front">Session done! 🎉</div>
          <p class="dim">${deck.length} card${deck.length === 1 ? '' : 's'} reviewed. Come back later for more, or check the Dashboard for what's still due.</p>
        </div>`
      return
    }

    const card = deck[index]
    revealed = false

    if (card.kind === 'vocab') {
      const fiToEn = Math.random() < 0.5
      const front = fiToEn ? card.data.fi : card.data.en
      const back = fiToEn ? card.data.en : card.data.fi

      container.innerHTML = `
        <p class="dim small">${index + 1} / ${deck.length}</p>
        <div class="card drill-card">
          <span class="topic-tag">${card.data.topic}</span>
          <div class="drill-front">${front}</div>
          <div id="back-area"></div>
        </div>`

      const backArea = container.querySelector('#back-area')
      backArea.innerHTML = `<button class="ghost" id="reveal">Show answer</button>`
      container.querySelector('#reveal').onclick = () => {
        backArea.innerHTML = `
          <div class="drill-back">${back}</div>
          ${card.data.ex ? `<div class="drill-example">${card.data.ex}<br>${card.data.exEn}</div>` : ''}
          <div class="rate-row">
            <button class="rate-btn rate-again" data-q="0">Again</button>
            <button class="rate-btn rate-hard" data-q="3">Hard</button>
            <button class="rate-btn rate-good" data-q="4">Good</button>
            <button class="rate-btn rate-easy" data-q="5">Easy</button>
          </div>`
        backArea.querySelectorAll('.rate-btn').forEach((btn) => {
          btn.onclick = () => rate(card.id, Number(btn.dataset.q))
        })
      }
    } else {
      // grammar fill-in-the-blank
      container.innerHTML = `
        <p class="dim small">${index + 1} / ${deck.length}</p>
        <div class="card drill-card">
          <span class="topic-tag">grammar</span>
          <div class="drill-front" style="font-size:20px">${card.data.prompt}</div>
          <input type="text" id="answer-input" placeholder="Type your answer..." style="max-width:280px" />
          <div id="back-area"></div>
        </div>`

      const input = container.querySelector('#answer-input')
      input.focus()
      const backArea = container.querySelector('#back-area')

      function check() {
        const userAnswer = normalize(input.value)
        const correct = normalize(card.data.answer) === userAnswer
        backArea.innerHTML = `
          <div class="drill-back" style="color:${correct ? 'var(--good)' : 'var(--bad)'}">
            ${correct ? 'Correct!' : 'Correct answer: ' + card.data.answer}
          </div>
          <div class="drill-example">${card.data.hint}</div>
          <div class="rate-row">
            <button class="rate-btn rate-again" data-q="0">Again</button>
            <button class="rate-btn rate-hard" data-q="3">Hard</button>
            <button class="rate-btn rate-good" data-q="4">Good</button>
            <button class="rate-btn rate-easy" data-q="5">Easy</button>
          </div>`
        backArea.querySelectorAll('.rate-btn').forEach((btn) => {
          btn.onclick = () => rate(card.id, Number(btn.dataset.q))
        })
        input.disabled = true
      }

      input.onkeydown = (e) => {
        if (e.key === 'Enter' && !revealed) {
          revealed = true
          check()
        }
      }
      backArea.innerHTML = `<button class="ghost" id="reveal">Check answer</button>`
      container.querySelector('#reveal').onclick = () => {
        if (!revealed) {
          revealed = true
          check()
        }
      }
    }
  }

  function rate(cardId, quality) {
    const srs = srsStore.get()
    const prev = srs[cardId] || newCardState()
    const next = schedule(prev, quality)
    srsStore.setCard(cardId, next)
    progressStore.recordReview()
    index += 1
    renderCard()
  }

  renderCard()
}
