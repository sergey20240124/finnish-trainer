import { settingsStore, chatStore } from '../storage.js'
import { chatReply, AIError } from '../ai.js'

export function render(container) {
  const settings = settingsStore.get()

  if (!settings.apiKey) {
    container.innerHTML = `
      <h1>Chat with a Finnish tutor</h1>
      <div class="notice">Add your Anthropic API key in Settings to start chatting.</div>`
    return
  }

  let history = chatStore.get()
  let sending = false

  container.innerHTML = `
    <h1>Chat with a Finnish tutor</h1>
    <p class="dim small">Level ${settings.level}. It replies mostly in Finnish and corrects mistakes as you go.</p>
    <div class="card">
      <div class="chat-log" id="log"></div>
      <div class="chat-input-row">
        <textarea id="input" placeholder="Kirjoita jotain suomeksi..."></textarea>
        <button class="primary" id="send">Send</button>
      </div>
      <div id="err" class="error"></div>
      <div style="margin-top:10px"><button class="ghost" id="reset">Reset conversation</button></div>
    </div>`

  const log = container.querySelector('#log')
  const input = container.querySelector('#input')
  const sendBtn = container.querySelector('#send')
  const errEl = container.querySelector('#err')

  function paint() {
    log.innerHTML = history
      .map((m) => `<div class="msg ${m.role}">${escapeHtml(m.content)}</div>`)
      .join('')
    log.scrollTop = log.scrollHeight
  }

  function escapeHtml(s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  }

  async function send() {
    const text = input.value.trim()
    if (!text || sending) return
    errEl.textContent = ''
    history = [...history, { role: 'user', content: text }]
    chatStore.set(history)
    input.value = ''
    paint()
    sending = true
    sendBtn.disabled = true
    sendBtn.textContent = 'Thinking...'
    try {
      const reply = await chatReply({ apiKey: settings.apiKey, model: settings.model, level: settings.level, history })
      history = [...history, { role: 'assistant', content: reply }]
      chatStore.set(history)
      paint()
    } catch (e) {
      errEl.textContent = e instanceof AIError ? e.message : 'Something went wrong. Try again.'
    } finally {
      sending = false
      sendBtn.disabled = false
      sendBtn.textContent = 'Send'
    }
  }

  sendBtn.onclick = send
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }
  container.querySelector('#reset').onclick = () => {
    history = []
    chatStore.clear()
    paint()
  }

  paint()
}
