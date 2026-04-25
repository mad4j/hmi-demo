/**
 * deviceSimulator.js
 *
 * Simulated remote apparatus. This module acts as the server-side truth:
 * it owns state, applies commands, and emits push notifications.
 */

// Simulated apparatus state (server-side truth)
const apparatusState = {
  // Climatisation
  temp_abitacolo: 21.5,
  temp_impostata: 22.0,
  temp_esterna: 14.2,
  umidita: 65,
  ventilazione_attiva: true,
  aria_ricircolo: false,
  velocita_ventola: 3,
  modalita_clima: 'AUTO',
  // Doors
  porta_ant_sx: false,
  porta_ant_dx: false,
  porta_post_sx: false,
  porta_post_dx: false,
  blocco_centrale: true,
  cofano: false,
  portabagagli: false,
  finestre_chiuse: true,
  portellone: false,
  // Alarms
  allarme_batteria: false,
  allarme_temp_motore: false,
  allarme_pressione: false,
  allarme_olio: false,
  allarme_abs: false,
  allarme_airbag: false,
  allarme_carburante: true,
  livello_carburante: 23,
  // System info
  versione_hmi: '1.0.3',
  stato_rete: 'ONLINE',
  connessione: 'CAN-BUS',
  uptime: 142,
  tensione_batteria: 12.4,
  temperatura_cpu: 48,
  data_sistema: '23/04/2026',
  ora_sistema: '17:30',
  // GPS
  gps_stato: 'AGGANCIATO',
  gps_satelliti: 9,
  gps_latitudine: 45.46427,
  gps_longitudine: 9.18951,
  gps_altitudine: 122,
  gps_velocita: 0.0,
  gps_accuratezza: 3.2,
  gps_modalita: 'AUTO',
  // Status icon parameters
  status_fault: 'warning',
  status_channel: 'ok',
  status_gps: 'ok',
  status_login: 'off',
  // Login
  login_name: '',
  login_password: '',
}

const VALID_LOGIN_NAME = 'admin'
const VALID_LOGIN_PASSWORD = 'admin'

// Network latency simulation
const LATENCY_MIN_MS = 80
const LATENCY_MAX_MS = 250

const simulateLatency = () =>
  new Promise((resolve) =>
    setTimeout(resolve, LATENCY_MIN_MS + Math.random() * (LATENCY_MAX_MS - LATENCY_MIN_MS)),
  )

// Notification loop (server-push simulation)
const NOTIFICATION_INTERVAL_MS = 3000

const notificationListeners = new Set()
let notificationTimerId = null

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const drift = (v, delta, min, max) =>
  clamp(v + (Math.random() - 0.5) * 2 * delta, min, max)

const emitNotification = (updates) => {
  if (Object.keys(updates).length === 0) return
  notificationListeners.forEach((cb) => cb(updates))
}

const updateLoginStatus = () => {
  const isLoggedIn =
    apparatusState.login_name === VALID_LOGIN_NAME &&
    apparatusState.login_password === VALID_LOGIN_PASSWORD
  const nextStatus = isLoggedIn ? 'ok' : 'off'
  if (nextStatus === apparatusState.status_login) return null

  apparatusState.status_login = nextStatus
  return nextStatus
}

