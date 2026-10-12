import { useParameterStore } from '@/features/parameters/useParameterStore.js'
import { useTransactionPageState } from '@/features/transaction/useTransactionPageState.js'

export const useTransactionPageActions = ({ currentPage }) => {
  const {
    parameterValues,
    toggleParameter,
    setParametersValues,
    refreshParameters,
  } = useParameterStore()

  const { currentPageValues } = useTransactionPageState({
    currentPage,
    parameterValues,
  })

  const pageParameters =
    Array.isArray(currentPage?.panels) && currentPage.panels.length > 0
      ? currentPage.panels.flatMap((p) => p.parameters ?? [])
      : (currentPage?.parameters ?? [])

  const handleToggleParameter = (id) => {
    toggleParameter(id)
  }

  // payload = [{ id, value }, ...] arriva da PageParametersView al submit
  const handleSubmitTransaction = async (payload) => {
    await setParametersValues(payload)
  }

  // visibleIds = [id, ...] arriva da PageParametersView al reset
  const handleRefreshParameters = (visibleIds) => {
    const ids = pageParameters
      .filter((p) => visibleIds.includes(p.id))
      .map((p) => ({ id: p.id, field: p.field }))
    if (ids.length > 0) refreshParameters(ids)
  }

  return {
    currentPageValues,  
    handleToggleParameter,
    handleSubmitTransaction,
    handleRefreshParameters,
  }
}