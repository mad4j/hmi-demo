import './assets/main.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { _getParamValues, _sendCommand } from './composables/useParameterStore.js'

const enableSwSimulator = String(import.meta.env.VITE_ENABLE_SW_SIMULATOR ?? 'true').toLowerCase() === 'true'

if (enableSwSimulator && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((reg) => { console.info('[App] Service Worker registered:', reg.scope) })
      .catch((err) => { console.warn('[App] Service Worker registration failed:', err) })
  })
} else if (!enableSwSimulator) {
  console.info('[App] Service Worker simulator disabled (VITE_ENABLE_SW_SIMULATOR=false).')
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.hmiDebug = {
    get parameterValues() { return _getParamValues() },
    sendCommand: _sendCommand,
  }
}

createRoot(document.getElementById('app')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
