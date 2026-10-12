import { useSyncExternalStore } from 'react'

export const SCREEN_PROFILES = ['COMPACT', 'STANDARD', 'EXTENDED']
const STORAGE_KEY = 'hmi-screen-profile'
const RESIZE_DEBOUNCE_MS = 150

// Profile -> logical area, fit tolerance on the width (fraction of the width that may be missing)
// and value of the data-resolution-profile attribute on <html>
const PROFILE_SPECS = {
  COMPACT: { width: 800, height: 600, widthTolerance: 0, resolution: '800x600' },
  STANDARD: { width: 1024, height: 768, widthTolerance: 0, resolution: '1024x768' },
  EXTENDED: { width: 1920, height: 1080, widthTolerance: 0.1, resolution: '1920x1080' },
}

// Largest profile whose logical area (minus its width tolerance) fits the viewport (COMPACT if none does)
const _getBestFitProfile = () => {
  if (typeof window === 'undefined') return 'STANDARD'
  const { innerWidth, innerHeight } = window
  return (
    [...SCREEN_PROFILES]
      .reverse()
      .find((p) => {
        const { width, height, widthTolerance } = PROFILE_SPECS[p]
        return width * (1 - widthTolerance) <= innerWidth && height <= innerHeight
      }) ?? SCREEN_PROFILES[0]
  )
}

const _stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
let _profile = SCREEN_PROFILES.includes(_stored) ? _stored : _getBestFitProfile()

const _listeners = new Set()
const _subscribe = (l) => { _listeners.add(l); return () => _listeners.delete(l) }
const _getSnapshot = () => _profile

const _applyProfile = (value) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.resolutionProfile = PROFILE_SPECS[value].resolution
  }
}

const _setProfile = (value) => {
  if (!SCREEN_PROFILES.includes(value)) return
  _profile = value
  _applyProfile(_profile)
  _listeners.forEach((l) => l())
}

// Apply profile on module load
_applyProfile(_profile)

// A screen resize re-selects the best-fit profile, replacing any manual choice.
if (typeof window !== 'undefined') {
  let lastSize = `${window.innerWidth}x${window.innerHeight}`
  let timer = null
  window.addEventListener('resize', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const size = `${window.innerWidth}x${window.innerHeight}`
      if (size === lastSize) return
      lastSize = size
      _setProfile(_getBestFitProfile())
    }, RESIZE_DEBOUNCE_MS)
  })
}

export const useScreenProfile = () => {
  const screenProfile = useSyncExternalStore(_subscribe, _getSnapshot)
  return { screenProfile, setScreenProfile: _setProfile }
}
