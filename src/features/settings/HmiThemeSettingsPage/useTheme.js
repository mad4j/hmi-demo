import { useSyncExternalStore } from 'react'

export const VALID_THEMES = ['light', 'dark', 'nvis']
const STORAGE_KEY = 'hmi-theme'

const _stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
let _theme = VALID_THEMES.includes(_stored) ? _stored : 'dark'

const _listeners = new Set()
const _subscribe = (l) => { _listeners.add(l); return () => _listeners.delete(l) }
const _getSnapshot = () => _theme

const _applyTheme = (value) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value)
  if (typeof document !== 'undefined') document.body.dataset.theme = value
}

// Apply theme on module load
_applyTheme(_theme)

export const useTheme = () => {
  const theme = useSyncExternalStore(_subscribe, _getSnapshot)

  const setTheme = (value) => {
    if (!VALID_THEMES.includes(value)) return
    _theme = value
    _applyTheme(_theme)
    _listeners.forEach((l) => l())
  }

  return { theme, setTheme }
}
