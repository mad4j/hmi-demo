export class PollNotificationTransport {
  /**
   * @param {{
   *   intervalMs: number,
   *   poll: () => Promise<void>,
   * }} options
   */
  constructor(options) {
    this._intervalMs = options.intervalMs
    this._poll = options.poll
    /** @type {number|null} */
    this._timerId = null
  }

  start() {
    if (this._timerId !== null) return
    this._timerId = setInterval(() => {
      this._poll()
    }, this._intervalMs)
  }

  stop() {
    if (this._timerId === null) return
    clearInterval(this._timerId)
    this._timerId = null
  }
}
