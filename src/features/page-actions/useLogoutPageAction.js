import { useRef, useEffect } from 'react'

export const useLogoutPageAction = ({
  currentPage,
  parameterValues,
  setParameterValue,
  setNotification,
  goHome,
  goToPreviousPage,
  logoutPageId = 'logout',
  logoutPageGoOnApply = 'STAY_HERE',
  usernameParameterId = 'login_name',
  passwordParameterId = 'login_password',
}) => {
  const logoutInProgressRef = useRef(false)

  const applyLogoutNavigation = () => {
    if (logoutPageGoOnApply === 'GO_HOME') { goHome(); return }
    if (logoutPageGoOnApply === 'GO_BACK' || logoutPageGoOnApply === 'STAY_HERE') {
      goToPreviousPage()
    }
  }

  useEffect(() => {
    const pageId = currentPage?.id
    if (pageId !== logoutPageId || logoutInProgressRef.current) return

    const wasLoggedIn = parameterValues.status_login === 'ok'
    logoutInProgressRef.current = true
    setNotification('WARNING', 'Logging out...')

    ;(async () => {
      try {
        const nameResult = await setParameterValue(usernameParameterId, '')
        const passwordResult = await setParameterValue(passwordParameterId, '')

        if (!nameResult.ok || !passwordResult.ok) {
          const msg = (!nameResult.ok ? nameResult.message : passwordResult.message)
            ?? 'Logout error: command not applied.'
          setNotification('ERROR', msg, { displayMode: 'ACKNOWLEDGED' })
        } else if (wasLoggedIn) {
          setNotification('SUCCESS', 'Logout completed successfully.')
        } else {
          setNotification('WARNING', 'No active session: user already logged out.')
        }
        applyLogoutNavigation()
      } finally {
        logoutInProgressRef.current = false
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage?.id])

  return { logoutInProgress: logoutInProgressRef.current }
}
