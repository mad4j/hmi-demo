import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { useParameterStore } from './composables/useParameterStore.js'

// ── Service Worker registration ───────────────────────────────────────────
// The SW (public/sw.js) runs the apparatus simulator and intercepts /api/*
// fetch calls.  Using import.meta.env.BASE_URL ensures the correct scope
// both when served from root (dev) and from a sub-path (GitHub Pages).
if ('serviceWorker' in navigator) {
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
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
	const { getManagedParameters, getManagedParameterIds, parameterValues, sendCommand } = useParameterStore()
	window.hmiDebug = {
		listManagedParameters: () => getManagedParameters(),
		listManagedParameterIds: () => getManagedParameterIds(),
		parameterValues,
		sendCommand,
	}
}

createApp(App).mount('#app')
