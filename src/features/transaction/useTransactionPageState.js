import { computed } from 'vue'

export const useTransactionPageState = ({
  currentPage,
  parameterValues,
  getTransactionDisplayValues,
  getTransactionModifiedIds,
  hasTransactionChanges,
}) => {
  const isTransactionPage = computed(() => currentPage.value?.mode === 'transaction')

  const currentPageValues = computed(() => {
    if (!isTransactionPage.value) return parameterValues
    return getTransactionDisplayValues(currentPage.value.id)
  })

  const currentPageModifiedIds = computed(() => {
    if (!isTransactionPage.value) return []
    return getTransactionModifiedIds(currentPage.value.id)
  })

  const canSubmitTransaction = computed(() => {
    if (!isTransactionPage.value) return false
    return hasTransactionChanges(currentPage.value.id)
  })

  return {
    isTransactionPage,
    currentPageValues,
    currentPageModifiedIds,
    canSubmitTransaction,
  }
}
