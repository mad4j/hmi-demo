import { computed, ref } from 'vue'

const NOTIFICATION_AUTO_COLLAPSE_MS = 6000
const NOTIFICATION_HISTORY_LIMIT = 6

export const useNotificationBar = () => {
  const notification = ref({
    status: 'NORMAL',
    message: 'Sistema pronto.',
  })
  const notificationHistory = ref([])
  const isNotificationExpanded = ref(false)
  let notificationCollapseTimerId = null

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

  const scheduleNotificationCollapse = () => {
    clearNotificationCollapseTimer()
    notificationCollapseTimerId = window.setTimeout(() => {
      isNotificationExpanded.value = false
      notificationCollapseTimerId = null
    }, NOTIFICATION_AUTO_COLLAPSE_MS)
  }

  const setNotification = (status, message) => {
    notificationHistory.value = [
      { status, message, createdAt: Date.now() },
      ...notificationHistory.value,
    ].slice(0, NOTIFICATION_HISTORY_LIMIT)
    notification.value = { status, message }
    isNotificationExpanded.value = false
    clearNotificationCollapseTimer()
  }

  const toggleNotificationExpanded = () => {
    isNotificationExpanded.value = !isNotificationExpanded.value
    if (isNotificationExpanded.value) {
      scheduleNotificationCollapse()
      return
    }
    clearNotificationCollapseTimer()
  }

  const disposeNotificationBar = () => {
    clearNotificationCollapseTimer()
  }

  return {
    notification,
    notificationHistory,
    isNotificationExpanded,
    notificationBarClasses,
    notificationHistoryTitle,
    setNotification,
    toggleNotificationExpanded,
    disposeNotificationBar,
  }
}
