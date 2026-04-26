/**
 * useDeviceClient.js
 *
 * Central async communication module for apparatus remote control.
 * All interactions with the apparatus – parameter reads, parameter writes
 * and server-push notifications – are routed exclusively through this module.
 *
 * Public interface:
 *   getParameters(ids)         – request current values for a list of parameter IDs
 *   setParameters(params)      – apply a map of { id: value } updates to the apparatus
 *   notifyParameters(callback) – subscribe to asynchronous apparatus push notifications
 *
 * The simulator runs in a dedicated Web Worker (simulatorWorker.js).
 * Communication uses a simple request/response message protocol that mirrors
 * the semantics of a REST + server-push transport, so the rest of the
 * application code is structured exactly as it would be against a real server.
 */

import { ref } from 'vue'

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[DeviceClient] ${direction} ${action}`, payload)
}

// ── Shared connection state (reactive, exported for UI use) ───────────────
export const isConnected = ref(false)
export const isLoading = ref(false)

// ── Worker singleton ──────────────────────────────────────────────────────
let _worker = null
let _nextRequestId = 0
const _pendingRequests = new Map() // requestId → resolve function
const _notificationCallbacks = new Set()

const getWorker = () => {
  if (_worker) return _worker
  _worker = new Worker(new URL('../workers/simulatorWorker.js', import.meta.url), {
    type: 'module',
  })
  _worker.onmessage = (event) => {
    const { type, id, result, updates } = event.data
    if (type === 'RESPONSE') {
      const resolve = _pendingRequests.get(id)
      if (resolve) {
        _pendingRequests.delete(id)
        resolve(result)
      }
    } else if (type === 'NOTIFICATION') {
      _notificationCallbacks.forEach((cb) => cb(updates))
    }
  }
  return _worker
}

/** Send a typed request to the worker and await the correlated RESPONSE. */
const workerRequest = (type, payload) => {
  const id = _nextRequestId++
  return new Promise((resolve) => {
    _pendingRequests.set(id, resolve)
    getWorker().postMessage({ type, id, payload })
  })
}

// ── Composable ────────────────────────────────────────────────────────────
export const useDeviceClient = () => {
  /**
   * GET /api/parameters
   * Requests current values for the provided list of parameter IDs.
   * @param {string[]} ids
   * @returns {Promise<{ ok: true, values: Record<string, unknown> } | { ok: false, message: string }>}
   */
  const getParameters = async (ids) => {
    isLoading.value = true
    try {
      logDeviceTraffic('->', 'getParameters', ids)
      const result = await workerRequest('GET_PARAMETERS', { ids })
      if (result.ok) {
        isConnected.value = true
        logDeviceTraffic('<-', 'getParameters', result.values)
      } else {
        isConnected.value = false
        logDeviceTraffic('<-', 'getParameters [ERROR]', result.message)
      }
      return result
    } catch (err) {
      isConnected.value = false
      const message = err instanceof Error ? err.message : 'Errore di comunicazione con il dispositivo.'
      logDeviceTraffic('<-', 'getParameters [ERROR]', message)
      return { ok: false, message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * POST /api/parameters
   * Sends a map of parameter updates to the apparatus.
   * @param {Record<string, unknown>} params  – { [parameterId]: newValue }
   * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
   */
  const setParameters = async (params) => {
    try {
      logDeviceTraffic('->', 'setParameters', params)
      const result = await workerRequest('SET_PARAMETERS', { params })
      if (result.ok) {
        logDeviceTraffic('<-', 'setParameters', result)
      } else {
        logDeviceTraffic('<-', 'setParameters [ERROR]', result.message)
      }
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore di comunicazione con il dispositivo.'
      logDeviceTraffic('<-', 'setParameters [ERROR]', message)
      return { ok: false, message }
    }
  }

  /**
   * Subscribe to apparatus notifications (server-push via Worker messages).
   * @param {(updates: Record<string, unknown>) => void} callback
   *   Called whenever the apparatus broadcasts a parameter update.
   *   Only the changed fields are included in `updates`.
   * @returns {() => void} Unsubscribe function.
   */
  const notifyParameters = (callback) => {
    const wrapped = (updates) => {
      logDeviceTraffic('<-', 'notification', updates)
      callback(updates)
    }
    _notificationCallbacks.add(wrapped)
    return () => _notificationCallbacks.delete(wrapped)
  }

  return { getParameters, setParameters, notifyParameters, isConnected, isLoading }
}
