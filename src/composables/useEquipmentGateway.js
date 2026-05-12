import { NetworkAdapter } from '../adapters/NetworkAdapter.js'

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

const adapter = createAdapter()

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[EquipmentGateway] ${direction} ${action}`, payload)
}

// Plain (non-reactive) connection state; no components render these directly.
export let isConnected = false
export let isLoading = false

export const useEquipmentGateway = () => {
  const getParameters = async (ids) => {
    isLoading = true
    try {
      logDeviceTraffic('->', 'getParameters', ids)
      const result = await adapter.getParameters(ids)
      if (result.ok) {
        isConnected = true
        logDeviceTraffic('<-', 'getParameters', result.values)
        return { ok: true, values: result.values }
      } else {
        isConnected = false
        const message = result.error?.message ?? 'Errore di comunicazione con il dispositivo.'
        logDeviceTraffic('<-', 'getParameters [ERROR]', message)
        return { ok: false, message }
      }
    } catch (err) {
      isConnected = false
      const message = err instanceof Error ? err.message : 'Errore di comunicazione con il dispositivo.'
      logDeviceTraffic('<-', 'getParameters [ERROR]', message)
      return { ok: false, message }
    } finally {
      isLoading = false
    }
  }

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

  const notifyParameters = (callback) => {
    return adapter.onNotification((updates) => {
      logDeviceTraffic('<-', 'notification', updates)
      callback(updates)
    })
  }

  return { getParameters, setParameters, sendCommand, notifyParameters, isConnected, isLoading }
}
