/**
 * useDeviceClient.js
 *
 * Central async communication module for apparatus remote control.
 * All interactions with the apparatus – parameter reads, parameter writes,
 * named commands and server-push notifications – are routed exclusively
 * through this module.
 *
 * Adapter selection
 * ─────────────────
 * The module auto-selects the best available adapter at startup:
 *
 *   1. NetworkAdapter  – used when a Service Worker is registered and
 *      controlling the page.  HTTP fetch calls are intercepted by the SW
 *      (public/sw.js) which runs the simulator logic in its own thread.
 *      This path is active during normal development and on GitHub Pages.
 *
 *   2. SimulatorAdapter – direct fallback used when no SW is in control
 *      (e.g. very first page load before SW activation, Safari private mode,
 *      or any environment where Service Workers are unavailable).
 *
 * Public interface
 * ────────────────
 *   getParameters(ids)            – fetch current values for a list of parameter IDs
 *   setParameters(params)         – apply a map of { id: value } updates
 *   sendCommand(commandId, params)– execute a named command on the apparatus
 *   notifyParameters(callback)    – subscribe to asynchronous push notifications
 *   isConnected                   – reactive boolean (true after first successful I/O)
 *   isLoading                     – reactive boolean (true while a get/set is in flight)
 */

import { ref } from 'vue'
import { NetworkAdapter }   from '../adapters/NetworkAdapter.js'
import { SimulatorAdapter } from '../adapters/SimulatorAdapter.js'

// ── Adapter selection ─────────────────────────────────────────────────────

/**
 * Returns true when a Service Worker is registered *and* currently controlling
 * the page (i.e. the SW has already activated and claimed all clients).
 */
const isSwControlling = () =>
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  navigator.serviceWorker.controller !== null

/**
 * Pick and instantiate the appropriate adapter.
 *
 * The selection happens once at module load-time.  If the SW is not yet
 * controlling the page (e.g. first-ever load), SimulatorAdapter is used so
 * the UI is immediately functional.  On subsequent loads the SW is in control
 * and NetworkAdapter is used.
 */
const createAdapter = () => {
  if (isSwControlling()) {
    console.info('[DeviceClient] Using NetworkAdapter (Service Worker active).')
    return new NetworkAdapter()
  }
  console.info('[DeviceClient] Using SimulatorAdapter (Service Worker not in control).')
  return new SimulatorAdapter()
}

const adapter = createAdapter()

// ── Logging helper ────────────────────────────────────────────────────────

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[DeviceClient] ${direction} ${action}`, payload)
}

// ── Shared connection state (reactive, exported for UI use) ───────────────
export const isConnected = ref(false)
export const isLoading   = ref(false)

// ── Composable ────────────────────────────────────────────────────────────

export const useDeviceClient = () => {

  /**
   * Fetch current values for the provided list of parameter IDs.
   *
   * @param {string[]} ids
   * @returns {Promise<
   *   { ok: true,  values: Record<string, unknown> } |
   *   { ok: false, message: string }
   * >}
   */
  const getParameters = async (ids) => {
    isLoading.value = true
    try {
      logDeviceTraffic('->', 'getParameters', ids)
      const result = await adapter.getParameters(ids)
      if (result.ok) {
        isConnected.value = true
        logDeviceTraffic('<-', 'getParameters', result.values)
        return { ok: true, values: result.values }
      } else {
        isConnected.value = false
        const message = result.error?.message ?? 'Errore di comunicazione con il dispositivo.'
        logDeviceTraffic('<-', 'getParameters [ERROR]', message)
        return { ok: false, message }
      }
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
   * Apply a map of parameter updates to the apparatus.
   *
   * @param {Record<string, unknown>} params  – { [parameterId]: newValue }
   * @returns {Promise<{ ok: true } | { ok: false, message: string }>}
   */
  const setParameters = async (params) => {
    try {
      logDeviceTraffic('->', 'setParameters', params)
      const result = await adapter.setParameters(params)
      if (result.ok) {
        logDeviceTraffic('<-', 'setParameters OK', result)
        return { ok: true }
      } else {
        const message = result.error?.message ?? 'Errore scrittura parametri.'
        logDeviceTraffic('<-', 'setParameters [ERROR]', message)
        return { ok: false, message }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore di comunicazione con il dispositivo.'
      logDeviceTraffic('<-', 'setParameters [ERROR]', message)
      return { ok: false, message }
    }
  }

  /**
   * Execute a named command on the apparatus.
   *
   * Commands are discrete apparatus-level actions (e.g. RESET_ALARMS, GPS_RESET,
   * REBOOT) that are distinct from simple parameter writes.
   *
   * @param {string} commandId               – identifier of the command to execute
   * @param {Record<string, unknown>} [params={}] – command-specific input parameters
   * @returns {Promise<
   *   { ok: true,  result?: unknown } |
   *   { ok: false, message: string, code?: string }
   * >}
   */
  const sendCommand = async (commandId, params = {}) => {
    try {
      logDeviceTraffic('->', 'sendCommand', { commandId, params })
      const result = await adapter.sendCommand(commandId, params)
      if (result.ok) {
        logDeviceTraffic('<-', 'sendCommand OK', { commandId, result: result.result })
        return { ok: true, result: result.result }
      } else {
        const { code, message } = result.error ?? {}
        const msg = message ?? `Comando "${commandId}" fallito.`
        logDeviceTraffic('<-', 'sendCommand [ERROR]', { commandId, code, message: msg })
        return { ok: false, message: msg, code: code ?? 'COMMAND_FAILED' }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `Errore imprevisto durante il comando "${commandId}".`
      logDeviceTraffic('<-', 'sendCommand [ERROR]', { commandId, message })
      return { ok: false, message, code: 'NETWORK_ERROR' }
    }
  }

  /**
   * Subscribe to asynchronous apparatus push notifications.
   * Only changed fields are included in each `updates` call.
   *
   * @param {(updates: Record<string, unknown>) => void} callback
   * @returns {() => void} Unsubscribe function.
   */
  const notifyParameters = (callback) => {
    return adapter.onNotification((updates) => {
      logDeviceTraffic('<-', 'notification', updates)
      callback(updates)
    })
  }

  return { getParameters, setParameters, sendCommand, notifyParameters, isConnected, isLoading }
}
