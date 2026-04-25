import { computed } from 'vue'

export const useTransactionPageActions = ({
  currentPage,
  parameterValues,
  setNotification,
  goHome,
  goToPreviousPage,
  toggleParameter,
  setParameterValue,
  toggleTransactionParameter,
  setTransactionParameterValue,
  getTransactionDisplayValues,
  getTransactionModifiedIds,
  hasTransactionChanges,
  resetTransactionPage,
  commitTransactionPage,
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

  const handleToggleParameter = (id) => {
    if (isTransactionPage.value) {
      toggleTransactionParameter(currentPage.value.id, id)
      return
    }
    toggleParameter(id)
  }

  const handleSetParameterValue = (id, value) => {
    if (isTransactionPage.value) {
      setTransactionParameterValue(currentPage.value.id, id, value)
      return
    }
    setParameterValue(id, value)
  }

  const handleResetTransaction = () => {
    if (!isTransactionPage.value) return
    resetTransactionPage(currentPage.value.id)
  }

  const handleSubmitTransaction = async () => {
    const page = currentPage.value
    if (!page || page.mode !== 'transaction') return
    const isLoginAttempt = page.id === 'login'
    let completedSuccessfully = false

    if (isLoginAttempt) {
      setNotification('NORMAL', 'Tentativo di accesso in corso...')
    }

    const result = await commitTransactionPage(page.id)
    if (!result.ok) {
      setNotification('ERROR', 'Errore invio comando: verifica la connessione al dispositivo.', {
        displayMode: 'ACKNOWLEDGED',
      })
      return
    }

    if (isLoginAttempt) {
      if (parameterValues.status_login === 'ok') {
        setNotification('SUCCESS', 'Accesso eseguito con successo.')
        completedSuccessfully = true
      } else {
        setNotification('ERROR', 'Accesso non riuscito: credenziali non valide.', {
          displayMode: 'ACKNOWLEDGED',
        })
      }
    } else {
      setNotification('SUCCESS', 'Comando applicato correttamente.')
      completedSuccessfully = true
    }

    if (!completedSuccessfully) {
      return
    }

    if (page.goOnApply === 'GO_HOME') {
      goHome()
      return
    }

    if (page.goOnApply === 'GO_BACK') {
      goToPreviousPage()
    }
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
