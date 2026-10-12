/**
 * NetworkAdapter.js
 *
 * Adapter that communicates with the apparatus via HTTP fetch.
 * In development and on GitHub Pages the requests are transparently intercepted
 * by the registered Service Worker (public/sw.js), which runs the simulator logic.
 * In production the same adapter talks to a real apparatus backend.
 *
 * API surface assumed on the server / Service Worker:
 *
 *   GET  /api/parameters?ids=id1,id2,…    → { ok: true, values: { id: value, … } }
 *   POST /api/parameters                  → { ok: true }                          body: { id: value, … }
 *   POST /api/commands/:commandId         → { ok: true, result?: any }            body: { params: {…} }
 *   GET  /api/notifications/poll          → { ok: true, updates: { id: value, … } }
 *   GET  /api/notifications/sse           → text/event-stream (SSE data events with JSON updates)
 *   GET  /api/notifications/log.txt       → append-only text log (NDJSON, one update object per line)
 *
 * Error responses carry:  { ok: false, code: ErrorCode, message: string, details?: any }
 */

import { DeviceAdapter, DeviceError, ErrorCode } from './DeviceAdapter.js'
import { PollNotificationTransport } from './notifications/PollNotificationTransport.js'
import { SseNotificationTransport } from './notifications/SseNotificationTransport.js'
import { TextTailNotificationTransport } from './notifications/TextTailNotificationTransport.js'
import {
  NotificationTransportMode,
  normalizeNotificationTransportMode,
} from './notifications/notificationTransportModes.js'

// Map HTTP status codes to DeviceError codes when the response body has no `code` field.
const HTTP_STATUS_TO_ERROR_CODE = {
  400: ErrorCode.INVALID_PARAMS,
  401: ErrorCode.PERMISSION_DENIED,
  403: ErrorCode.PERMISSION_DENIED,
  404: ErrorCode.NOT_FOUND,
  409: ErrorCode.DEVICE_BUSY,
  503: ErrorCode.DEVICE_BUSY,
}

const POLL_INTERVAL_MS = 3000
const CMD_GET_RADIO_CHANNELS = 39
const CMD_GET_WAV_INFO_INSTANTIATED = 2 
function transformResponse(response) {

  if (!response || response.ok !== true) {
    return {
      ok: false,
      values: {}
    };
  }

  const arr = response.values || [];

  const values = {};

  arr.forEach(item => {

    values[item.id] = item.value;

  });

  return {
    ok: true,
    values
  };
}
// ── Adapter implementation ────────────────────────────────────────────────

export class NetworkAdapter extends DeviceAdapter {
  /**
   * @param {string} [baseUrl='']  Base URL prepended to every API path.
   *   Leave empty to use the same origin (works with SW fetch interception).
   *   Example for a real server: 'http://192.168.1.100:8080'
   * @param {{
   *   notificationTransport?: 'poll'|'sse'|'text-tail',
   *   notificationTextUrl?: string,
   *   notificationIntervalMs?: number,
   * }} [options]
   */
  constructor(baseUrl = '', options = {}) {
    super()
    this._base = baseUrl.replace(/\/$/, '') // strip trailing slash
    this._notificationTransport = normalizeNotificationTransportMode(options.notificationTransport)
    this._notificationTextUrl =
      typeof options.notificationTextUrl === 'string' && options.notificationTextUrl.trim()
        ? options.notificationTextUrl.trim()
        : '/api/notifications/log.txt'
    this._notificationIntervalMs =
      Number.isFinite(options.notificationIntervalMs) && options.notificationIntervalMs > 0
        ? options.notificationIntervalMs
        : POLL_INTERVAL_MS
      this._notificationTransportInstance = this._createNotificationTransportInstance()
    /** @type {Set<(updates: Record<string, unknown>) => void>} */
    this._notificationCallbacks = new Set()
  }

  // ── Internal helpers ────────────────────────────────────────────────────

  _url(path) {
    return `${this._base}${path}`
  }

