import { useSyncExternalStore } from 'react'
import { useParameterStore } from './useParameterStore.js'
import { useEquipmentGateway } from './useEquipmentGateway.js'

const MISSION_TIME_PLACEHOLDER = '--:--:--'
const APPARATUS_TIME_PARAM_ID = 'ora_sistema'
const APPARATUS_TIMEZONE_PARAM_ID = 'timezone_riferimento'
const APPARATUS_SYNC_INTERVAL_MS = 60_000
const LOCAL_TICK_INTERVAL_MS = 1_000

// Module-level singleton state for header clock
let _missionTimeTod = MISSION_TIME_PLACEHOLDER
let _missionTimeZone = 'TMZ'
let _missionTimeBaseMs = null
let _missionTimeBaseCapturedAtMs = null
let _missionClockStarted = false
let _headerVersion = 0

const _headerListeners = new Set()
const _subscribeHeader = (l) => { _headerListeners.add(l); return () => _headerListeners.delete(l) }
const _getHeaderSnapshot = () => _headerVersion
const _notifyHeader = () => { _headerVersion++; _headerListeners.forEach((l) => l()) }

const formatMissionTime = (date) => {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const formatActiveChannelLabel = (rawValue) => {
  const numeric = Number(rawValue)
  if (!Number.isInteger(numeric) || numeric < 0) return 'CH-'
  return `CH${numeric}`
}

const parseApparatusTime = (rawValue) => {
  if (typeof rawValue !== 'string') return null
  const clean = rawValue.trim()
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3] ?? '0')
  if (hours > 23 || minutes > 59 || seconds > 59) return null
  const date = new Date()
  date.setHours(hours, minutes, seconds, 0)
  return date
}

const syncMissionTimeFromValue = (rawValue) => {
  const parsed = parseApparatusTime(rawValue)
  if (!parsed) return false
  _missionTimeBaseMs = parsed.getTime()
  _missionTimeBaseCapturedAtMs = Date.now()
  _missionTimeTod = formatMissionTime(parsed)
  return true
}

const syncMissionTimeZoneFromValue = (rawValue) => {
  if (typeof rawValue !== 'string') return false
  const clean = rawValue.trim()
  if (!clean) return false
  _missionTimeZone = clean
  return true
}

const updateMissionTimeTick = () => {
  if (_missionTimeBaseMs === null || _missionTimeBaseCapturedAtMs === null) return
  const elapsedMs = Date.now() - _missionTimeBaseCapturedAtMs
  const next = new Date(_missionTimeBaseMs + elapsedMs)
  _missionTimeTod = formatMissionTime(next)
  _notifyHeader()
}

export const useHeaderState = () => {
  const { parameterValues } = useParameterStore()
  const { getParameters } = useEquipmentGateway()

  // Subscribe to header clock changes
  useSyncExternalStore(_subscribeHeader, _getHeaderSnapshot)

  if (!_missionClockStarted) {
    _missionClockStarted = true

    const syncMissionTimeFromApparatus = async () => {
      const result = await getParameters([APPARATUS_TIME_PARAM_ID, APPARATUS_TIMEZONE_PARAM_ID])
      if (!result.ok) return
      const timeValue = result.values?.[APPARATUS_TIME_PARAM_ID]
      const zoneValue = result.values?.[APPARATUS_TIMEZONE_PARAM_ID]
      let changed = false
      if (syncMissionTimeFromValue(timeValue)) changed = true
      if (syncMissionTimeZoneFromValue(zoneValue)) changed = true
      if (changed) _notifyHeader()
    }

    // Initial sync from parameterValues
    syncMissionTimeFromValue(parameterValues[APPARATUS_TIME_PARAM_ID])
    syncMissionTimeZoneFromValue(parameterValues[APPARATUS_TIMEZONE_PARAM_ID])

    setInterval(updateMissionTimeTick, LOCAL_TICK_INTERVAL_MS)
    setInterval(() => { void syncMissionTimeFromApparatus() }, APPARATUS_SYNC_INTERVAL_MS)
    void syncMissionTimeFromApparatus()
  }

  const activeWaveformName = parameterValues.active_waveform_name ?? '—'
  const activePresetName   = parameterValues.active_preset_name   ?? '—'
  const activeChannelLabel = formatActiveChannelLabel(parameterValues.active_channel_number)

  const cryptoAlgorithm = parameterValues.crypto_algorithm ?? '—'
  const cryptoKeyId     = parameterValues.crypto_key_id     ?? '—'
  const cryptoContext   = parameterValues.crypto_context    ?? '—'

  const commIconVariant = (() => {
    if (parameterValues.comm_radio_silence) return 'radio-silence'
    const state = (parameterValues.comm_state ?? 'IDLE').toUpperCase()
    const mode  = (parameterValues.comm_mode  ?? 'CT').toUpperCase()
    if (state === 'TX') return 'tx'
    if (state === 'RX') return 'rx'
    return mode === 'PT' ? 'idle-pt' : 'idle-ct'
  })()

  return {
    activeWaveformName,
    activePresetName,
    activeChannelLabel,
    cryptoAlgorithm,
    cryptoKeyId,
    cryptoContext,
    commIconVariant,
    missionTimeTod: _missionTimeTod,
    missionTimeZone: _missionTimeZone,
  }
}
