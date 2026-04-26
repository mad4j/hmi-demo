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
 * The default path is always NetworkAdapter so that a real backend exposing
 * the same `/api/*` contract works without app code customizations.
 *
 * Optional adapter modes via env vars:
 *
 *   VITE_DEVICE_ADAPTER_MODE=network-auto      (default)
 *     -> use NetworkAdapter with optional base URL
 *
 *   VITE_DEVICE_ADAPTER_MODE=simulator-direct
 *     -> force direct in-process simulator (SimulatorAdapter)
 *
 * Optional API base URL:
 *
 *   VITE_DEVICE_API_BASE_URL=http://host:port
 *
 * If omitted, same-origin `/api/*` is used.
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
import { NetworkAdapter } from '../adapters/NetworkAdapter.js'
import { SimulatorAdapter } from '../adapters/SimulatorAdapter.js'

// ── Adapter selection ─────────────────────────────────────────────────────

const ADAPTER_MODE = String(import.meta.env.VITE_DEVICE_ADAPTER_MODE ?? 'network-auto').toLowerCase()
const API_BASE_URL = String(import.meta.env.VITE_DEVICE_API_BASE_URL ?? '').trim()

/**
 * Pick and instantiate the appropriate adapter.
 */
const createAdapter = () => {
  if (ADAPTER_MODE === 'simulator-direct') {
    console.info('[DeviceClient] Using SimulatorAdapter (forced by VITE_DEVICE_ADAPTER_MODE).')
    return new SimulatorAdapter()
  }

  if (ADAPTER_MODE !== 'network-auto') {
    console.warn(
      `[DeviceClient] Unknown VITE_DEVICE_ADAPTER_MODE="${ADAPTER_MODE}", falling back to network-auto.`,
    )
  }

  console.info(
    `[DeviceClient] Using NetworkAdapter (base URL: ${API_BASE_URL || 'same-origin'}).`,
  )
  return new NetworkAdapter(API_BASE_URL)
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