  _resolveTextLogUrl() {
    if (/^https?:\/\//i.test(this._notificationTextUrl)) return this._notificationTextUrl
    if (this._notificationTextUrl.startsWith('/')) return this._url(this._notificationTextUrl)
    return this._url(`/${this._notificationTextUrl}`)
  }

  _createNotificationTransportInstance() {
    if (this._notificationTransport === NotificationTransportMode.SSE) {
      if (!SseNotificationTransport.isSupported()) {
        this._notificationTransport = NotificationTransportMode.POLL
      } else {
        return new SseNotificationTransport({
          url: this._url('/api/notifications/sse'),
          emitUpdates: (updates) => this._emitUpdates(updates),
        })
      }
    }

    if (this._notificationTransport === NotificationTransportMode.TEXT_TAIL) {
      return new TextTailNotificationTransport({
        intervalMs: this._notificationIntervalMs,
        resolveUrl: () => this._resolveTextLogUrl(),
        fetchText: async (url) => {
          const response = await fetch(url, { cache: 'no-store' })
          if (!response.ok) return null
          return response.text()
        },
        emitUpdates: (updates) => this._emitUpdates(updates),
      })
    }

    return new PollNotificationTransport({
      intervalMs: this._notificationIntervalMs,
      poll: async () => this._poll(),
    })
  }

  _emitUpdates(updates) {
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) return
    this._notificationCallbacks.forEach((cb) => cb(updates))
  }

  /**
   * Execute a fetch and normalise the result into the adapter response shape.
   * @param {string} url
   * @param {RequestInit} [init]
   * @returns {Promise<{ ok: true, [key: string]: unknown } | { ok: false, error: DeviceError }>}
   */
 
  // ── DeviceAdapter contract ───────────────────────────────────────────────
// =========================================================
// GENERIC HTML FETCH
// =========================================================

async _fetch(url, init) {
  let response

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...((init?.headers) ?? {}),
      },
      ...init,
    })
  } catch (err) {
    return {
      ok: false,
      error: new DeviceError(
        ErrorCode.NETWORK_ERROR,
        'Impossibile raggiungere il dispositivo. Verifica la connessione.',
        err,
      ),
    }
  }

  let html = ''

  try {
    html = await response.text()
  } catch (err) {
    return {
      ok: false,
      error: new DeviceError(
        ErrorCode.NETWORK_ERROR,
        'Risposta non valida dal dispositivo.',
        err,
      ),
    }
  }

  if (!response.ok) {
    const code =
      HTTP_STATUS_TO_ERROR_CODE[response.status] ??
      ErrorCode.NETWORK_ERROR

    return {
      ok: false,
      error: new DeviceError(
        code,
        `Errore HTTP ${response.status} da ${url}.`,
      ),
    }
  }

  return this._parseHtmlResponse(html)
}

// =========================================================
// GENERIC HTML PARSER
// =========================================================

_parseHtmlResponse(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const getValue = (id) =>
    doc.getElementById(id)?.textContent?.trim() ?? ''

  const error = getValue('ERROR')
  const resultRaw = getValue('RESULT')

  let result = resultRaw

  try {
    result = resultRaw ? JSON.parse(resultRaw) : null
  } catch {
    // keep raw string
  }

  if (error !== '0') {
    return {
      ok: false,
      error: new DeviceError(
        ErrorCode.DEVICE_ERROR,
        `Device returned error ${error}`,
        { error },
      ),
    }
  }

  return {
    ok: true,
    values: result,
    meta: {
      clientUniqueId: getValue('CLIENT_UNIQUE_ID'),
      cmdType: getValue('CMD_TYPE'),
      fragmentationId: getValue('FRAGMENTATION_ID'),
    },
  }
}

// =========================================================
// GENERIC COMMAND
// =========================================================

async _postCommand(cmdType, clientUniqueId, parameters = {}) {
  const body = new URLSearchParams({
    CLIENT_UNIQUE_ID: clientUniqueId,
    CMD_TYPE: String(cmdType),
    PARAMETER_1: parameters.PARAMETER_1 ?? '',
    PARAMETER_2: parameters.PARAMETER_2 ?? '',
    PARAMETER_3: parameters.PARAMETER_3 ?? '',
    PARAMETER_4: parameters.PARAMETER_4 ?? '',
    PARAMETER_5: parameters.PARAMETER_5 ?? '',
  })

  return this._fetch(
    this._url('/platform/browser/html/datapage.html'),
    {
      method: 'POST',
      body: body.toString(),
    },
  )
}

// =========================================================
// METHODS
// =========================================================

async getRadioChannels(clientUniqueId) {
  return this._postCommand(39, clientUniqueId)
}

async getWavInfoInstantiated(clientUniqueId) {
  return this._postCommand(40, clientUniqueId)
}


