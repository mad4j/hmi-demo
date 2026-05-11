import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { setParameterValue as setParameterValueAction, setParameterValues as setParameterValuesAction, updateTransactionEntry, clearTransactionDraft } from '../store/parametersSlice.js'
import { uniqueParameters } from '../store/parametersSlice.js'
import { useEquipmentGateway } from './useEquipmentGateway.js'

export const useParameterStore = () => {
  const dispatch = useDispatch()
  const parameterValues = useSelector((state) => state.parameters.values)
  const transactionDrafts = useSelector((state) => state.parameters.transactionDrafts)
  
  const { getParameters, setParameters, sendCommand } = useEquipmentGateway()

  const shouldClearValueOnApply = (id) => {
    const param = uniqueParameters.find((p) => p.id === id)
    return Boolean(param && (param.type === 'text' || param.type === 'password') && param.clearOnApply)
  }

  const stageTransactionValue = useCallback((pageId, id, value) => {
    if (!pageId || !(id in parameterValues)) return
    const existingDraft = transactionDrafts[pageId]?.[id]
    const originalValue = existingDraft?.originalValue ?? parameterValues[id]
    
    if (Object.is(value, originalValue)) {
      dispatch(updateTransactionEntry({ pageId, id, entry: null }))
    } else {
      dispatch(updateTransactionEntry({ 
        pageId, 
        id, 
        entry: { originalValue, currentValue: value }
      }))
    }
  }, [dispatch, parameterValues, transactionDrafts])

  const toggleTransactionParameter = useCallback((pageId, id) => {
    if (!(id in parameterValues)) return
    
    const param = uniqueParameters.find((p) => p.id === id)
    const displayValue = getTransactionDisplayValue(pageId, id)

    if (typeof displayValue === 'boolean') {
      stageTransactionValue(pageId, id, !displayValue)
      return
    }

    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(displayValue))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      stageTransactionValue(pageId, id, param.options[nextIndex])
    }
  }, [parameterValues, stageTransactionValue])

  const setTransactionParameterValue = useCallback((pageId, id, value) => {
    stageTransactionValue(pageId, id, value)
  }, [stageTransactionValue])

  const getTransactionDisplayValue = useCallback((pageId, id) => {
    const entry = transactionDrafts[pageId]?.[id]
    return entry ? entry.currentValue : parameterValues[id]
  }, [parameterValues, transactionDrafts])

  const getTransactionDisplayValues = useCallback((pageId) => {
    const pageDraft = transactionDrafts[pageId] ?? {}
    const overlay = {}
    Object.keys(pageDraft).forEach((id) => {
      overlay[id] = pageDraft[id].currentValue
    })
    return { ...parameterValues, ...overlay }
  }, [parameterValues, transactionDrafts])

  const getTransactionModifiedIds = useCallback((pageId) => 
    Object.keys(transactionDrafts[pageId] ?? {}), [transactionDrafts])

  const hasTransactionChanges = useCallback((pageId) => 
    getTransactionModifiedIds(pageId).length > 0, [getTransactionModifiedIds])

  const resetTransactionPage = useCallback((pageId) => {
    dispatch(clearTransactionDraft(pageId))
  }, [dispatch])

  const commitTransactionPage = useCallback(async (pageId) => {
    const pageDraft = transactionDrafts[pageId] ?? {}
    const entries = Object.entries(pageDraft)
    if (!entries.length) return { ok: true, failed: [] }

    const payload = Object.fromEntries(entries.map(([id, draft]) => [id, draft.currentValue]))
    const previousValues = Object.fromEntries(entries.map(([id]) => [id, parameterValues[id]]))

    // Optimistic update
    dispatch(setParameterValuesAction(payload))

    const result = await setParameters(payload)
    if (result.ok) {
      // Clear values that should be cleared on apply
      const clearPayload = {}
      Object.keys(payload).forEach((id) => {
        if (shouldClearValueOnApply(id)) {
          clearPayload[id] = ''
        }
      })
      if (Object.keys(clearPayload).length) {
        dispatch(setParameterValuesAction(clearPayload))
      }
      dispatch(clearTransactionDraft(pageId))
      return { ok: true, failed: [] }
    }

    // Revert on failure
    dispatch(setParameterValuesAction(previousValues))
    return {
      ok: false,
      failed: Object.keys(payload),
      message: result.message ?? 'Send error: check device connection.',
    }
  }, [dispatch, transactionDrafts, parameterValues, setParameters, shouldClearValueOnApply])

  const toggleParameter = useCallback(async (id) => {
    if (typeof parameterValues[id] === 'boolean') {
      const previous = parameterValues[id]
      const newValue = !previous
      dispatch(setParameterValueAction({ id, value: newValue }))
      const result = await setParameters({ [id]: newValue })
      if (result.ok) return { ok: true }
      dispatch(setParameterValueAction({ id, value: previous }))
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }

    const param = uniqueParameters.find((p) => p.id === id)
    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(parameterValues[id]))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      const previous = parameterValues[id]
      const newValue = param.options[nextIndex]
      dispatch(setParameterValueAction({ id, value: newValue }))
      const result = await setParameters({ [id]: newValue })
      if (result.ok) return { ok: true }
      dispatch(setParameterValueAction({ id, value: previous }))
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }

    return { ok: false, message: 'Parameter is read-only.' }
  }, [dispatch, parameterValues, setParameters])

  const setParameterValue = useCallback(async (id, value) => {
    if (id in parameterValues) {
      const previous = parameterValues[id]
      dispatch(setParameterValueAction({ id, value }))
      const result = await setParameters({ [id]: value })
      if (result.ok) {
        if (shouldClearValueOnApply(id)) {
          dispatch(setParameterValueAction({ id, value: '' }))
        }
        return { ok: true }
      }
      dispatch(setParameterValueAction({ id, value: previous }))
      return { ok: false, message: result.message ?? 'Parameter update error.' }
    }
    return { ok: false, message: 'Parameter not found.' }
  }, [dispatch, parameterValues, setParameters, shouldClearValueOnApply])

  const refreshParameters = useCallback(async (ids) => {
    const result = await getParameters(ids)
    if (!result.ok) return
    dispatch(setParameterValuesAction(result.values))
  }, [dispatch, getParameters])

  const getManagedParameters = useCallback(() =>
    uniqueParameters.map((param) => ({
      ...param,
      value: parameterValues[param.id],
    })), [parameterValues])

  const getManagedParameterIds = useCallback(() => 
    uniqueParameters.map((param) => param.id), [])

  return {
    parameterValues,
    toggleParameter,
    setParameterValue,
    sendCommand,
    toggleTransactionParameter,
    setTransactionParameterValue,
    getTransactionDisplayValues,
    getTransactionModifiedIds,
    hasTransactionChanges,
    resetTransactionPage,
    commitTransactionPage,
    refreshParameters,
    getManagedParameters,
    getManagedParameterIds,
  }
}