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

const parameterById = new Map(uniqueParameters.map((param) => [param.id, param]))

const getParameterDefaultValue = (param) => {
  if (param?.type === 'text' || param?.type === 'password') return ''
  return null
}

const shouldClearValueOnApply = (id) => {
  const param = parameterById.get(id)
  return Boolean(param && (param.type === 'text' || param.type === 'password') && param.clearOnApply)
}

// All values start null/off; real values arrive asynchronously from the apparatus.
const parameterValues = reactive(
  Object.fromEntries([
    ...uniqueParameters.map((p) => [p.id, getParameterDefaultValue(p)]),
    ...menuConfig.statusIcons.map((ic) => [ic.parameterId, 'off']),
  ]),
)

// Staged values for transaction pages:
// { [pageId]: { [parameterId]: { originalValue, currentValue } } }
const transactionDrafts = reactive({})

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
  const ensurePageDraft = (pageId) => {
    if (!transactionDrafts[pageId]) {
      transactionDrafts[pageId] = {}
    }
    return transactionDrafts[pageId]
  }

  const cleanupPageDraft = (pageId) => {
    if (transactionDrafts[pageId] && Object.keys(transactionDrafts[pageId]).length === 0) {
      delete transactionDrafts[pageId]
    }
  }

  const stageTransactionValue = (pageId, id, value) => {
    if (!pageId || !(id in parameterValues)) return

    const pageDraft = ensurePageDraft(pageId)
    const existing = pageDraft[id]

    if (!existing) {
      pageDraft[id] = {
        originalValue: parameterValues[id],
        currentValue: value,
      }
    } else {
      existing.currentValue = value
    }

    const nextEntry = pageDraft[id]
    if (Object.is(nextEntry.currentValue, nextEntry.originalValue)) {
      delete pageDraft[id]
      cleanupPageDraft(pageId)
    }
  }

  const toggleTransactionParameter = (pageId, id) => {
    if (!(id in parameterValues)) return

    const param = uniqueParameters.find((p) => p.id === id)
    const displayValue = getTransactionDisplayValue(pageId, id)

    if (typeof displayValue === 'boolean') {
      stageTransactionValue(pageId, id, !displayValue)
      return
    }

    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(displayValue))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      stageTransactionValue(pageId, id, param.options[nextIndex])
    }
  }

  const setTransactionParameterValue = (pageId, id, value) => {
    stageTransactionValue(pageId, id, value)
  }

  const getPageDraft = (pageId) => transactionDrafts[pageId] ?? {}

  const getTransactionDisplayValue = (pageId, id) => {
    const entry = getPageDraft(pageId)[id]
    return entry ? entry.currentValue : parameterValues[id]
  }

  const getTransactionDisplayValues = (pageId) => {
    const pageDraft = getPageDraft(pageId)
    const overlay = {}
    Object.keys(pageDraft).forEach((id) => {
      overlay[id] = pageDraft[id].currentValue
    })
    return {
      ...parameterValues,
      ...overlay,
    }
  }

  const getTransactionModifiedIds = (pageId) => Object.keys(getPageDraft(pageId))

  const hasTransactionChanges = (pageId) => getTransactionModifiedIds(pageId).length > 0

  const resetTransactionPage = (pageId) => {
    if (!transactionDrafts[pageId]) return
    delete transactionDrafts[pageId]
  }

  const commitTransactionPage = async (pageId) => {
    const pageDraft = getPageDraft(pageId)
    const entries = Object.entries(pageDraft)
    if (!entries.length) return { ok: true, failed: [] }

    const payload = Object.fromEntries(entries.map(([id, draft]) => [id, draft.currentValue]))
    const previousValues = Object.fromEntries(entries.map(([id]) => [id, parameterValues[id]]))

    Object.entries(payload).forEach(([id, nextValue]) => {
      parameterValues[id] = nextValue // optimistic update on submit
    })

    try {
      await sendCommand(payload)
      Object.keys(payload).forEach((id) => {
        if (shouldClearValueOnApply(id)) {
          parameterValues[id] = ''
        }
      })
      delete transactionDrafts[pageId]
      return { ok: true, failed: [] }
    } catch {
      Object.entries(previousValues).forEach(([id, prevValue]) => {
        parameterValues[id] = prevValue
      })
      return { ok: false, failed: Object.keys(payload) }
    }
  }

  const toggleParameter = async (id) => {
    if (typeof parameterValues[id] === 'boolean') {
      const previous = parameterValues[id]
      const newValue = !previous
      parameterValues[id] = newValue // optimistic update
      try {
        await sendCommand(id, newValue)
        return { ok: true }
      } catch {
        parameterValues[id] = previous // revert on failure
        return { ok: false }
      }
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
        return { ok: true }
      } catch {
        parameterValues[id] = previous // revert on failure
        return { ok: false }
      }
    }

    return { ok: false }
  }

  const setParameterValue = async (id, value) => {
    if (id in parameterValues) {
      const previous = parameterValues[id]
      parameterValues[id] = value // optimistic update
      try {
        await sendCommand(id, value)
        if (shouldClearValueOnApply(id)) {
          parameterValues[id] = ''
        }
        return { ok: true }
      } catch {
        parameterValues[id] = previous // revert on failure
        return { ok: false }
      }
    }

    return { ok: false }
  }

  const getManagedParameters = () =>
    uniqueParameters.map((param) => ({
      ...param,
      value: parameterValues[param.id],
    }))

  const getManagedParameterIds = () => uniqueParameters.map((param) => param.id)

  return {
    parameterValues,
    toggleParameter,
    setParameterValue,
    toggleTransactionParameter,
    setTransactionParameterValue,
    getTransactionDisplayValues,
    getTransactionModifiedIds,
    hasTransactionChanges,
    resetTransactionPage,
    commitTransactionPage,
    getManagedParameters,
    getManagedParameterIds,
  }
}
