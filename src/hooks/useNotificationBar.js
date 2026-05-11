import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useRef, useEffect } from 'react'
import { setNotification as setNotificationAction, clearNotification } from '../store/notificationSlice.js'

const NOTIFICATION_TIMEOUT_DEFAULT_MS = 5000

export const useNotificationBar = ({ menuMessage } = {}) => {
  const dispatch = useDispatch()
  const notification = useSelector((state) => state.notification)
  const timeoutRef = useRef(null)

  const displayMessage = notification.message || (typeof menuMessage === 'string' ? menuMessage : '')
  const displayNotification = { status: notification.status, message: displayMessage }

  const notificationBarClasses = [`notification-bar--${(notification.status ?? 'normal').toLowerCase()}`]

  const setNotification = useCallback((status, message, options = {}) => {
    dispatch(setNotificationAction({ status, message, options }))

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (options.displayMode !== 'ACKNOWLEDGED') {
      const timeoutMs = options.timeoutMs ?? NOTIFICATION_TIMEOUT_DEFAULT_MS
      timeoutRef.current = setTimeout(() => {
        dispatch(clearNotification())
      }, timeoutMs)
    }
  }, [dispatch])

  const handleNotificationTap = useCallback(() => {
    if (notification.status !== 'MENU' && notification.status !== 'NORMAL') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      dispatch(clearNotification())
    }
  }, [dispatch, notification.status])

  const disposeNotificationBar = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  return {
    notification: displayNotification,
    notificationBarClasses,
    setNotification,
    handleNotificationTap,
    disposeNotificationBar,
  }
}
