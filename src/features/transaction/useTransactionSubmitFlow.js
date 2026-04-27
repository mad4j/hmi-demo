import { applyTransactionGoOnApply } from './transactionNavigation.js'

export const useTransactionSubmitFlow = ({
  currentPage,
  commitTransactionPage,
  setNotification,
  navigation,
  pagePolicies,
}) => {
  const getPolicyForPage = (pageId) => (pageId ? pagePolicies?.[pageId] : null)

  const handleSubmitTransaction = async () => {
    const page = currentPage.value
    if (!page || page.mode !== 'transaction') return

    const pagePolicy = getPolicyForPage(page.id)
    if (pagePolicy?.beforeSubmit) {
      await pagePolicy.beforeSubmit({ page })
    }

    const result = await commitTransactionPage(page.id)
    if (!result.ok) {
      if (pagePolicy?.onSubmitError) {
        await pagePolicy.onSubmitError({ page, result })
      } else {
        setNotification(
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
      setNotification('SUCCESS', 'Command applied successfully.')
    }

    if (!completedSuccessfully) return
    applyTransactionGoOnApply(page, navigation)
  }

  return {
    handleSubmitTransaction,
  }
}
