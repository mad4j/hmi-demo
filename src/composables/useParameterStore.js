import { reactive } from 'vue'
import { flattenSelectablePages, menuConfig } from './useMenuConfig.js'
import { useDeviceClient } from './useDeviceClient.js'

// ── Singleton state ───────────────────────────────────────
const seenParameterIds = new Set()
const uniqueParameters = flattenSelectablePages(menuConfig.pages)
  .flatMap((page) => page.parameters)
  .filter((p) => {
    if (seenParameterIds.has(p.id)) return false
    seenParameterIds.add(p.id)
    return true
  })

// All values start null/off; real values arrive asynchronously from the apparatus.
const parameterValues = reactive(
  Object.fromEntries([
    ...uniqueParameters.map((p) => [p.id, null]),
    ...menuConfig.statusIcons.map((ic) => [ic.parameterId, 'off']),
  ]),
)

// ── Connect to apparatus via device client ────────────────
const { fetchState, sendCommand, subscribe } = useDeviceClient()

// Initial state request (GET /api/state)
fetchState()
  .then((state) => {
    Object.entries(state).forEach(([id, value]) => {
      if (id in parameterValues) parameterValues[id] = value
    })
  })
  .catch(() => {
    // Connection failed; the UI can reflect the error via the device client state.
  })

// Subscribe to apparatus notifications (server-push updates)
subscribe((updates) => {
  Object.entries(updates).forEach(([id, value]) => {
    if (id in parameterValues) parameterValues[id] = value
  })
})

// ── Exported composable ───────────────────────────────────
export const useParameterStore = () => {
  const toggleParameter = async (id) => {
    if (typeof parameterValues[id] === 'boolean') {
      const previous = parameterValues[id]
      const newValue = !previous
      parameterValues[id] = newValue // optimistic update
      try {
        await sendCommand(id, newValue)
      } catch {
        parameterValues[id] = previous // revert on failure
      }
      return
    }
    const param = uniqueParameters.find((p) => p.id === id)
    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(parameterValues[id]))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      const previous = parameterValues[id]
      const newValue = param.options[nextIndex]
      parameterValues[id] = newValue // optimistic update
      try {
        await sendCommand(id, newValue)
      } catch {
        parameterValues[id] = previous // revert on failure
      }
    }
  }

  const setParameterValue = async (id, value) => {
    if (id in parameterValues) {
      const previous = parameterValues[id]
      parameterValues[id] = value // optimistic update
      try {
        await sendCommand(id, value)
      } catch {
        parameterValues[id] = previous // revert on failure
      }
    }
  }

  return { parameterValues, toggleParameter, setParameterValue }
}
