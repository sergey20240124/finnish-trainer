import { settingsStore, chatStore } from '../storage.js'
import { chatReply, translateToEnglish, AIError } from '../ai.js'
import { escapeHtml } from '../util.js'
import { isRecognitionSupported, isSynthesisSupported, createRecognizer, speak, stopSpeaking } from '../speech.js'

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
  let listening = false
  let recognizer = null
  const expanded = new Set()
  const translating = new Set()

  const micSupported = isRecognitionSupported()
  const voiceSupported = isSynthesisSupported()

  container.innerHTML = `
    <h1>Chat with a Finnish tutor</h1>
    <p class="dim small">Level ${settings.level}. It replies mostly in Finnish and corrects mistakes as you go.</p>
    <div class="card">
      <div class="chat-log" id="log"></div>
      <div class="chat-input-row">
        ${micSupported ? `<button class="ghost icon-btn" id="mic" title="Speak in Finnish">🎤</button>` : ''}
        <textarea id="input" placeholder="Kirjoita jotain suomeksi..."></textarea>
        <button class="primary" id="send">Send</button>
      </div>
      <div id="err" class="error"></div>
      <div style="margin-top:10px; display:flex; gap:16px; align-items:center; flex-wrap:wrap">
        <button class="ghost" id="reset">Reset conversation</button>
        ${voiceSupported ? `
          <label class="dim small" style="display:flex; align-items:center; gap:6px; margin:0">
            <input type="checkbox" id="autoSpeak" ${settings.autoSpeak ? 'checked' : ''} /> Auto-speak replies
          </label>` : `<span class="dim small">Voice playback not supported in this browser.</span>`}
      </div>
      ${!micSupported ? `<div class="notice" style="margin-top:10px">Speech-to-text isn't supported in this browser. Try Chrome or Edge for the mic button.</div>` : ''}
    </div>`

  const log = container.querySelector('#log')
  const input = container.querySelector('#input')
  const sendBtn = container.querySelector('#send')
  const errEl = container.querySelector('#err')
  const micBtn = container.querySelector('#mic')
  const autoSpeakBox = container.querySelector('#autoSpeak')

  function paint() {
    log.innerHTML = history
      .map((m, i) => {
        if (m.role !== 'assistant') {
          return `<div class="msg ${m.role}">${escapeHtml(m.content)}</div>`
        }
        const showTranslation = expanded.has(i)
        const isTranslating = translating.has(i)
        const translateLabel = isTranslating ? '...' : showTranslation ? 'Hide EN' : 'EN'
        return `
        <div class="msg assistant">
          ${escapeHtml(m.content)}
          <div class="msg-actions">
            ${voiceSupported ? `<button class="icon-btn speak-btn" data-i="${i}" title="Play">🔊</button>` : ''}
            <button class="icon-btn translate-btn" data-i="${i}" title="Toggle English translation" ${isTranslating ? 'disabled' : ''}>${translateLabel}</button>
          </div>
          ${showTranslation && m.translation ? `<div class="translation">${escapeHtml(m.translation)}</div>` : ''}
          ${showTranslation && !m.translation && !isTranslating ? `<div class="translation error">Translation failed. Click EN to retry.</div>` : ''}
        </div>`
      })
      .join('')
    log.scrollTop = log.scrollHeight
    log.querySelectorAll('.speak-btn').forEach((btn) => {
      btn.onclick = () => speak(history[Number(btn.dataset.i)].content)
    })
    log.querySelectorAll('.translate-btn').forEach((btn) => {
      btn.onclick = () => toggleTranslation(Number(btn.dataset.i))
    })
  }

  async function toggleTranslation(i) {
    if (expanded.has(i)) {
      expanded.delete(i)
      paint()
      return
    }
    expanded.add(i)
    if (history[i].translation || translating.has(i)) {
      paint()
      return
    }
    translating.add(i)
    paint()
    try {
      const translation = await translateToEnglish({ apiKey: settings.apiKey, model: settings.model, text: history[i].content })
      history[i] = { ...history[i], translation: translation.trim() }
      chatStore.set(history)
    } catch {
      // leave translation unset; paint() shows a retry message
    } finally {
      translating.delete(i)
      paint()
    }
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
      if (voiceSupported && settingsStore.get().autoSpeak) speak(reply)
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
    stopSpeaking()
    paint()
  }
  autoSpeakBox?.addEventListener('change', () => {
    settingsStore.set({ autoSpeak: autoSpeakBox.checked })
  })

  if (micBtn) {
    micBtn.onclick = () => {
      if (listening) {
        recognizer?.stop()
        return
      }
      recognizer = createRecognizer({
        lang: 'fi-FI',
        onResult: (transcript) => {
          input.value = transcript
        },
        onEnd: () => {
          listening = false
          micBtn.classList.remove('listening')
        },
        onError: (err) => {
          listening = false
          micBtn.classList.remove('listening')
          errEl.textContent = err === 'not-allowed' ? 'Microphone access denied.' : `Mic error: ${err}`
        },
      })
      if (!recognizer) return
      listening = true
      micBtn.classList.add('listening')
      errEl.textContent = ''
      recognizer.start()
    }
  }

  paint()
}
