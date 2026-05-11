import { useRef, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useEquipmentGateway } from './useEquipmentGateway.js'

const MISSION_TIME_PLACEHOLDER = '--:--:--'
const APPARATUS_TIME_PARAM_ID = 'ora_sistema'
const APPARATUS_TIMEZONE_PARAM_ID = 'timezone_riferimento'
const APPARATUS_SYNC_INTERVAL_MS = 60_000
const LOCAL_TICK_INTERVAL_MS = 1_000

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

export const useHeaderState = () => {
  const parameterValues = useSelector((state) => state.parameters.values)
  const { getParameters } = useEquipmentGateway()
  
  const [missionTimeTod, setMissionTimeTod] = useState(MISSION_TIME_PLACEHOLDER)
  const [missionTimeZone, setMissionTimeZone] = useState('TMZ')
  
  const missionTimeBaseRef = useRef(null)
  const missionTimeBaseCapturedAtRef = useRef(null)
  const missionClockStartedRef = useRef(false)
  const localTickIntervalRef = useRef(null)
  const syncIntervalRef = useRef(null)

  const syncMissionTimeFromValue = (rawValue) => {
    const parsed = parseApparatusTime(rawValue)
    if (!parsed) return false

    missionTimeBaseRef.current = parsed.getTime()
    missionTimeBaseCapturedAtRef.current = Date.now()
    setMissionTimeTod(formatMissionTime(parsed))
    return true
  }

  const syncMissionTimeZoneFromValue = (rawValue) => {
    if (typeof rawValue !== 'string') return false
    const clean = rawValue.trim()
    if (!clean) return false
    setMissionTimeZone(clean)
    return true
  }

  const updateMissionTimeTick = () => {
    if (missionTimeBaseRef.current === null || missionTimeBaseCapturedAtRef.current === null) return
    const elapsedMs = Date.now() - missionTimeBaseCapturedAtRef.current
    const next = new Date(missionTimeBaseRef.current + elapsedMs)
    setMissionTimeTod(formatMissionTime(next))
  }

  const syncMissionTimeFromApparatus = async () => {
    const result = await getParameters([APPARATUS_TIME_PARAM_ID, APPARATUS_TIMEZONE_PARAM_ID])
    if (!result.ok) return

    const timeValue = result.values?.[APPARATUS_TIME_PARAM_ID]
    const zoneValue = result.values?.[APPARATUS_TIMEZONE_PARAM_ID]

    syncMissionTimeFromValue(timeValue)
    syncMissionTimeZoneFromValue(zoneValue)
  }

  useEffect(() => {
    if (!missionClockStartedRef.current) {
      missionClockStartedRef.current = true

      // Sync from parameter changes
      const timeValue = parameterValues[APPARATUS_TIME_PARAM_ID]
      const zoneValue = parameterValues[APPARATUS_TIMEZONE_PARAM_ID]

      syncMissionTimeFromValue(timeValue)
      syncMissionTimeZoneFromValue(zoneValue)

      // Start local tick timer
      localTickIntervalRef.current = setInterval(updateMissionTimeTick, LOCAL_TICK_INTERVAL_MS)
      
      // Start periodic sync timer
      syncIntervalRef.current = setInterval(syncMissionTimeFromApparatus, APPARATUS_SYNC_INTERVAL_MS)
      
      // Initial sync
      syncMissionTimeFromApparatus()
    }

    return () => {
      if (localTickIntervalRef.current) {
        clearInterval(localTickIntervalRef.current)
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [])

  // Watch for parameter changes
  useEffect(() => {
    const timeValue = parameterValues[APPARATUS_TIME_PARAM_ID]
    if (timeValue) {
      syncMissionTimeFromValue(timeValue)
    }
  }, [parameterValues[APPARATUS_TIME_PARAM_ID]])

  useEffect(() => {
    const zoneValue = parameterValues[APPARATUS_TIMEZONE_PARAM_ID]
    if (zoneValue) {
      syncMissionTimeZoneFromValue(zoneValue)
    }
  }, [parameterValues[APPARATUS_TIMEZONE_PARAM_ID]])

  // ── Zone 1 ────────────────────────────────────────────────────
  const activeWaveformName = parameterValues.active_waveform_name ?? '—'
  const activePresetName = parameterValues.active_preset_name ?? '—'
  const activeChannelLabel = formatActiveChannelLabel(parameterValues.active_channel_number)

  // ── Zone 2 ────────────────────────────────────────────────────
  const cryptoAlgorithm = parameterValues.crypto_algorithm ?? '—'
  const cryptoKeyId = parameterValues.crypto_key_id ?? '—'
  const cryptoContext = parameterValues.crypto_context ?? '—'

  // ── Zone 3 ────────────────────────────────────────────────────
  const commIconVariant = (() => {
    if (parameterValues.comm_radio_silence) return 'radio-silence'
    const state = (parameterValues.comm_state ?? 'IDLE').toUpperCase()
    const mode = (parameterValues.comm_mode ?? 'CT').toUpperCase()
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
    missionTimeTod,
    missionTimeZone,
  }
}