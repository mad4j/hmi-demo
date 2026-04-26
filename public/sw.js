/**
 * sw.js – HMI Demo Service Worker
 *
 * This script intercepts all fetch requests matching /api/* and routes them to a
 * fully self-contained apparatus simulator that runs inside the Service Worker
 * thread.  The simulator is a faithful copy of the logic in deviceSimulator.js,
 * adapted to run as a classic (non-module) Service Worker so that it works on
 * every browser and on GitHub Pages without any build step.
 *
 * Handled routes
 * ──────────────
 *   GET  /api/parameters?ids=id1,id2,…    read parameter values
 *   POST /api/parameters                  write parameter values  (body: JSON object)
 *   POST /api/commands/:commandId         execute a named command (body: { params: {} })
 *   GET  /api/notifications/poll          return accumulated updates since last poll
 *   GET  /api/notifications/sse           server-sent events channel for updates
 *   GET  /api/notifications/log.txt       append-only NDJSON log of notifications
 *
 * All other requests are passed through to the network as normal.
 *
 * SW lifecycle
 * ────────────
 *   install  – skipWaiting() so the new SW activates immediately
 *   activate – clients.claim() so all open tabs are controlled at once,
 *              then the simulation tick loop is started
 */

'use strict'

/* =========================================================================
   APPARATUS STATE  (server-side truth)
   ========================================================================= */

const apparatusState = {
  // Climatisation
  temp_abitacolo:      21.5,
  temp_impostata:      22.0,
  temp_esterna:        14.2,
  umidita:             65,
  ventilazione_attiva: true,
  aria_ricircolo:      false,
  velocita_ventola:    3,
  modalita_clima:      'AUTO',
  // Doors
  porta_ant_sx:   false,
  porta_ant_dx:   false,
  porta_post_sx:  false,
  porta_post_dx:  false,
  blocco_centrale: true,
  cofano:          false,
  portabagagli:    false,
  finestre_chiuse: true,
  portellone:      false,
  // Alarms
  allarme_batteria:       false,
  allarme_temp_motore:    false,
  allarme_pressione:      false,
  allarme_olio:           false,
  allarme_abs:            false,
  allarme_airbag:         false,
  allarme_carburante:     true,
  livello_carburante:     23,
  // System info
  versione_hmi:   '1.0.3',
  stato_rete:     'ONLINE',
  connessione:    'CAN-BUS',
  uptime:         142,
  tensione_batteria: 12.4,
  temperatura_cpu:   48,
  data_sistema:   '23/04/2026',
  ora_sistema:    '17:30',
  // GPS
  gps_stato:        'AGGANCIATO',
  gps_satelliti:    9,
  gps_latitudine:   45.46427,
  gps_longitudine:  9.18951,
  gps_altitudine:   122,
  gps_velocita:     0.0,
  gps_accuratezza:  3.2,
  gps_modalita:     'AUTO',
  // Status icons
  status_fault:   'warning',
  status_channel: 'ok',
  status_gps:     'ok',
  status_login:   'off',
  // Login (never stored after validation)
  login_name:     '',
  login_password: '',
}

const VALID_LOGIN_NAME     = 'admin'
const VALID_LOGIN_PASSWORD = 'admin'
const TICK_INTERVAL_MS     = 3000

/* =========================================================================
   SIMULATION HELPERS
   ========================================================================= */

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const drift = (v, delta, min, max) =>
  clamp(v + (Math.random() - 0.5) * 2 * delta, min, max)

const updateLoginStatus = () => {
  const isLoggedIn =
    apparatusState.login_name === VALID_LOGIN_NAME &&
    apparatusState.login_password === VALID_LOGIN_PASSWORD
  const next = isLoggedIn ? 'ok' : 'off'
  if (next === apparatusState.status_login) return null
  apparatusState.status_login = next
  return next
}