/** Mutates apparatusState in-place and returns only changed fields. */
const generateNotification = () => {
  const updates = {}

  // Uptime increments every tick
  const newUptime = apparatusState.uptime + Math.round(NOTIFICATION_INTERVAL_MS / 1000)
  apparatusState.uptime = newUptime
  updates.uptime = newUptime

  // System clock
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  if (timeStr !== apparatusState.ora_sistema) {
    apparatusState.ora_sistema = timeStr
    updates.ora_sistema = timeStr
  }

  // Cabin temperature drift
  const newTempAb = Math.round(drift(apparatusState.temp_abitacolo, 0.3, 15, 35) * 10) / 10
  if (newTempAb !== apparatusState.temp_abitacolo) {
    apparatusState.temp_abitacolo = newTempAb
    updates.temp_abitacolo = newTempAb
  }

  // External temperature drift
  const newTempExt = Math.round(drift(apparatusState.temp_esterna, 0.2, -10, 40) * 10) / 10
  if (newTempExt !== apparatusState.temp_esterna) {
    apparatusState.temp_esterna = newTempExt
    updates.temp_esterna = newTempExt
  }

  // Battery voltage drift
  const newVolt = Math.round(drift(apparatusState.tensione_batteria, 0.1, 11.0, 14.5) * 10) / 10
  if (newVolt !== apparatusState.tensione_batteria) {
    apparatusState.tensione_batteria = newVolt
    updates.tensione_batteria = newVolt
  }

  // CPU temperature drift
  const newCpuTemp = Math.round(drift(apparatusState.temperatura_cpu, 2, 30, 85))
  if (newCpuTemp !== apparatusState.temperatura_cpu) {
    apparatusState.temperatura_cpu = newCpuTemp
    updates.temperatura_cpu = newCpuTemp
  }

  // GPS position drift (only when locked)
  if (apparatusState.gps_stato === 'AGGANCIATO') {
    const newLat =
      Math.round(drift(apparatusState.gps_latitudine, 0.00005, 44.0, 47.0) * 100000) / 100000
    const newLon =
      Math.round(drift(apparatusState.gps_longitudine, 0.00005, 8.0, 11.0) * 100000) / 100000
    if (newLat !== apparatusState.gps_latitudine) {
      apparatusState.gps_latitudine = newLat
      updates.gps_latitudine = newLat
    }
    if (newLon !== apparatusState.gps_longitudine) {
      apparatusState.gps_longitudine = newLon
      updates.gps_longitudine = newLon
    }
  }

  // Occasional satellite count change
  if (Math.random() < 0.3) {
    const delta = Math.random() < 0.5 ? 1 : -1
    const newSat = clamp(apparatusState.gps_satelliti + delta, 4, 14)
    if (newSat !== apparatusState.gps_satelliti) {
      apparatusState.gps_satelliti = newSat
      updates.gps_satelliti = newSat
    }
  }

  // Occasional GPS accuracy update
  if (Math.random() < 0.25) {
    const newAcc = Math.round(drift(apparatusState.gps_accuratezza, 0.5, 1.0, 8.0) * 10) / 10
    if (newAcc !== apparatusState.gps_accuratezza) {
      apparatusState.gps_accuratezza = newAcc
      updates.gps_accuratezza = newAcc
    }
  }

  // Occasional humidity update
  if (Math.random() < 0.2) {
    const newHum = Math.round(drift(apparatusState.umidita, 2, 20, 95))
    if (newHum !== apparatusState.umidita) {
      apparatusState.umidita = newHum
      updates.umidita = newHum
    }
  }

  // Occasional fuel level decrease
  if (Math.random() < 0.1 && apparatusState.livello_carburante > 0) {
    const newFuel = Math.max(0, apparatusState.livello_carburante - 1)
    apparatusState.livello_carburante = newFuel
    updates.livello_carburante = newFuel
    // Activate low-fuel alarm at threshold
    const alarm = newFuel < 20
    if (alarm !== apparatusState.allarme_carburante) {
      apparatusState.allarme_carburante = alarm
      updates.allarme_carburante = alarm
    }
  }

  return updates
}

const startNotifications = () => {
  if (notificationTimerId !== null) return
  notificationTimerId = setInterval(() => {
    emitNotification(generateNotification())
  }, NOTIFICATION_INTERVAL_MS)
}

export const fetchSimulatedState = async () => {
  await simulateLatency()
  startNotifications()
  return { ...apparatusState }
}

export const sendSimulatedCommand = async (idOrPayload, value) => {
  await simulateLatency()

  const isBatchPayload =
    idOrPayload !== null && typeof idOrPayload === 'object' && !Array.isArray(idOrPayload)
  const commandPayload = isBatchPayload ? idOrPayload : { [idOrPayload]: value }

  Object.entries(commandPayload).forEach(([id, nextValue]) => {
    apparatusState[id] = nextValue
  })

  const derivedUpdates = {}
  if ('login_name' in commandPayload || 'login_password' in commandPayload) {
    const nextStatus = updateLoginStatus()
    if (nextStatus !== null) {
      derivedUpdates.status_login = nextStatus
    }
  }

  emitNotification(derivedUpdates)

  const commandEntries = Object.entries(commandPayload)
  if (!isBatchPayload && commandEntries.length === 1) {
    const [id, nextValue] = commandEntries[0]
    return { ok: true, id, value: nextValue }
  }

  return { ok: true, values: { ...commandPayload } }
}

export const subscribeToSimulatedNotifications = (callback) => {
  notificationListeners.add(callback)
  return () => notificationListeners.delete(callback)
}
