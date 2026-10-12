import { useSyncExternalStore } from 'react'
import yaml from 'js-yaml'
import headerYaml from '../config/headerState.yaml?raw'
import { useRadioGateway } from './useRadioGateway.js'

const { getParameters, notifyParameters } = useRadioGateway()

// ── YAML load ─────────────────────────────────────────────
const HeaderSchema = yaml.load(headerYaml).HeaderState

// keep same pattern as before
const _headerValues = Object.fromEntries(
  Object.values(HeaderSchema).map((p) => [p.id, p.default]),
)



const _statusIcons = {
  comm_icon: 'idle',
}

// ── store core ───────────────────────────────────────────
let _version = 0
const _listeners = new Set()

const _subscribe = (l) => {
  _listeners.add(l)
  return () => _listeners.delete(l)
}

const _notify = () => {
  _version++
  _listeners.forEach((l) => l())
}

// ── INIT ──────────────────────────────────────────────────
const initHeader = async () => {
  const ids = Object.values(HeaderSchema).map((p) => p.id)
//
  const result = await getParameters(ids)
 // if (!result.ok) return

  for (const [k, v] of Object.entries(result.values)) {
    if (k in _headerValues) _headerValues[k] = v
  }



  _notify()
}

// ── LIVE UPDATES ─────────────────────────────────────────
notifyParameters((updates) => {
  let changed = false

  for (const [k, v] of Object.entries(updates)) {
    if (k in _headerValues) {
      _headerValues[k] = v
      changed = true
    }
  }

  if (changed) _notify()
})

//initHeader()

export const useHeaderStore = () => {
  useSyncExternalStore(_subscribe, () => _version)

  return {
    headerValues: _headerValues,
    statusIcons: _statusIcons,
  }
}