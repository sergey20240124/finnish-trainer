// Browser-native speech: SpeechRecognition (mic -> text) and SpeechSynthesis (text -> voice).
// Runs entirely in the browser, no API key or network call of ours involved.
// Support varies by browser — best in Chrome/Edge; Firefox/Safari may lack recognition.

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

export function isRecognitionSupported() {
  return !!SpeechRecognitionCtor
}

export function isSynthesisSupported() {
  return 'speechSynthesis' in window
}

export function createRecognizer({ lang = 'fi-FI', onResult, onEnd, onError } = {}) {
  if (!SpeechRecognitionCtor) return null
  const rec = new SpeechRecognitionCtor()
  rec.lang = lang
  rec.interimResults = true
  rec.continuous = false
  rec.onresult = (e) => {
    let transcript = ''
    let isFinal = false
    for (let i = 0; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript
      if (e.results[i].isFinal) isFinal = true
    }
    onResult?.(transcript, isFinal)
  }
  rec.onend = () => onEnd?.()
  rec.onerror = (e) => onError?.(e.error)
  return rec
}

let voicesPromise = null
function loadVoices() {
  if (voicesPromise) return voicesPromise
  voicesPromise = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices()
    if (existing.length) return resolve(existing)
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices())
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
  })
  return voicesPromise
}

// Strip characters that TTS engines tend to read aloud as literal descriptions
// (emoji -> "grinning face", etc.) rather than skip. Text is unaffected on screen —
// this only cleans up what gets spoken.
function forSpeech(text) {
  return text
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\u{FE0F}\u{200D}\u{20E3}]/gu, '')
    .replace(/[*_`#~]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Returns true if a native Finnish voice was found and used, false if it fell back
// to the browser's default voice (still speaks, just not Finnish-accented).
export async function speak(text, lang = 'fi-FI') {
  const clean = text ? forSpeech(text) : ''
  if (!isSynthesisSupported() || !clean) return false
  window.speechSynthesis.cancel()
  const voices = await loadVoices()
  const voice = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)))
  const utter = new SpeechSynthesisUtterance(clean)
  utter.lang = lang
  if (voice) utter.voice = voice
  utter.rate = 0.92
  window.speechSynthesis.speak(utter)
  return !!voice
}

export function stopSpeaking() {
  if (isSynthesisSupported()) window.speechSynthesis.cancel()
}
