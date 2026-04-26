import { computed, ref } from 'vue'
import { useMenuNavigation } from './useMenuNavigation.js'

const PRIORITY_ORDER = { ERROR: 0, WARNING: 1, SUCCESS: 2, NORMAL: 3 }
const NOTIFICATION_TIMEOUT_DEFAULT_MS = 5000
const DISPLAY_MODE_TIMEOUT = 'TIMEOUT'
const DISPLAY_MODE_ACKNOWLEDGED = 'ACKNOWLEDGED'

export const useNotificationBar = () => {
  const { currentPage } = useMenuNavigation()

  const messageQueue = ref([]) // messages waiting to be displayed
  const activeMessage = ref(null) // currently displayed message
  let dismissTimerId = null

  const notification = computed(() =>
    activeMessage.value
      ? { status: activeMessage.value.status, message: activeMessage.value.message }
      : { status: 'NORMAL', message: currentPage.value?.label ?? '' },
  )

  const pendingCount = computed(() => messageQueue.value.length)

  const notificationBarClasses = computed(() => [
    `notification-bar--${notification.value.status.toLowerCase()}`,
  ])

  const clearDismissTimer = () => {
    if (dismissTimerId === null) return
    window.clearTimeout(dismissTimerId)
    dismissTimerId = null
  }

  const getHighestPriorityIndex = () => {
    let bestIdx = -1
    let bestPriority = Infinity
    messageQueue.value.forEach((msg, idx) => {
      const p = PRIORITY_ORDER[msg.status] ?? 4
      if (p < bestPriority) {
        bestPriority = p
        bestIdx = idx
      }
    })
    return bestIdx
  }

  const showNext = () => {
    clearDismissTimer()
    const idx = getHighestPriorityIndex()
    if (idx === -1) {
      activeMessage.value = null
      return
    }
    const [next] = messageQueue.value.splice(idx, 1)
    activeMessage.value = next
    if (next.displayMode !== DISPLAY_MODE_ACKNOWLEDGED) {
      dismissTimerId = window.setTimeout(() => {
        dismissTimerId = null
        activeMessage.value = null
        showNext()
      }, next.timeoutMs)
    }
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
    messageQueue.value.push(newMsg)

    if (!activeMessage.value) {
      showNext()
      return
    }

    const newPriority = PRIORITY_ORDER[status] ?? 4
    const activePriority = PRIORITY_ORDER[activeMessage.value.status] ?? 4
    if (newPriority < activePriority) {
      // Higher priority: preempt current, re-queue it, show new
      clearDismissTimer()
      messageQueue.value.push(activeMessage.value)
      activeMessage.value = null
      showNext()
    }
  }

  const handleNotificationTap = () => {
    if (!activeMessage.value) return
    clearDismissTimer()
    activeMessage.value = null
    showNext()
  }

  const disposeNotificationBar = () => {
    clearDismissTimer()
  }

  return {
    notification,
    pendingCount,
    notificationBarClasses,
    setNotification,
    handleNotificationTap,
    disposeNotificationBar,
  }
}

