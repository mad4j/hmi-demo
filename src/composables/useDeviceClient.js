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
 * Transport: REST (fetch) for reads/writes; SSE (EventSource) for push notifications.
 * The Vite dev-server proxies /api to the simulator server (see vite.config.js).
 */

import { ref } from 'vue'

const BASE_URL = '/api'

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[DeviceClient] ${direction} ${action}`, payload)
}

// ── Shared connection state (reactive, exported for UI use) ───────────────
export const isConnected = ref(false)
export const isLoading = ref(false)

// ── Composable ────────────────────────────────────────────────────────────
export const useDeviceClient = () => {
  /**
   * GET /api/parameters?ids=id1,id2,...
   * Requests current values for the provided list of parameter IDs.
   * @param {string[]} ids
   * @returns {Promise<{ ok: true, values: Record<string, unknown> } | { ok: false, message: string }>}
   */
  const getParameters = async (ids) => {
    isLoading.value = true
    try {
      logDeviceTraffic('->', 'getParameters', ids)
      const qs = ids.length > 0 ? `?ids=${ids.join(',')}` : ''
      const response = await fetch(`${BASE_URL}/parameters${qs}`)
      const result = await response.json()
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
      const response = await fetch(`${BASE_URL}/parameters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      })
      const result = await response.json()
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
   * Subscribe to apparatus push notifications via SSE (GET /api/notifications).
   * @param {(updates: Record<string, unknown>) => void} callback
   *   Called whenever the apparatus broadcasts a parameter update.
   *   Only the changed fields are included in `updates`.
   * @returns {() => void} Unsubscribe function.
   */
  const notifyParameters = (callback) => {
    const source = new EventSource(`${BASE_URL}/notifications`)
    source.onmessage = (event) => {
      try {
        const updates = JSON.parse(event.data)
        logDeviceTraffic('<-', 'notification', updates)
        callback(updates)
      } catch {
        // ignore malformed notification frames
      }
    }
    source.onerror = () => {
      isConnected.value = false
    }
    return () => source.close()
  }

  return { getParameters, setParameters, notifyParameters, isConnected, isLoading }
}
