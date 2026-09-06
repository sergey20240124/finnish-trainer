import { settingsStore } from '../storage.js'
import { generateWritingPrompt, gradeWriting, AIError } from '../ai.js'
import { escapeHtml } from '../util.js'

export function render(container) {
  const settings = settingsStore.get()

  if (!settings.apiKey) {
    container.innerHTML = `
      <h1>YKI writing practice</h1>
      <div class="notice">Add your Anthropic API key in Settings to generate prompts and get feedback.</div>`
    return
  }

  let currentPrompt = ''

  container.innerHTML = `
    <h1>YKI writing practice</h1>
    <p class="dim small">Level ${settings.level}. Get a realistic prompt, write your answer, and get graded feedback.</p>
    <div class="card">
      <button class="primary" id="new-prompt">Get a new prompt</button>
      <div id="prompt-area" style="margin-top:16px"></div>
    </div>`

  const promptArea = container.querySelector('#prompt-area')
  const newPromptBtn = container.querySelector('#new-prompt')

  async function loadPrompt() {
    newPromptBtn.disabled = true
    newPromptBtn.textContent = 'Loading...'
    promptArea.innerHTML = `<div id="err" class="error"></div>`
    try {
      currentPrompt = (await generateWritingPrompt({ apiKey: settings.apiKey, model: settings.model, level: settings.level })).trim()
      renderPromptForm()
    } catch (e) {
      promptArea.querySelector('#err').textContent = e instanceof AIError ? e.message : 'Failed to load a prompt.'
    } finally {
      newPromptBtn.disabled = false
      newPromptBtn.textContent = 'Get a new prompt'
    }
  }

  function renderPromptForm() {
    promptArea.innerHTML = `
      <h2>Tehtävä</h2>
      <p>${escapeHtml(currentPrompt)}</p>
      <textarea id="response" placeholder="Kirjoita vastauksesi tähän..." rows="6"></textarea>
      <div style="margin-top:10px">
        <button class="primary" id="grade">Get feedback</button>
      </div>
      <div id="err" class="error"></div>
      <div id="feedback"></div>`

    container.querySelector('#grade').onclick = async () => {
      const responseText = container.querySelector('#response').value.trim()
      const errEl = container.querySelector('#err')
      const feedbackEl = container.querySelector('#feedback')
      const gradeBtn = container.querySelector('#grade')
      if (!responseText) {
        errEl.textContent = 'Write something first.'
        return
      }
      errEl.textContent = ''
      gradeBtn.disabled = true
      gradeBtn.textContent = 'Grading...'
      try {
        const feedback = await gradeWriting({
          apiKey: settings.apiKey,
          model: settings.model,
          level: settings.level,
          prompt: currentPrompt,
          response: responseText,
        })
        feedbackEl.innerHTML = `<pre class="feedback">${escapeHtml(feedback)}</pre>`
      } catch (e) {
        errEl.textContent = e instanceof AIError ? e.message : 'Failed to grade. Try again.'
      } finally {
        gradeBtn.disabled = false
        gradeBtn.textContent = 'Get feedback'
      }
    }
  }

  newPromptBtn.onclick = loadPrompt
}
