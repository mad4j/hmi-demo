import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { useParameterStore } from './composables/useParameterStore.js'

if (import.meta.env.DEV && typeof window !== 'undefined') {
	const { getManagedParameters, getManagedParameterIds, parameterValues } = useParameterStore()
	window.hmiDebug = {
		listManagedParameters: () => getManagedParameters(),
		listManagedParameterIds: () => getManagedParameterIds(),
		parameterValues,
	}
}

createApp(App).mount('#app')
