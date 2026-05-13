import { useRef, useReducer } from 'react'

const PRIORITY_ORDER = { ERROR: 0, WARNING: 1, SUCCESS: 2, NORMAL: 3, MENU: 4 }
const NOTIFICATION_TIMEOUT_DEFAULT_MS = 5000
const DISPLAY_MODE_TIMEOUT = 'TIMEOUT'
const DISPLAY_MODE_ACKNOWLEDGED = 'ACKNOWLEDGED'

export const useNotificationBar = ({ menuMessage } = {}) => {
  // Use refs for mutable state accessed in timer callbacks (avoids stale closures)
  const queueRef = useRef([])
  const activeRef = useRef(null)
  const timerRef = useRef(null)

  // Trigger re-renders by incrementing a counter
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const clearDismissTimer = () => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const getHighestPriorityIndex = () => {
    let bestIdx = -1
    let bestPriority = Infinity
    queueRef.current.forEach((msg, idx) => {
      const p = PRIORITY_ORDER[msg.status] ?? 4
      if (p < bestPriority) { bestPriority = p; bestIdx = idx }
    })
    return bestIdx
  }

  const showNext = () => {
    clearDismissTimer()
    const idx = getHighestPriorityIndex()
    if (idx === -1) {
      activeRef.current = null
      forceUpdate()
      return
    }
    const [next] = queueRef.current.splice(idx, 1)
    activeRef.current = next
    if (next.displayMode !== DISPLAY_MODE_ACKNOWLEDGED) {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        activeRef.current = null
        showNext()
      }, next.timeoutMs)
    }
    forceUpdate()
  }

  const setNotification = (status, message, options = {}) => {
    const normalizedMode =
      typeof options.displayMode === 'string' ? options.displayMode.trim().toUpperCase() : ''
    const displayMode =
      normalizedMode === DISPLAY_MODE_ACKNOWLEDGED ? DISPLAY_MODE_ACKNOWLEDGED : DISPLAY_MODE_TIMEOUT
    const timeoutMs =
      Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
        ? options.timeoutMs
        : NOTIFICATION_TIMEOUT_DEFAULT_MS

    const newMsg = { status, message, displayMode, timeoutMs }
    queueRef.current.push(newMsg)

    if (!activeRef.current) {
      showNext()
      return
    }

    const newPriority = PRIORITY_ORDER[status] ?? 4
    const activePriority = PRIORITY_ORDER[activeRef.current.status] ?? 4
    if (newPriority < activePriority) {
      clearDismissTimer()
      queueRef.current.push(activeRef.current)
      activeRef.current = null
      showNext()
    }
  }

  const handleNotificationTap = () => {
    if (!activeRef.current) return
    clearDismissTimer()
    activeRef.current = null
    showNext()
  }

  const disposeNotificationBar = () => {
    clearDismissTimer()
  }

  const active = activeRef.current
  const notification = active
    ? { status: active.status, message: active.message }
    : {
        status: 'MENU',
        message: typeof menuMessage === 'string' ? menuMessage : '',
      }

  const pendingCount = queueRef.current.length

  const notificationBarClasses = [`notification-bar--${notification.status.toLowerCase()}`]

  return {
    notification,
    pendingCount,
    notificationBarClasses,
    setNotification,
    handleNotificationTap,
    disposeNotificationBar,
  }
}
