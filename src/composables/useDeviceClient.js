/**
 * useDeviceClient.js
 *
 * Central async communication module for apparatus remote control.
 * All interactions with the apparatus – configuration commands, state
 * requests and server-push notifications – are routed exclusively
 * through this module.
 *
 * In production this would wrap a real REST/WebSocket transport.
 * Here every operation is simulated with artificial latency so that
 * the rest of the application code is structured exactly as it would
 * be against a real server.
 */

import { ref } from 'vue'
import {
  fetchSimulatedState,
  sendSimulatedCommand,
  subscribeToSimulatedNotifications,
} from './deviceSimulator.js'

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[DeviceClient] ${direction} ${action}`, payload)
}

// ── Shared connection state (reactive, exported for UI use) ───────────────
export const isConnected = ref(false)
export const isLoading = ref(false)

// ── Composable ────────────────────────────────────────────────────────────
export const useDeviceClient = () => {
  /**
   * GET /api/state
   * Fetches the complete current state from the apparatus.
   * Returns a shallow copy so the caller cannot accidentally mutate server state.
   */
  const fetchState = async () => {
    isLoading.value = true
    try {
      logDeviceTraffic('->', 'fetchState', null)
      const stateSnapshot = await fetchSimulatedState()
      isConnected.value = true
      logDeviceTraffic('<-', 'fetchState', stateSnapshot)
      return stateSnapshot
    } finally {
      isLoading.value = false
    }
  }

  /**
   * POST /api/parameter
   * Sends a configuration command to the apparatus.
   * The apparatus applies the change and confirms with { ok, id, value }.
   */
  const sendCommand = async (id, value) => {
    logDeviceTraffic('->', 'sendCommand', { id, value })
    const response = await sendSimulatedCommand(id, value)
    logDeviceTraffic('<-', 'sendCommand', response)
    return response
  }

  /**
   * Subscribe to apparatus notifications (server-push simulation).
   * @param {(updates: Record<string, unknown>) => void} callback
   *   Called whenever the apparatus broadcasts a state update.
   *   Only the changed fields are included in `updates`.
   * @returns {() => void} Unsubscribe function.
   */
  const subscribe = (callback) => {
    return subscribeToSimulatedNotifications((updates) => {
      logDeviceTraffic('<-', 'notification', updates)
      callback(updates)
    })
  }

  return { fetchState, sendCommand, subscribe, isConnected, isLoading }
}
