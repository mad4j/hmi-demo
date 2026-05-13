import { useParameterStore } from './useParameterStore.js'
import { createDefaultTransactionPagePolicies } from '../features/transaction/transactionPagePolicies.js'
import { useTransactionPageState } from '../features/transaction/useTransactionPageState.js'
import { useTransactionSubmitFlow } from '../features/transaction/useTransactionSubmitFlow.js'

export const useTransactionPageActions = ({
  currentPage,
  notifications,
  navigation,
  pagePolicies,
}) => {
  const {
    parameterValues,
    toggleParameter,
    setParameterValue,
    toggleTransactionParameter,
    setTransactionParameterValue,
    getTransactionDisplayValues,
    getTransactionModifiedIds,
    hasTransactionChanges,
    resetTransactionPage,
    commitTransactionPage,
    refreshParameters,
  } = useParameterStore()

  const resolvedPagePolicies = pagePolicies
    ?? createDefaultTransactionPagePolicies({
      refreshParameters,
      parameterValues,
      setNotification: notifications.setNotification,
    })

  const {
    isTransactionPage,
    currentPageValues,
    currentPageModifiedIds,
    canSubmitTransaction,
  } = useTransactionPageState({
    currentPage,
    parameterValues,
    getTransactionDisplayValues,
    getTransactionModifiedIds,
    hasTransactionChanges,
  })

  const { handleSubmitTransaction } = useTransactionSubmitFlow({
    currentPage,
    commitTransactionPage,
    setNotification: notifications.setNotification,
    navigation,
    pagePolicies: resolvedPagePolicies,
  })

  const handleToggleParameter = (id) => {
    if (isTransactionPage) {
      toggleTransactionParameter(currentPage.id, id)
      return
    }
    toggleParameter(id)
  }

  const handleSetParameterValue = (id, value) => {
    if (isTransactionPage) {
      setTransactionParameterValue(currentPage.id, id, value)
      return
    }
    setParameterValue(id, value)
  }

  const handleResetTransaction = () => {
    if (!isTransactionPage) return
    resetTransactionPage(currentPage.id)
  }

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
