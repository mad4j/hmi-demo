import { computed, ref } from 'vue'

const NOTIFICATION_AUTO_COLLAPSE_MS = 6000
const NOTIFICATION_HISTORY_LIMIT = 6
const NOTIFICATION_TIMEOUT_DEFAULT_MS = 5000
const DISPLAY_MODE_TIMEOUT = 'TIMEOUT'
const DISPLAY_MODE_ACKNOWLEDGED = 'ACKNOWLEDGED'
const DEFAULT_NOTIFICATION = {
  status: 'NORMAL',
  message: '',
}
const INITIAL_NOTIFICATION = {
  status: 'NORMAL',
  message: 'Sistema pronto.',
}

export const useNotificationBar = () => {
  const notification = ref({ ...INITIAL_NOTIFICATION })
  const notificationHistory = ref([])
  const isNotificationExpanded = ref(false)
  const requiresAcknowledgement = ref(false)
  let notificationCollapseTimerId = null
  let notificationDismissTimerId = null

  const notificationBarClasses = computed(() => [
    `notification-bar--${notification.value.status.toLowerCase()}`,
    { 'notification-bar--expanded': isNotificationExpanded.value },
  ])

  const notificationHistoryTitle = computed(() => {
    if (!notificationHistory.value.length) return ''
    return notificationHistory.value
      .map(({ status, message }) => `[${status}] ${message}`)
      .join('\n')
  })

  const clearNotificationCollapseTimer = () => {
    if (notificationCollapseTimerId === null) return
    window.clearTimeout(notificationCollapseTimerId)
    notificationCollapseTimerId = null
  }

  const clearNotificationDismissTimer = () => {
    if (notificationDismissTimerId === null) return
    window.clearTimeout(notificationDismissTimerId)
    notificationDismissTimerId = null
  }

  const scheduleNotificationCollapse = () => {
    clearNotificationCollapseTimer()
    notificationCollapseTimerId = window.setTimeout(() => {
      isNotificationExpanded.value = false
      notificationCollapseTimerId = null
    }, NOTIFICATION_AUTO_COLLAPSE_MS)
  }

  const dismissActiveNotification = () => {
    clearNotificationDismissTimer()
    requiresAcknowledgement.value = false
    notification.value = { ...DEFAULT_NOTIFICATION }
    isNotificationExpanded.value = false
    clearNotificationCollapseTimer()
  }

  const scheduleNotificationDismiss = (timeoutMs) => {
    clearNotificationDismissTimer()
    notificationDismissTimerId = window.setTimeout(() => {
      dismissActiveNotification()
      notificationDismissTimerId = null
    }, timeoutMs)
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

    notificationHistory.value = [
      { status, message, createdAt: Date.now() },
      ...notificationHistory.value,
    ].slice(0, NOTIFICATION_HISTORY_LIMIT)
    notification.value = { status, message }
    isNotificationExpanded.value = false
    clearNotificationCollapseTimer()
    clearNotificationDismissTimer()

    if (displayMode === DISPLAY_MODE_ACKNOWLEDGED) {
      requiresAcknowledgement.value = true
      return
    }

    requiresAcknowledgement.value = false
    scheduleNotificationDismiss(timeoutMs)
  }

  const toggleNotificationExpanded = () => {
    isNotificationExpanded.value = !isNotificationExpanded.value
    if (isNotificationExpanded.value) {
      scheduleNotificationCollapse()
      return
    }
    clearNotificationCollapseTimer()
  }

  const handleNotificationTap = () => {
    if (requiresAcknowledgement.value) {
      dismissActiveNotification()
      return
    }
    toggleNotificationExpanded()
  }

  const disposeNotificationBar = () => {
    clearNotificationCollapseTimer()
    clearNotificationDismissTimer()
  }

  scheduleNotificationDismiss(NOTIFICATION_TIMEOUT_DEFAULT_MS)

  return {
    notification,
    notificationHistory,
    isNotificationExpanded,
    notificationBarClasses,
    notificationHistoryTitle,
    setNotification,
    handleNotificationTap,
    toggleNotificationExpanded,
    disposeNotificationBar,
  }
}
