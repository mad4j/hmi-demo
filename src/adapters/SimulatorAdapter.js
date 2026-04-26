/**
 * SimulatorAdapter.js
 *
 * Fallback adapter that drives the apparatus simulation directly in the main thread,
 * without any network requests. Used when the Service Worker is not available
 * (e.g. during initial load before SW activation, Safari private mode, file:// origin).
 *
 * Wraps the functions exported by deviceSimulator.js and conforms to the DeviceAdapter
 * contract so that the rest of the application is unaware of which adapter is active.
 */

import { DeviceAdapter, DeviceError, ErrorCode } from './DeviceAdapter.js'
import {
  simulateGetParameters,
  simulateSetParameters,
  subscribeToParameterNotifications,
} from '../composables/deviceSimulator.js'

// ── Known commands handled by the direct simulator ───────────────────────

const COMMAND_HANDLERS = {
  /**
   * Reset all boolean alarm parameters to false.
   * @param {Record<string,unknown>} _params ignored
   * @returns {{ ok: true }}
   */
  RESET_ALARMS: async (_params) => {
    const alarmIds = [
      'allarme_batteria',
      'allarme_temp_motore',
      'allarme_pressione',
      'allarme_olio',
      'allarme_abs',
      'allarme_airbag',
      'allarme_carburante',
    ]
    const updates = Object.fromEntries(alarmIds.map((id) => [id, false]))
    return simulateSetParameters(updates)
  },

  /**
   * Reset GPS mode to AUTO and clear any override.
   */
  GPS_RESET: async (_params) => {
    return simulateSetParameters({ gps_modalita: 'AUTO' })
  },

  /**
   * Simulate a soft reboot: reset uptime to 0.
   */
  REBOOT: async (_params) => {
    return simulateSetParameters({ uptime: 0 })
  },
}

// ── Adapter implementation ────────────────────────────────────────────────

export class SimulatorAdapter extends DeviceAdapter {
  constructor() {
    super()
    /** @type {Set<() => void>} */
    this._unsubscribers = new Set()
  }

  /** @override */
  async getParameters(ids) {
    try {
      const result = await simulateGetParameters(ids)
      if (result.ok) return result
      return {
        ok: false,
        error: new DeviceError(ErrorCode.DEVICE_BUSY, result.message ?? 'Errore lettura parametri.'),
      }
    } catch (err) {
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.NETWORK_ERROR,
          'Errore interno del simulatore durante la lettura.',
          err,
        ),
      }
    }
  }

  /** @override */
  async setParameters(updates) {
    try {
      const result = await simulateSetParameters(updates)
      if (result.ok) return { ok: true }
      return {
        ok: false,
        error: new DeviceError(ErrorCode.DEVICE_BUSY, result.message ?? 'Errore scrittura parametri.'),
      }
    } catch (err) {
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.NETWORK_ERROR,
          'Errore interno del simulatore durante la scrittura.',
          err,
        ),
      }
    }
  }

  /** @override */
  async sendCommand(commandId, params = {}) {
    const handler = COMMAND_HANDLERS[commandId]
    if (!handler) {
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.NOT_FOUND,
          `Comando sconosciuto: "${commandId}". Comandi disponibili: ${Object.keys(COMMAND_HANDLERS).join(', ')}.`,
        ),
      }
    }
    try {
      const result = await handler(params)
      if (result.ok) return { ok: true }
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.COMMAND_FAILED,
          result.message ?? `Esecuzione del comando "${commandId}" fallita.`,
        ),
      }
    } catch (err) {
      return {
        ok: false,
        error: new DeviceError(
          ErrorCode.COMMAND_FAILED,
          `Errore imprevisto durante l'esecuzione del comando "${commandId}".`,
          err,
        ),
      }
    }
  }

  /** @override */
  onNotification(callback) {
    const unsubscribe = subscribeToParameterNotifications(callback)
    this._unsubscribers.add(unsubscribe)
    return () => {
      unsubscribe()
      this._unsubscribers.delete(unsubscribe)
    }
  }

  /** @override */
  dispose() {
    this._unsubscribers.forEach((unsub) => unsub())
    this._unsubscribers.clear()
  }
}