/** Mutate apparatusState and return only the fields that changed. */
const generateTick = () => {
  const updates = {}

  const setIfChanged = (key, next) => {
    if (next !== apparatusState[key]) {
      apparatusState[key] = next
      updates[key] = next
    }
  }

  // Uptime – always increments
  setIfChanged('uptime', apparatusState.uptime + Math.round(TICK_INTERVAL_MS / 1000))

  // System clock
  const now = new Date()
  const timeStr =
    String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
  setIfChanged('ora_sistema', timeStr)

  // Cabin temperature drift
  setIfChanged(
    'temp_abitacolo',
    Math.round(drift(apparatusState.temp_abitacolo, 0.3, 15, 35) * 10) / 10,
  )

  // External temperature drift
  setIfChanged(
    'temp_esterna',
    Math.round(drift(apparatusState.temp_esterna, 0.2, -10, 40) * 10) / 10,
  )

  // Battery voltage drift
  setIfChanged(
    'tensione_batteria',
    Math.round(drift(apparatusState.tensione_batteria, 0.1, 11.0, 14.5) * 10) / 10,
  )

  // CPU temperature drift
  setIfChanged(
    'temperatura_cpu',
    Math.round(drift(apparatusState.temperatura_cpu, 2, 30, 85)),
  )

  // GPS position drift (only when locked)
  if (apparatusState.gps_stato === 'AGGANCIATO') {
    setIfChanged(
      'gps_latitudine',
      Math.round(drift(apparatusState.gps_latitudine, 0.00005, 44.0, 47.0) * 100000) / 100000,
    )
    setIfChanged(
      'gps_longitudine',
      Math.round(drift(apparatusState.gps_longitudine, 0.00005, 8.0, 11.0) * 100000) / 100000,
    )
  }

  // Occasional satellite count change
  if (Math.random() < 0.3) {
    const delta = Math.random() < 0.5 ? 1 : -1
    setIfChanged('gps_satelliti', clamp(apparatusState.gps_satelliti + delta, 4, 14))
  }

  // Occasional GPS accuracy update
  if (Math.random() < 0.25) {
    setIfChanged(
      'gps_accuratezza',
      Math.round(drift(apparatusState.gps_accuratezza, 0.5, 1.0, 8.0) * 10) / 10,
    )
  }

  // Occasional humidity update
  if (Math.random() < 0.2) {
    setIfChanged('umidita', Math.round(drift(apparatusState.umidita, 2, 20, 95)))
  }

  // Occasional fuel level decrease
  if (Math.random() < 0.1 && apparatusState.livello_carburante > 0) {
    const newFuel = Math.max(0, apparatusState.livello_carburante - 1)
    setIfChanged('livello_carburante', newFuel)
    setIfChanged('allarme_carburante', newFuel < 20)
  }

  return updates
}

/* =========================================================================
   PENDING NOTIFICATIONS QUEUE
   ========================================================================= */

// Accumulated parameter deltas since the last /api/notifications/poll call.
// Fields are merged so only the most recent value per key is stored.
let pendingUpdates = {}

// Append-only NDJSON notification log.
// Each line is a JSON object containing one updates payload.
let notificationLogText = ''

// Active SSE clients kept as stream controllers.
const sseClients = new Set()
const textEncoder = new TextEncoder()

const appendNotificationLog = (updates) => {
  notificationLogText += `${JSON.stringify(updates)}\n`
}

const broadcastSse = (updates) => {
  if (sseClients.size === 0) return
  const payload = textEncoder.encode(`data: ${JSON.stringify(updates)}\n\n`)
  for (const client of Array.from(sseClients)) {
    try {
      client.enqueue(payload)
    } catch {
      sseClients.delete(client)
    }
  }
}

const publishUpdates = (updates) => {
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) return
  accumulateUpdates(updates)
  appendNotificationLog(updates)
  broadcastSse(updates)
}

const accumulateUpdates = (updates) => {
  Object.assign(pendingUpdates, updates)
}

const flushUpdates = () => {
  const snapshot = pendingUpdates
  pendingUpdates = {}
  return snapshot
}

/* =========================================================================
   COMMAND HANDLERS
   ========================================================================= */

const COMMANDS = {
  /** Reset all boolean alarm parameters to false. */
  RESET_ALARMS: (_params) => {
    const alarmKeys = [
      'allarme_batteria',
      'allarme_temp_motore',
      'allarme_pressione',
      'allarme_olio',
      'allarme_abs',
      'allarme_airbag',
      'allarme_carburante',
    ]
    const changed = {}
    alarmKeys.forEach((k) => {
      if (apparatusState[k] !== false) {
        apparatusState[k] = false
        changed[k] = false
      }
    })
    publishUpdates(changed)
    return { ok: true }
  },

  /** Reset GPS mode to AUTO. */
  GPS_RESET: (_params) => {
    if (apparatusState.gps_modalita !== 'AUTO') {
      apparatusState.gps_modalita = 'AUTO'
      publishUpdates({ gps_modalita: 'AUTO' })
    }
    return { ok: true }
  },

  /** Simulate a soft reboot by resetting uptime to 0. */
  REBOOT: (_params) => {
    apparatusState.uptime = 0
    publishUpdates({ uptime: 0 })
    return { ok: true }
  },
}

/* =========================================================================
   API REQUEST HANDLERS
   ========================================================================= */

/**
 * GET /api/parameters?ids=id1,id2,…
 */
const handleGetParameters = (url) => {
  const idsParam = url.searchParams.get('ids') || ''
  const ids = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : []

  if (ids.length === 0) return jsonOk({ values: {} })

  const values = {}
  const unknownIds = []
  for (const id of ids) {
    if (id in apparatusState) {
      values[id] = apparatusState[id]
    } else {
      unknownIds.push(id)
    }
  }

  if (unknownIds.length > 0) {
    // Return partial results but also report the unknown IDs in the log.
    // We do NOT fail the whole request for unknown IDs — the app may
    // request IDs that are added later to the config.
    console.warn('[SW] Unknown parameter IDs:', unknownIds)
  }

  return jsonOk({ values })
}

/**
 * POST /api/parameters  body: { id: value, … }
 */
