import { createDefaultTransactionPagePolicies } from '../features/transaction/transactionPagePolicies.js'
import { useTransactionPageState } from '../features/transaction/useTransactionPageState.js'
import { useTransactionSubmitFlow } from '../features/transaction/useTransactionSubmitFlow.js'

export const useTransactionPageActions = ({
  currentPage,
  parameterValues,
  transactionStore,
  notifications,
  navigation,
  pagePolicies,
}) => {
  const resolvedPagePolicies = pagePolicies
    ?? createDefaultTransactionPagePolicies({
      refreshParameters: transactionStore.refreshParameters,
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
    getTransactionDisplayValues: transactionStore.getTransactionDisplayValues,
    getTransactionModifiedIds: transactionStore.getTransactionModifiedIds,
    hasTransactionChanges: transactionStore.hasTransactionChanges,
  })

  const { handleSubmitTransaction } = useTransactionSubmitFlow({
    currentPage,
    commitTransactionPage: transactionStore.commitTransactionPage,
    setNotification: notifications.setNotification,
    navigation,
    pagePolicies: resolvedPagePolicies,
  })

  const handleToggleParameter = (id) => {
    if (isTransactionPage.value) {
      transactionStore.toggleTransactionParameter(currentPage.value.id, id)
      return
    }
    transactionStore.toggleParameter(id)
  }

  const handleSetParameterValue = (id, value) => {
    if (isTransactionPage.value) {
      transactionStore.setTransactionParameterValue(currentPage.value.id, id, value)
      return
    }
    transactionStore.setParameterValue(id, value)
  }

  const handleResetTransaction = () => {
    if (!isTransactionPage.value) return
    transactionStore.resetTransactionPage(currentPage.value.id)
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