async getWaveformParameter(ids,clientUniqueId){
  
const DCE_PROP_SEP = '\x12' + '0' + '\x11';
const DCE_SEP = '\x10';

const MAX_LEN = 180;

const transcodeType = (type) => {

  switch ((type || '').toLowerCase()) {

  case 'ulong':
    return 6;

  case 'long':
    return 4;

  case 'boolean':
  case 'bool':
    return 3;

  case 'string':
    return 2;

  case 'char':
    return 1;

  case 'short':
    return 5;

  case 'ushort':
    return 7;
    
  case 'octets':
    return 8;

  case 'octet':
    return 8;


  case 'float':
    return 9;

  case 'double':
    return 10;

  case 'ipaddr':
    return 11;

  default:
    return -1;
  }

}


// SERIALIZZAZIONE COMPLETA
let payload = '';

for (const item of ids) {
  payload +=
    item.id +
    DCE_PROP_SEP +
    transcodeType(item.field) +
    DCE_SEP
}

// SPLIT LEGACY
const chunks = [];

for (let i = 0; i < payload.length; i += MAX_LEN) {
  chunks.push(payload.slice(i, i + MAX_LEN));
}

let result = await this._postCommand(
  5,
  clientUniqueId,
  {
    PARAMETER_1: `1\x10*`,
    PARAMETER_2: chunks[0] || '',
    PARAMETER_3: chunks[1] || '',
    PARAMETER_4: chunks[2] || '',
    PARAMETER_5: chunks[3] || ''
  }
);

 
  let resultFormatted =  transformResponse(result);
  
   return resultFormatted;
}

async setWaveformParameters(payload, clientUniqueId) {

  const DCE_PROP_SEP_1 = '\x12';
  const DCE_PROP_SEP_2 = '\x11';
  const DCE_SEP = '\x10';

  const MAX_LEN = 180;

  const transcodeType = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'ulong': return 6;
      case 'long': return 4;
      case 'boolean':
      case 'bool': return 3;
      case 'string': return 2;
      case 'char': return 1;
      case 'short': return 5;
      case 'ushort': return 7;
      case 'octets':
      case 'octet': return 8;
      case 'float': return 9;
      case 'double': return 10;
      case 'ipaddr': return 11;
      default: return -1;
    }
  };

  // -----------------------------
  // SERIALIZZAZIONE DCE
  // id + type + value
  // -----------------------------
  let raw = '';

  for (const item of payload) {

    raw +=
      item.id +
      DCE_PROP_SEP_1 +
      item.value+
      DCE_PROP_SEP_2+
      transcodeType(item.field) +
      DCE_SEP;
  }

  // -----------------------------
  // CHUNKING LEGACY
  // -----------------------------
  const chunks = [];

  for (let i = 0; i < raw.length; i += MAX_LEN) {
    chunks.push(raw.slice(i, i + MAX_LEN));
  }


  const result = await this._postCommand(
    6,
    clientUniqueId,
     {
    PARAMETER_1: `1\x10*`,
    PARAMETER_2: chunks[0] || '',
    PARAMETER_3: chunks[1] || '',
    PARAMETER_4: chunks[2] || '',
    PARAMETER_5: chunks[3] || ''
  }
  );

  return transformResponse(result);
}

  /** @override */
async setParameters(updates) {
  let res = await this.setWaveformParameters(updates,"1779355385957387606308FFFFFFFFF.FFFFFFFFF")
  return res;
  }
  
    /** @override **/
async getParameters(ids) {

 let res = await this.getWaveformParameter(ids,"1779355385957387606308FFFFFFFFF.FFFFFFFFF")
 return res;
}
  /**
   * Send a named command to the apparatus.
   *
   * @param {string} commandId
   * @param {Record<string, unknown>} [params={}]
   * @returns {Promise<{ ok: true, result?: unknown } | { ok: false, error: DeviceError }>}
   */
  async sendCommand(commandId, params = {}) {
    if (!commandId || typeof commandId !== 'string') {
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.INVALID_PARAMS,
          'Il parametro commandId deve essere una stringa non vuota.',
        ),
      }
    }
    return this._fetch(this._url(`/api/commands/${encodeURIComponent(commandId)}`), {
      method: 'POST',
      body: JSON.stringify({ params }),
    })
  }

  /**
   * Subscribe to notifications via long-polling.
   * Starts the poll loop on first subscription; stops it when all subscribers
   * unsubscribe via dispose().
   *
   * @param {(updates: Record<string, unknown>) => void} callback
   * @returns {() => void} Unsubscribe function.
   */
  onNotification(callback) {
    this._notificationCallbacks.add(callback)
    this._notificationTransportInstance.start()
    return () => {
      this._notificationCallbacks.delete(callback)
      if (this._notificationCallbacks.size === 0) {
        this._notificationTransportInstance.stop()
      }
    }
  }

  /** @override */
  dispose() {
    this._notificationTransportInstance.stop()
    this._notificationCallbacks.clear()
  }

  async _poll() {
    const result = await this._fetch(this._url('/api/notifications/poll'))
    if (!result.ok) return // swallow poll errors silently
    const updates = result.updates
    this._emitUpdates(updates)
  }
}
