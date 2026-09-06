import { settingsStore, exportBackup, importBackup } from '../storage.js'

export function render(container) {
  const settings = settingsStore.get()

  container.innerHTML = `
    <h1>Settings</h1>

    <div class="card">
      <h2>Anthropic API key</h2>
      <p class="dim small">Needed for Chat and Writing practice. Stored only in this browser's local storage — never sent anywhere except directly to Anthropic's API.</p>
      <label for="apiKey">API key</label>
      <input type="text" id="apiKey" placeholder="sk-ant-..." value="${settings.apiKey ? maskKey(settings.apiKey) : ''}" />
      <label for="model">Model</label>
      <input type="text" id="model" value="${settings.model}" />
      <div style="margin-top:14px"><button class="primary" id="save">Save</button></div>
      <div id="saved" class="dim small" style="margin-top:8px"></div>
    </div>

    <div class="card">
      <h2>Target level</h2>
      <p class="dim small">YKI level 3 (citizenship requirement) roughly corresponds to CEFR B1.</p>
      <select id="level">
        <option value="A2" ${settings.level === 'A2' ? 'selected' : ''}>A2 — basic</option>
        <option value="B1" ${settings.level === 'B1' ? 'selected' : ''}>B1 — YKI level 3 (citizenship target)</option>
        <option value="B2" ${settings.level === 'B2' ? 'selected' : ''}>B2 — beyond citizenship requirement</option>
      </select>
    </div>

    <div class="card">
      <h2>Backup</h2>
      <p class="dim small">Your progress lives only in this browser. Export it to keep a copy, or move it to another device.</p>
      <button class="ghost" id="export">Export backup (.json)</button>
      <label for="importFile" style="margin-top:14px">Import backup</label>
      <input type="file" id="importFile" accept="application/json" />
      <div id="importMsg" class="dim small" style="margin-top:8px"></div>
    </div>
  `

  const apiKeyInput = container.querySelector('#apiKey')
  let apiKeyTouched = false
  apiKeyInput.addEventListener('focus', () => {
    if (!apiKeyTouched) {
      apiKeyInput.value = settings.apiKey
      apiKeyTouched = true
    }
  })

  container.querySelector('#save').onclick = () => {
    const newKey = apiKeyTouched ? apiKeyInput.value.trim() : settings.apiKey
    settingsStore.set({
      apiKey: newKey,
      model: container.querySelector('#model').value.trim() || 'claude-sonnet-5',
    })
    container.querySelector('#saved').textContent = 'Saved.'
    setTimeout(() => (container.querySelector('#saved').textContent = ''), 2000)
  }

  container.querySelector('#level').onchange = (e) => {
    settingsStore.set({ level: e.target.value })
  }

  container.querySelector('#export').onclick = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finnish-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  container.querySelector('#importFile').onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const msg = container.querySelector('#importMsg')
    try {
      const text = await file.text()
      importBackup(text)
      msg.textContent = 'Imported. Reloading...'
      setTimeout(() => location.reload(), 800)
    } catch {
      msg.textContent = 'Could not read that file.'
    }
  }
}

function maskKey(key) {
  if (key.length < 10) return '••••••••'
  return key.slice(0, 8) + '••••••••' + key.slice(-4)
}
