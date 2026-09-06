import { grammarNotes } from '../data/grammar.js'

export function render(container) {
  container.innerHTML = `
    <h1>Grammar reference</h1>
    <p class="dim small">Read these before drilling the related fill-in-the-blank cards in Drills.</p>
    <div class="card">
      ${grammarNotes.map(noteHtml).join('')}
    </div>`
}

function noteHtml(note) {
  return `
    <div class="grammar-note">
      <h2>${note.title}</h2>
      <p>${note.body.replace(/\n/g, '<br>')}</p>
      ${note.table ? tableHtml(note.table) : ''}
    </div>`
}

function tableHtml(table) {
  const [header, ...rows] = table
  return `
    <table>
      <thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`
}
