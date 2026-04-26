export class TextTailNotificationTransport {
  /**
   * @param {{
   *   intervalMs: number,
   *   resolveUrl: () => string,
   *   fetchText: (url: string) => Promise<string|null>,
   *   emitUpdates: (updates: Record<string, unknown>) => void,
   * }} options
   */
  constructor(options) {
    this._intervalMs = options.intervalMs
    this._resolveUrl = options.resolveUrl
    this._fetchText = options.fetchText
    this._emitUpdates = options.emitUpdates
    /** @type {number|null} */
    this._timerId = null
    /** @type {number} */
    this._cursor = 0
    /** @type {boolean} */
    this._primed = false
  }

  start() {
    if (this._timerId !== null) return
    this._timerId = setInterval(() => {
      this._poll()
    }, this._intervalMs)
  }

  stop() {
    if (this._timerId !== null) {
      clearInterval(this._timerId)
      this._timerId = null
    }
    this._cursor = 0
    this._primed = false
  }

  async _poll() {
    try {
      const baseUrl = this._resolveUrl()
      const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_=${Date.now()}`
      const text = await this._fetchText(url)
      if (text === null) return

      if (text.length < this._cursor) {
        // Log rotation/reset: restart from beginning.
        this._cursor = 0
      }

      if (!this._primed) {
        // Start tailing from end-of-file, like `tail -f`.
        this._cursor = text.length
        this._primed = true
        return
      }

      if (text.length === this._cursor) return

      const delta = text.slice(this._cursor)
      this._cursor = text.length

      delta
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          try {
            const updates = JSON.parse(line)
            this._emitUpdates(updates)
          } catch {
            // Ignore malformed NDJSON lines.
          }
        })
    } catch {
      // Swallow text-tail transport errors silently.
    }
  }
}
