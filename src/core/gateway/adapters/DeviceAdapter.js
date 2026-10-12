/**
 * DeviceAdapter.js
 *
 * Abstract base class for apparatus communication adapters.
 * All adapters must implement the five methods defined here.
 *
 * Concrete implementations:
 *   NetworkAdapter – communicates via HTTP fetch (intercept-able by a Service Worker)
 */

// ── Error codes ───────────────────────────────────────────────────────────

/**
 * Enumeration of well-known error codes returned by adapter methods.
 * @enum {string}
 */
export const ErrorCode = Object.freeze({
  NOT_FOUND:        'NOT_FOUND',        // unknown parameter ID or command ID
  PERMISSION_DENIED:'PERMISSION_DENIED',// operation not allowed (e.g. read-only param, not logged in)
  INVALID_PARAMS:   'INVALID_PARAMS',   // bad input (wrong type, out-of-range, missing required field)
  DEVICE_BUSY:      'DEVICE_BUSY',      // apparatus is temporarily unavailable
  NETWORK_ERROR:    'NETWORK_ERROR',    // transport-level failure (timeout, connection refused, …)
  COMMAND_FAILED:   'COMMAND_FAILED',   // command was received but execution failed on the apparatus
})

/**
 * Structured error returned by adapter methods when `ok` is false.
 */
export class DeviceError extends Error {
  /**
   * @param {string} code      – one of ErrorCode
  * @param {string} message   – human-readable description (for display)
   * @param {unknown} [details] – optional raw cause (response body, original Error, …)
   */
  constructor(code, message, details) {
    super(message)
    this.name = 'DeviceError'
    /** @type {string} */
    this.code = code
    /** @type {unknown|undefined} */
    this.details = details
  }
}

// ── Abstract base class ───────────────────────────────────────────────────

/**
 * Abstract adapter that defines the contract between the app and an apparatus.
 *
 * Every method returns a discriminated union:
 *   { ok: true,  ... }            on success
 *   { ok: false, error: DeviceError } on failure
 *
 * Subclasses must override all five methods.
 */
export class DeviceAdapter {
  /**
   * Fetch the current values for the given parameter IDs from the apparatus.
   *
   * @param {string[]} ids
   * @returns {Promise<
   *   { ok: true,  values: Record<string, unknown> } |
   *   { ok: false, error: DeviceError }
   * >}
   */
  // eslint-disable-next-line no-unused-vars
  async getParameters(ids) {
    throw new Error('DeviceAdapter.getParameters() must be implemented by subclass.')
  }

  /**
   * Apply a map of parameter updates to the apparatus.
   *
   * @param {Record<string, unknown>} updates  – { [parameterId]: newValue }
   * @returns {Promise<
   *   { ok: true } |
   *   { ok: false, error: DeviceError }
   * >}
   */
  // eslint-disable-next-line no-unused-vars
  async setParameters(updates) {
    throw new Error('DeviceAdapter.setParameters() must be implemented by subclass.')
  }

  /**
   * Send a named command to the apparatus with optional input parameters.
   *
   * Commands are discrete actions (e.g. RESET_ALARMS, GPS_RESET, REBOOT)
   * that are distinct from parameter writes.
   *
   * @param {string} commandId          – identifier of the command to execute
   * @param {Record<string, unknown>} [params] – command-specific input (may be empty)
   * @returns {Promise<
   *   { ok: true,  result?: unknown } |
   *   { ok: false, error: DeviceError }
   * >}
   */
  // eslint-disable-next-line no-unused-vars
  async sendCommand(commandId, params = {}) {
    throw new Error('DeviceAdapter.sendCommand() must be implemented by subclass.')
  }

  /**
   * Subscribe to asynchronous parameter change notifications from the apparatus.
   * The callback receives only the fields that changed since the last notification.
   *
   * @param {(updates: Record<string, unknown>) => void} callback
   * @returns {() => void} Unsubscribe function – call it to stop receiving notifications.
   */
  // eslint-disable-next-line no-unused-vars
  onNotification(callback) {
    throw new Error('DeviceAdapter.onNotification() must be implemented by subclass.')
  }

  /**
   * Release all resources held by the adapter (timers, open connections, …).
   * After calling dispose() the adapter instance must not be used again.
   */
  dispose() {
    throw new Error('DeviceAdapter.dispose() must be implemented by subclass.')
  }
}
