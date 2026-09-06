import './style.css'
import * as dashboard from './views/dashboard.js'
import * as drills from './views/drills.js'
import * as chat from './views/chat.js'
import * as writing from './views/writing.js'
import * as grammar from './views/grammar.js'
import * as settings from './views/settings.js'

const routes = { dashboard, drills, chat, writing, grammar, settings }
const view = document.getElementById('view')
const tabButtons = document.querySelectorAll('.tab-btn')

function goto(route) {
  if (!routes[route]) route = 'dashboard'
  location.hash = route
  tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.route === route))
  routes[route].render(view, { goto })
  window.scrollTo({ top: 0 })
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => goto(btn.dataset.route))
})

window.addEventListener('hashchange', () => {
  goto(location.hash.slice(1))
})

goto(location.hash.slice(1) || 'dashboard')