const handleSetParameters = async (request) => {
  let params
  try {
    params = await request.json()
  } catch {
    return jsonError(400, 'INVALID_PARAMS', 'Corpo della richiesta non è JSON valido.')
  }

  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return jsonError(400, 'INVALID_PARAMS', 'Il corpo deve essere un oggetto JSON { id: valore, … }.')
  }

  const changed = {}
  Object.entries(params).forEach(([id, value]) => {
    apparatusState[id] = value
    changed[id] = value
  })

  // Derive login status if credentials changed
  if ('login_name' in params || 'login_password' in params) {
    const nextStatus = updateLoginStatus()
    if (nextStatus !== null) {
      changed.status_login = nextStatus
    }
  }

  publishUpdates(changed)

  return jsonOk({})
}

/**
 * POST /api/commands/:commandId  body: { params: {} }
 */
const handleSendCommand = async (commandId, request) => {
  const handler = COMMANDS[commandId]
  if (!handler) {
    return jsonError(
      404,
      'NOT_FOUND',
      `Comando sconosciuto: "${commandId}". Comandi disponibili: ${Object.keys(COMMANDS).join(', ')}.`,
    )
  }

  let inputParams = {}
  try {
    const body = await request.json()
    inputParams = (body && typeof body.params === 'object' && body.params !== null)
      ? body.params
      : {}
  } catch {
    // params body is optional — empty params is fine
  }

  try {
    const result = handler(inputParams)
    if (result.ok) return jsonOk({ result: result.result ?? null })
    return jsonError(500, 'COMMAND_FAILED', result.message ?? `Esecuzione del comando "${commandId}" fallita.`)
  } catch (err) {
    return jsonError(
      500,
      'COMMAND_FAILED',
      `Errore imprevisto durante l'esecuzione del comando "${commandId}".`,
    )
  }
}

/**
 * GET /api/notifications/poll
 * Returns accumulated updates since the previous call, then clears the queue.
 */
const handlePoll = () => {
  return jsonOk({ updates: flushUpdates() })
}

/**
 * GET /api/notifications/log.txt
 * Returns the full append-only NDJSON notification log.
 */
const handleTextLog = () => {
  return new Response(notificationLogText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * GET /api/notifications/sse
 * Opens a text/event-stream and pushes updates as they happen.
 */
const handleSse = () => {
  const stream = new ReadableStream({
    start(controller) {
      sseClients.add(controller)
      controller.enqueue(textEncoder.encode('retry: 2000\n\n'))
    },
    cancel(controller) {
      sseClients.delete(controller)
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
    },
  })
}

/* =========================================================================
   RESPONSE HELPERS
   ========================================================================= */

const JSON_HEADERS = { 'Content-Type': 'application/json' }

const jsonOk = (body) =>
  new Response(JSON.stringify({ ok: true, ...body }), {
    status: 200,
    headers: JSON_HEADERS,
  })

const jsonError = (status, code, message, details) =>
  new Response(JSON.stringify({ ok: false, code, message, ...(details !== undefined ? { details } : {}) }), {
    status,
    headers: JSON_HEADERS,
  })

/* =========================================================================
   URL ROUTING
   ========================================================================= */

/**
 * Try to match the request against known API routes.
 * Returns a Promise<Response> if the route matches, or null to pass through.
 */
const routeApiRequest = (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept /api/* paths (works regardless of origin sub-path)
  if (!url.pathname.includes('/api/')) return null

  // Normalise: strip everything before /api/
  const apiPath = url.pathname.replace(/^.*\/api\//, '/api/')

  // GET /api/parameters?ids=…
  if (request.method === 'GET' && apiPath === '/api/parameters') {
    return handleGetParameters(url)
  }

  // POST /api/parameters
  if (request.method === 'POST' && apiPath === '/api/parameters') {
    return handleSetParameters(request)
  }

  // POST /api/commands/:commandId
  const commandMatch = apiPath.match(/^\/api\/commands\/([^/?#]+)$/)
  if (request.method === 'POST' && commandMatch) {
    return handleSendCommand(decodeURIComponent(commandMatch[1]), request)
  }

  // GET /api/notifications/poll
  if (request.method === 'GET' && apiPath === '/api/notifications/poll') {
    return handlePoll()
  }

  // GET /api/notifications/sse
  if (request.method === 'GET' && apiPath === '/api/notifications/sse') {
    return handleSse()
  }

  // GET /api/notifications/log.txt
  if (request.method === 'GET' && apiPath === '/api/notifications/log.txt') {
    return handleTextLog()
  }

  return null // unknown API route — let it fall through to the network
}

/* =========================================================================
   SERVICE WORKER LIFECYCLE
   ========================================================================= */

self.addEventListener('install', (event) => {
  // Activate immediately without waiting for existing tabs to close
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      // Start the simulation tick loop once the SW controls all clients
      setInterval(() => {
        publishUpdates(generateTick())
      }, TICK_INTERVAL_MS)
      console.info('[SW] HMI Demo Service Worker active — simulator running.')
    }),
  )
})

self.addEventListener('fetch', (event) => {
  const response = routeApiRequest(event)
  if (response !== null) {
    event.respondWith(Promise.resolve(response))
  }
  // All other requests: fall through to the network (no event.respondWith call)
})
