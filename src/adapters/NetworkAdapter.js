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
  async _fetch(url, init) {
    let response
    try {
      response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...((init?.headers) ?? {}) },
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

    let body
    try {
      body = await response.json()
    } catch {
      body = {}
    }

    const hasApplicationError = body?.ok === false

    if (!response.ok || hasApplicationError) {
      const code =
        body?.code ??
        HTTP_STATUS_TO_ERROR_CODE[response.status] ??
        ErrorCode.NETWORK_ERROR

      const defaultMessage = response.ok
        ? `Errore applicativo da ${url}.`
        : `Errore HTTP ${response.status} da ${url}.`

      return {
        ok: false,
        error: new DeviceError(
          code,
          body?.message ?? defaultMessage,
          body?.details,
        ),
      }
    }

    return { ok: true, ...body }
  }

  // ── DeviceAdapter contract ───────────────────────────────────────────────

  /** @override */
  async getParameters(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return { ok: true, values: {} }
    const query = encodeURIComponent(ids.join(','))
    return this._fetch(this._url(`/api/parameters?ids=${query}`))
  }

  /** @override */
  async setParameters(updates) {
    return this._fetch(this._url('/api/parameters'), {
      method: 'POST',
      body: JSON.stringify(updates),
    })
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
