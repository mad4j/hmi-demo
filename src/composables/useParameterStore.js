import { useSyncExternalStore } from 'react'
import { flattenSelectablePages, menuConfig } from './useMenuConfig.js'
import { useEquipmentGateway } from './useEquipmentGateway.js'

// ── Singleton state ───────────────────────────────────────
const seenParameterIds = new Set()
const uniqueParameters = flattenSelectablePages(menuConfig.pages)
  .flatMap((page) =>
    Array.isArray(page.panels) && page.panels.length > 0
      ? page.panels.flatMap((panel) => panel.parameters ?? [])
      : (page.parameters ?? []),
  )
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

// Mutable plain objects (not Vue reactive)
const _paramValues = Object.fromEntries([
  ...uniqueParameters.map((p) => [p.id, getParameterDefaultValue(p)]),
  ...menuConfig.statusIcons.map((ic) => [ic.parameterId, 'off']),
  ...(menuConfig.headerParams ?? []).map((p) => [p.id, null]),
])

const _transactionDrafts = {}

// Store subscription
let _version = 0
const _listeners = new Set()
const _subscribe = (l) => { _listeners.add(l); return () => _listeners.delete(l) }
const _getSnapshot = () => _version
const _notify = () => { _version++; _listeners.forEach((l) => l()) }

// ── Connect to apparatus via device client ────────────────
const { getParameters, setParameters, sendCommand, notifyParameters } = useEquipmentGateway()

const allParameterIds = [
  ...uniqueParameters.map((p) => p.id),
  ...menuConfig.statusIcons.map((ic) => ic.parameterId),
  ...(menuConfig.headerParams ?? []).map((p) => p.id),
]

const doInitialFetch = () => {
  getParameters(allParameterIds).then((result) => {
    if (!result.ok) return
    let changed = false
    Object.entries(result.values).forEach(([id, value]) => {
      if (id in _paramValues) { _paramValues[id] = value; changed = true }
    })
    if (changed) _notify()
  })
}

if ('serviceWorker' in navigator) {
  if (navigator.serviceWorker.controller) {
    doInitialFetch()
  } else {
    navigator.serviceWorker.addEventListener('controllerchange', doInitialFetch, { once: true })
  }
} else {
  doInitialFetch()
}

notifyParameters((updates) => {
  let changed = false
  Object.entries(updates).forEach(([id, value]) => {
    if (id in _paramValues) { _paramValues[id] = value; changed = true }
  })
  if (changed) _notify()
})

