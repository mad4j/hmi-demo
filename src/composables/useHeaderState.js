import { computed, ref, watch } from 'vue'
import { useParameterStore } from './useParameterStore.js'
import { useEquipmentGateway } from './useEquipmentGateway.js'

const MISSION_TIME_PLACEHOLDER = '--:--:--'
const APPARATUS_TIME_PARAM_ID = 'ora_sistema'
const APPARATUS_TIMEZONE_PARAM_ID = 'timezone_riferimento'
const APPARATUS_SYNC_INTERVAL_MS = 60_000
const LOCAL_TICK_INTERVAL_MS = 1_000

const missionTimeTod = ref(MISSION_TIME_PLACEHOLDER)
const missionTimeZone = ref('TMZ')

let missionTimeBaseMs = null
let missionTimeBaseCapturedAtMs = null
let missionClockStarted = false

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

  missionTimeBaseMs = parsed.getTime()
  missionTimeBaseCapturedAtMs = Date.now()
  missionTimeTod.value = formatMissionTime(parsed)
  return true
}

const syncMissionTimeZoneFromValue = (rawValue) => {
  if (typeof rawValue !== 'string') return false
  const clean = rawValue.trim()
  if (!clean) return false
  missionTimeZone.value = clean
  return true
}

const updateMissionTimeTick = () => {
  if (missionTimeBaseMs === null || missionTimeBaseCapturedAtMs === null) return
  const elapsedMs = Date.now() - missionTimeBaseCapturedAtMs
  const next = new Date(missionTimeBaseMs + elapsedMs)
  missionTimeTod.value = formatMissionTime(next)
}

/**
 * Derives the three header zones from live apparatus parameters.
 *
 * Zone 1 – Identity
 *   active_waveform_name  (string | null)
 *   active_preset_name    (string | null)
 *
 * Zone 2 – Crypto
 *   crypto_algorithm      (string | null)
 *   crypto_key_id         (string | null)
 *   crypto_context        (string | null)  e.g. 'NATO' | 'NAZ'
 *
 * Zone 3 – Communication icon
 *   commIconVariant       computed from comm_state, comm_mode, comm_radio_silence
 *     'radio-silence'  – highest priority
 *     'tx'
 *     'rx'
 *     'idle-ct'
 *     'idle-pt'        – warning state (plain-text idle)
 */
export const useHeaderState = () => {
  const { parameterValues } = useParameterStore()
  const { getParameters } = useEquipmentGateway()

  if (!missionClockStarted) {
    missionClockStarted = true

    const syncMissionTimeFromApparatus = async () => {
      const result = await getParameters([APPARATUS_TIME_PARAM_ID, APPARATUS_TIMEZONE_PARAM_ID])
      if (!result.ok) return

      const timeValue = result.values?.[APPARATUS_TIME_PARAM_ID]
      const zoneValue = result.values?.[APPARATUS_TIMEZONE_PARAM_ID]

      if (syncMissionTimeFromValue(timeValue) && APPARATUS_TIME_PARAM_ID in parameterValues) {
        parameterValues[APPARATUS_TIME_PARAM_ID] = timeValue
      }

      if (syncMissionTimeZoneFromValue(zoneValue) && APPARATUS_TIMEZONE_PARAM_ID in parameterValues) {
        parameterValues[APPARATUS_TIMEZONE_PARAM_ID] = zoneValue
      }
    }

    watch(
      () => parameterValues[APPARATUS_TIME_PARAM_ID],
      (nextValue) => {
        syncMissionTimeFromValue(nextValue)
      },
      { immediate: true },
    )

    watch(
      () => parameterValues[APPARATUS_TIMEZONE_PARAM_ID],
      (nextValue) => {
        syncMissionTimeZoneFromValue(nextValue)
      },
      { immediate: true },
    )

    setInterval(updateMissionTimeTick, LOCAL_TICK_INTERVAL_MS)
    setInterval(() => {
      void syncMissionTimeFromApparatus()
    }, APPARATUS_SYNC_INTERVAL_MS)
    void syncMissionTimeFromApparatus()
  }

  // ── Zone 1 ────────────────────────────────────────────────────
  const activeWaveformName = computed(() => parameterValues.active_waveform_name ?? '—')
  const activePresetName   = computed(() => parameterValues.active_preset_name   ?? '—')
  const activeChannelLabel = computed(() => formatActiveChannelLabel(parameterValues.active_channel_number))

  // ── Zone 2 ────────────────────────────────────────────────────
  const cryptoAlgorithm = computed(() => parameterValues.crypto_algorithm ?? '—')
  const cryptoKeyId     = computed(() => parameterValues.crypto_key_id     ?? '—')
  const cryptoContext   = computed(() => parameterValues.crypto_context    ?? '—')

  // ── Zone 3 ────────────────────────────────────────────────────
  const commIconVariant = computed(() => {
    if (parameterValues.comm_radio_silence) return 'radio-silence'
    const state = (parameterValues.comm_state ?? 'IDLE').toUpperCase()
    const mode  = (parameterValues.comm_mode  ?? 'CT').toUpperCase()
    if (state === 'TX') return 'tx'
    if (state === 'RX') return 'rx'
    return mode === 'PT' ? 'idle-pt' : 'idle-ct'
  })

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
