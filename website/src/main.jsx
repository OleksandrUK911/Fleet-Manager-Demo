import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Optional Plausible analytics — set VITE_PLAUSIBLE_DOMAIN in .env to activate.
// No tracking occurs if the variable is absent (privacy-friendly default).
if (import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
  const s = document.createElement('script')
  s.defer = true
  s.dataset.domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN
  s.src = 'https://plausible.io/js/plausible.js'
  document.head.appendChild(s)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
