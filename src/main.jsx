import './assets/main.css'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'

// ── Service Worker registration ───────────────────────────────────────────
// The SW (public/sw.js) runs the apparatus simulator and intercepts /api/*
// fetch calls.  Using import.meta.env.BASE_URL ensures the correct scope
// both when served from root (dev) and from a sub-path (GitHub Pages).
const enableSwSimulator = String(import.meta.env.VITE_ENABLE_SW_SIMULATOR ?? 'true').toLowerCase() === 'true'

if (enableSwSimulator && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .then((reg) => {
        console.info('[App] Service Worker registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('[App] Service Worker registration failed:', err)
      })
  })
} else if (!enableSwSimulator) {
  console.info('[App] Service Worker simulator disabled (VITE_ENABLE_SW_SIMULATOR=false).')
}

// Debug utilities for development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Note: Debug utilities will be connected to Redux store instance
  window.hmiDebug = {
    getState: () => store.getState(),
    dispatch: store.dispatch,
  }
}

const container = document.getElementById('app')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
