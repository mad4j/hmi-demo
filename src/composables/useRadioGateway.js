import { NetworkAdapter } from '../adapters/NetworkAdapter.js'

const API_BASE_URL = "http://localhost:5224"

const NOTIFICATION_TRANSPORT = String(
  import.meta.env.VITE_DEVICE_NOTIFICATION_TRANSPORT ?? 'text-tail',
).toLowerCase()

const NOTIFICATION_TEXT_URL = String(
  import.meta.env.VITE_DEVICE_NOTIFICATION_TEXT_URL ?? '/api/notifications/log.txt',
).trim()

const adapter = new NetworkAdapter(API_BASE_URL, {
  notificationTransport: NOTIFICATION_TRANSPORT,
  notificationTextUrl: NOTIFICATION_TEXT_URL,
})

const logDeviceTraffic = (direction, action, payload) => {
  console.info(`[RadioGateway] ${direction} ${action}`, payload)
}

let isConnected = false

export const useRadioGateway = () => {

  const getParameters = async (ids) => {
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
    }
  }

  const setParameters = async (params) => {
    try {
      logDeviceTraffic('->', 'setParameters', params)
      const result = await adapter.setParameters(params)
      if (result.ok) {
        isConnected = true
        logDeviceTraffic('<-', 'setParameters OK', result)
        return { ok: true, values: result.values }
      } else {
        isConnected = false
        const message = result.error?.message ?? 'Errore scrittura parametri.'
        logDeviceTraffic('<-', 'setParameters [ERROR]', message)
        return { ok: false, message }
      }
    } catch (err) {
      isConnected = false
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

  return {
    getParameters,
    setParameters,
    sendCommand,
    notifyParameters,
  }
}