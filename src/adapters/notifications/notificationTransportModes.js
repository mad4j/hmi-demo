export const NotificationTransportMode = Object.freeze({
  POLL: 'poll',
  SSE: 'sse',
  TEXT_TAIL: 'text-tail',
})

/**
 * @param {unknown} value
 * @returns {'poll'|'sse'|'text-tail'}
 */
export const normalizeNotificationTransportMode = (value) => {
  const mode = String(value ?? NotificationTransportMode.POLL).trim().toLowerCase()
  if (mode === NotificationTransportMode.SSE) return NotificationTransportMode.SSE
  if (mode === NotificationTransportMode.TEXT_TAIL) return NotificationTransportMode.TEXT_TAIL
  return NotificationTransportMode.POLL
}
