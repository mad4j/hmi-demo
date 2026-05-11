/**
 * useEquipmentGateway.js
 *
 * Central async communication module for apparatus remote control.
 * All interactions with the apparatus – parameter reads, parameter writes,
 * named commands and server-push notifications – are routed exclusively
 * through this module.
 */

import { useDispatch } from 'react-redux'
import { setConnected, setLoading } from '../store/connectionSlice.js'
import { setParameterValues } from '../store/parametersSlice.js'
import { NetworkAdapter } from '../adapters/NetworkAdapter.js'

// ── Adapter selection ─────────────────────────────────────────────────────

const API_BASE_URL = String(import.meta.env.VITE_DEVICE_API_BASE_URL ?? '').trim()
const NOTIFICATION_TRANSPORT = String(
  import.meta.env.VITE_DEVICE_NOTIFICATION_TRANSPORT ?? 'text-tail',
).toLowerCase()
const NOTIFICATION_TEXT_URL = String(
  import.meta.env.VITE_DEVICE_NOTIFICATION_TEXT_URL ?? '/api/notifications/log.txt',
).trim()

const createAdapter = () => {
  console.info(
    `[EquipmentGateway] Using NetworkAdapter (base URL: ${API_BASE_URL || 'same-origin'}).`,
  )
  return new NetworkAdapter(API_BASE_URL, {
    notificationTransport: NOTIFICATION_TRANSPORT,
    notificationTextUrl: NOTIFICATION_TEXT_URL,
  })
}

// Singleton adapter
let adapter = null
let notificationUnsubscribe = null

const getAdapter = () => {
  if (!adapter) {
    adapter = createAdapter()
  }
  return adapter
}

// ── Logging helper ────────────────────────────────────────────────────────

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[EquipmentGateway] ${direction} ${action}`, payload)
}

// ── Equipment gateway functions ───────────────────────────────────────────

export const getParameters = async (ids) => {
  const adapter = getAdapter()
  try {
    logDeviceTraffic('->', 'getParameters', ids)
    const result = await adapter.getParameters(ids)
    if (result.ok) {
      logDeviceTraffic('<-', 'getParameters', result.values)
      return { ok: true, values: result.values }
    } else {
      const message = result.error?.message ?? 'Errore di comunicazione con il dispositivo.'
      logDeviceTraffic('<-', 'getParameters [ERROR]', message)
      return { ok: false, message }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore di comunicazione con il dispositivo.'
    logDeviceTraffic('<-', 'getParameters [ERROR]', message)
    return { ok: false, message }
  }
}

export const setParameters = async (params) => {
  const adapter = getAdapter()
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

export const sendCommand = async (commandId, params = {}) => {
  const adapter = getAdapter()
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

// Initialize notification subscription
let notificationInitialized = false

export const initializeNotifications = (dispatch) => {
  if (notificationInitialized) return

  const adapter = getAdapter()
  
  notificationUnsubscribe = adapter.onNotification((updates) => {
    logDeviceTraffic('<-', 'notification', updates)
    dispatch(setParameterValues(updates))
  })

  notificationInitialized = true
}

export const useEquipmentGateway = () => {
  const dispatch = useDispatch()

  return {
    getParameters,
    setParameters,
    sendCommand,
    initializeNotifications: () => initializeNotifications(dispatch),
  }
}