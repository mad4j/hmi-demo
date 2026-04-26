export class SseNotificationTransport {
  /**
   * @param {{
   *   url: string,
   *   emitUpdates: (updates: Record<string, unknown>) => void,
   * }} options
   */
  constructor(options) {
    this._url = options.url
    this._emitUpdates = options.emitUpdates
    /** @type {EventSource|null} */
    this._source = null
  }

  static isSupported() {
    return typeof EventSource !== 'undefined'
  }

  start() {
    if (this._source) return
    const source = new EventSource(this._url)
    this._source = source

    source.onmessage = (event) => {
      if (!event?.data) return
      try {
        const updates = JSON.parse(event.data)
        this._emitUpdates(updates)
      } catch {
        // Ignore malformed event payloads.
      }
    }

    source.onerror = () => {
      // Keep default EventSource auto-reconnect behavior.
    }
  }

  stop() {
    if (!this._source) return
    this._source.close()
    this._source = null
  }
}
