export const useTransactionPageState = ({
  currentPage,
  parameterValues,
  getTransactionDisplayValues,
  getTransactionModifiedIds,
  hasTransactionChanges,
}) => {
  const isTransactionPage = currentPage?.mode === 'transaction'

  const currentPageValues = isTransactionPage
    ? getTransactionDisplayValues(currentPage.id)
    : parameterValues

  const currentPageModifiedIds = isTransactionPage
    ? getTransactionModifiedIds(currentPage.id)
    : []

  const canSubmitTransaction = isTransactionPage
    ? hasTransactionChanges(currentPage.id)
    : false

  return {
    isTransactionPage,
    currentPageValues,
    currentPageModifiedIds,
    canSubmitTransaction,
  }
}
