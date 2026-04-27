const LOGIN_PAGE_ID = 'login'

export const createDefaultTransactionPagePolicies = ({
  refreshParameters,
  parameterValues,
  setNotification,
} = {}) => {
  const loginPolicy = {
    beforeSubmit: async () => {
      setNotification('NORMAL', 'Login attempt in progress...')
    },
    afterSubmitSuccess: async () => {
      // Keep status fresh before deciding final outcome.
      await refreshParameters(['status_login'])
      if (parameterValues.status_login === 'ok') {
        setNotification('SUCCESS', 'Login successful.')
        return { completedSuccessfully: true }
      }

      setNotification('ERROR', 'Login failed: invalid credentials.', {
        displayMode: 'ACKNOWLEDGED',
      })
      return { completedSuccessfully: false }
    },
  }

  return {
    [LOGIN_PAGE_ID]: loginPolicy,
  }
}
