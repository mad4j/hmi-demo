import { useRef, useEffect, useCallback } from 'react'

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

  const applyLogoutNavigation = useCallback(() => {
    if (logoutPageGoOnApply === 'GO_HOME') {
      goHome()
      return
    }

    if (logoutPageGoOnApply === 'GO_BACK' || logoutPageGoOnApply === 'STAY_HERE') {
      goToPreviousPage()
    }
  }, [logoutPageGoOnApply, goHome, goToPreviousPage])

  useEffect(() => {
    const handleLogout = async () => {
      const pageId = currentPage?.id
      if (pageId !== logoutPageId || logoutInProgressRef.current) return

      const wasLoggedIn = parameterValues.status_login === 'ok'
      logoutInProgressRef.current = true
      setNotification('WARNING', 'Logging out...')

      try {
        // Always send both credentials reset commands: local values can already
        // be empty due to clearOnApply, while remote state may still be logged in.
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
    }

    handleLogout()
  }, [
    currentPage?.id,
    logoutPageId,
    parameterValues.status_login,
    setParameterValue,
    setNotification,
    usernameParameterId,
    passwordParameterId,
    applyLogoutNavigation
  ])

  return {
    logoutInProgress: logoutInProgressRef.current,
  }
}