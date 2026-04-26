/**
 * simulatorWorker.js
 *
 * Web Worker che ospita il simulatore dell'apparato remoto.
 * Gira in un thread separato rispetto all'applicazione Vue e
 * comunica con essa tramite postMessage, replicando la semantica
 * di un server HTTP + push notification.
 *
 * Messaggi in ingresso (main → worker):
 *   { type: 'GET_PARAMETERS', id: <number>, payload: { ids: string[] } }
 *   { type: 'SET_PARAMETERS', id: <number>, payload: { params: Record<string,unknown> } }
 *
 * Messaggi in uscita (worker → main):
 *   { type: 'RESPONSE',     id: <number>, result: <esito operazione> }
 *   { type: 'NOTIFICATION', updates: Record<string,unknown> }
 */

import {
  simulateGetParameters,
  simulateSetParameters,
  subscribeToParameterNotifications,
} from '../composables/deviceSimulator.js'

// Inoltra le notifiche push al thread principale
subscribeToParameterNotifications((updates) => {
  self.postMessage({ type: 'NOTIFICATION', updates })
})

self.onmessage = async (event) => {
  const { type, id, payload } = event.data

  if (type === 'GET_PARAMETERS') {
    const result = await simulateGetParameters(payload.ids)
    self.postMessage({ type: 'RESPONSE', id, result })
  } else if (type === 'SET_PARAMETERS') {
    const result = await simulateSetParameters(payload.params)
    self.postMessage({ type: 'RESPONSE', id, result })
  }
}