// ── Exported composable ───────────────────────────────────
export const useParameterStore = () => {
  // Subscribe so the component re-renders when _notify() is called
  useSyncExternalStore(_subscribe, _getSnapshot)

  const ensurePageDraft = (pageId) => {
    if (!_transactionDrafts[pageId]) _transactionDrafts[pageId] = {}
    return _transactionDrafts[pageId]
  }

  const cleanupPageDraft = (pageId) => {
    if (_transactionDrafts[pageId] && Object.keys(_transactionDrafts[pageId]).length === 0) {
      delete _transactionDrafts[pageId]
    }
  }

  const stageTransactionValue = (pageId, id, value) => {
    if (!pageId || !(id in _paramValues)) return
    const pageDraft = ensurePageDraft(pageId)
    const existing = pageDraft[id]
    if (!existing) {
      pageDraft[id] = { originalValue: _paramValues[id], currentValue: value }
    } else {
      existing.currentValue = value
    }
    const nextEntry = pageDraft[id]
    if (Object.is(nextEntry.currentValue, nextEntry.originalValue)) {
      delete pageDraft[id]
      cleanupPageDraft(pageId)
    }
    _notify()
  }

  const toggleTransactionParameter = (pageId, id) => {
    if (!(id in _paramValues)) return
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

  const getPageDraft = (pageId) => _transactionDrafts[pageId] ?? {}

  const getTransactionDisplayValue = (pageId, id) => {
    const entry = getPageDraft(pageId)[id]
    return entry ? entry.currentValue : _paramValues[id]
  }

  const getTransactionDisplayValues = (pageId) => {
    const pageDraft = getPageDraft(pageId)
    const overlay = {}
    Object.keys(pageDraft).forEach((id) => { overlay[id] = pageDraft[id].currentValue })
    return { ..._paramValues, ...overlay }
  }

  const getTransactionModifiedIds = (pageId) => Object.keys(getPageDraft(pageId))

  const hasTransactionChanges = (pageId) => getTransactionModifiedIds(pageId).length > 0

  const resetTransactionPage = (pageId) => {
    if (!_transactionDrafts[pageId]) return
    delete _transactionDrafts[pageId]
    _notify()
  }

  const commitTransactionPage = async (pageId) => {
    const pageDraft = getPageDraft(pageId)
    const entries = Object.entries(pageDraft)
    if (!entries.length) return { ok: true, failed: [] }

    const payload = Object.fromEntries(entries.map(([id, draft]) => [id, draft.currentValue]))
    const previousValues = Object.fromEntries(entries.map(([id]) => [id, _paramValues[id]]))

    Object.entries(payload).forEach(([id, nextValue]) => { _paramValues[id] = nextValue })
    _notify()

    const result = await setParameters(payload)
    if (result.ok) {
      Object.keys(payload).forEach((id) => {
        if (shouldClearValueOnApply(id)) _paramValues[id] = ''
      })
      delete _transactionDrafts[pageId]
      _notify()
      return { ok: true, failed: [] }
    }

    Object.entries(previousValues).forEach(([id, prevValue]) => { _paramValues[id] = prevValue })
    _notify()
    return {
      ok: false,
      failed: Object.keys(payload),
      message: result.message ?? 'Send error: check device connection.',
    }
  }

  const toggleParameter = async (id) => {
    if (typeof _paramValues[id] === 'boolean') {
      const previous = _paramValues[id]
      const newValue = !previous
      _paramValues[id] = newValue
      _notify()
      const result = await setParameters({ [id]: newValue })
      if (result.ok) return { ok: true }
      _paramValues[id] = previous
      _notify()
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }
    const param = uniqueParameters.find((p) => p.id === id)
    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(_paramValues[id]))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      const previous = _paramValues[id]
      const newValue = param.options[nextIndex]
      _paramValues[id] = newValue
      _notify()
      const result = await setParameters({ [id]: newValue })
      if (result.ok) return { ok: true }
      _paramValues[id] = previous
      _notify()
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }
    return { ok: false, message: 'Parameter is read-only.' }
  }

  const setParameterValue = async (id, value) => {
    if (id in _paramValues) {
      const previous = _paramValues[id]
      _paramValues[id] = value
      _notify()
      const result = await setParameters({ [id]: value })
      if (result.ok) {
        if (shouldClearValueOnApply(id)) { _paramValues[id] = ''; _notify() }
        return { ok: true }
      }
      _paramValues[id] = previous
      _notify()
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }
    return { ok: false, message: 'Parameter not found.' }
  }

  const refreshParameters = async (ids) => {
    const result = await getParameters(ids)
    if (!result.ok) return
    let changed = false
    Object.entries(result.values).forEach(([id, value]) => {
      if (id in _paramValues) { _paramValues[id] = value; changed = true }
    })
    if (changed) _notify()
  }

  const getManagedParameters = () =>
    uniqueParameters.map((param) => ({ ...param, value: _paramValues[param.id] }))

  const getManagedParameterIds = () => uniqueParameters.map((param) => param.id)

  return {
    parameterValues: _paramValues,
    toggleParameter,
    setParameterValue,
    sendCommand,
    toggleTransactionParameter,
    setTransactionParameterValue,
    getTransactionDisplayValues,
    getTransactionModifiedIds,
    hasTransactionChanges,
    resetTransactionPage,
    commitTransactionPage,
    refreshParameters,
    getManagedParameters,
    getManagedParameterIds,
  }
}

// Module-level exports for use outside React components (e.g., window.hmiDebug)
export const _getParamValues = () => _paramValues
export { sendCommand as _sendCommand }
