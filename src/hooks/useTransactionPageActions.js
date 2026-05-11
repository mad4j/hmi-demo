import { useMemo, useCallback } from 'react'

const createDefaultTransactionPagePolicies = ({
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
    'login': loginPolicy,
  }
}

const applyTransactionGoOnApply = (page, { goHome, goToPreviousPage }) => {
  if (!page) return

  if (page.goOnApply === 'GO_HOME') {
    goHome()
    return
  }

  if (page.goOnApply === 'GO_BACK') {
    goToPreviousPage()
  }
}

export const useTransactionPageActions = ({
  currentPage,
  parameterValues,
  transactionStore,
  notifications,
  navigation,
  pagePolicies,
}) => {
  const resolvedPagePolicies = pagePolicies ?? createDefaultTransactionPagePolicies({
    refreshParameters: transactionStore.refreshParameters,
    parameterValues,
    setNotification: notifications.setNotification,
  })

  const isTransactionPage = useMemo(() => currentPage?.mode === 'transaction', [currentPage])

  const currentPageValues = useMemo(() => {
    if (!isTransactionPage) return parameterValues
    return transactionStore.getTransactionDisplayValues(currentPage.id)
  }, [isTransactionPage, parameterValues, transactionStore, currentPage])

  const currentPageModifiedIds = useMemo(() => {
    if (!isTransactionPage) return []
    return transactionStore.getTransactionModifiedIds(currentPage.id)
  }, [isTransactionPage, transactionStore, currentPage])

  const canSubmitTransaction = useMemo(() => {
    if (!isTransactionPage) return false
    return transactionStore.hasTransactionChanges(currentPage.id)
  }, [isTransactionPage, transactionStore, currentPage])

  const handleSubmitTransaction = useCallback(async () => {
    const page = currentPage
    if (!page || page.mode !== 'transaction') return

    const pagePolicy = page.id ? resolvedPagePolicies?.[page.id] : null
    if (pagePolicy?.beforeSubmit) {
      await pagePolicy.beforeSubmit({ page })
    }

    const result = await transactionStore.commitTransactionPage(page.id)
    if (!result.ok) {
      if (pagePolicy?.onSubmitError) {
        await pagePolicy.onSubmitError({ page, result })
      } else {
        notifications.setNotification(
          'ERROR',
          result.message ?? 'Command error: check device connection.',
          { displayMode: 'ACKNOWLEDGED' },
        )
      }
      return
    }

    let completedSuccessfully = true
    if (pagePolicy?.afterSubmitSuccess) {
      const policyResult = await pagePolicy.afterSubmitSuccess({ page, result })
      completedSuccessfully = policyResult?.completedSuccessfully ?? true
    } else {
      notifications.setNotification('SUCCESS', 'Command applied successfully.')
    }

    if (!completedSuccessfully) return
    applyTransactionGoOnApply(page, navigation)
  }, [currentPage, resolvedPagePolicies, transactionStore, notifications, navigation])

  const handleToggleParameter = useCallback((id) => {
    if (isTransactionPage) {
      transactionStore.toggleTransactionParameter(currentPage.id, id)
      return
    }
    transactionStore.toggleParameter(id)
  }, [isTransactionPage, transactionStore, currentPage])

  const handleSetParameterValue = useCallback((id, value) => {
    if (isTransactionPage) {
      transactionStore.setTransactionParameterValue(currentPage.id, id, value)
      return
    }
    transactionStore.setParameterValue(id, value)
  }, [isTransactionPage, transactionStore, currentPage])

  const handleResetTransaction = useCallback(() => {
    if (!isTransactionPage) return
    transactionStore.resetTransactionPage(currentPage.id)
  }, [isTransactionPage, transactionStore, currentPage])

  return {
    isTransactionPage,
    currentPageValues,
    currentPageModifiedIds,
    canSubmitTransaction,
    handleToggleParameter,
    handleSetParameterValue,
    handleResetTransaction,
    handleSubmitTransaction,
  }
}