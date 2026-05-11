import { useState, useCallback, useEffect, useMemo } from 'react'
import { AppIcon } from './AppIcon.jsx'
import { ParameterWidget } from './ParameterWidget.jsx'
import { EnumEditorModal } from './EnumEditorModal.jsx'
import { PercentageEditorModal } from './PercentageEditorModal.jsx'
import { TextEditorModal } from './TextEditorModal.jsx'
import { DateEditorModal } from './DateEditorModal.jsx'
import './PageParametersView.css'

export const PageParametersView = ({
  parameters,
  parameterValues,
  viewportWidth,
  transactionMode = false,
  modifiedParameterIds = [],
  canSubmitTransaction = false,
  panels = null,
  onToggleParameter,
  onSetParameterValue,
  onSubmitTransaction,
  onResetTransaction,
  onPanelChange
}) => {
  // Panel navigation state
  const [currentPanel, setCurrentPanel] = useState(0)
  
  // Parameter editing state
  const [editingParamId, setEditingParamId] = useState(null)

  // Drag/swipe state
  const [dragStartX, setDragStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const hasPanels = useMemo(() => Array.isArray(panels) && panels.length > 0, [panels])
  const totalPanels = useMemo(() => hasPanels ? panels.length : 1, [hasPanels, panels])

  const visibleParameters = useMemo(() => 
    hasPanels 
      ? (panels[currentPanel]?.parameters ?? [])
      : parameters
  , [hasPanels, panels, currentPanel, parameters])

  // All parameters flattened (used for edit-next cycling)
  const allParameters = useMemo(() =>
    hasPanels
      ? panels.flatMap((p) => p.parameters ?? [])
      : parameters
  , [hasPanels, panels, parameters])

  const editingParam = useMemo(() =>
    editingParamId
      ? allParameters.find((p) => p.id === editingParamId) ?? null
      : null
  , [editingParamId, allParameters])

  // Reset panel when panels change
  useEffect(() => {
    setCurrentPanel(0)
  }, [panels])

  // Notify parent of panel change
  useEffect(() => {
    onPanelChange?.(currentPanel)
  }, [currentPanel, onPanelChange])

  const goToPanel = useCallback((index) => {
    setCurrentPanel(Math.max(0, Math.min(index, totalPanels - 1)))
  }, [totalPanels])

  // Keyboard navigation for panels
  const handlePanelKeydown = useCallback((e, panelIndex) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        goToPanel(panelIndex + 1)
        break
      case 'ArrowLeft':
        e.preventDefault()
        goToPanel(panelIndex - 1)
        break
      case 'Home':
        e.preventDefault()
        goToPanel(0)
        break
      case 'End':
        e.preventDefault()
        goToPanel(totalPanels - 1)
        break
    }
  }, [goToPanel, totalPanels])

  // Drag/swipe handling
  const onDragStart = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
    setIsDragging(true)
  }, [])

  const onDragEnd = useCallback((e) => {
    if (!isDragging) return
    setIsDragging(false)
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const delta = dragStartX - endX
    if (Math.abs(delta) > 40) {
      goToPanel(currentPanel + (delta > 0 ? 1 : -1))
    }
  }, [isDragging, dragStartX, goToPanel, currentPanel])

  // Parameter editing
  const startEditParameter = useCallback((id) => {
    setEditingParamId(id)
  }, [])

  const confirmEdit = useCallback((newValue) => {
    if (editingParamId !== null) {
      onSetParameterValue?.(editingParamId, newValue)
    }
    setEditingParamId(null)
  }, [editingParamId, onSetParameterValue])

  const cancelEdit = useCallback(() => {
    setEditingParamId(null)
  }, [])

  const EDITABLE_TYPES = ['percentage', 'text', 'password', 'date', 'enum']

  const confirmAndNext = useCallback((newValue) => {
    if (editingParamId !== null) {
      onSetParameterValue?.(editingParamId, newValue)
    }
    const editableParams = allParameters.filter(
      (p) => !p.readonly && EDITABLE_TYPES.includes(p.type)
    )
    const currentIdx = editableParams.findIndex((p) => p.id === editingParamId)
    const nextParam = editableParams[currentIdx + 1] ?? null
    setEditingParamId(nextParam?.id ?? null)
  }, [editingParamId, onSetParameterValue, allParameters])

  const handleToggle = useCallback((paramId) => {
    onToggleParameter?.(paramId)
  }, [onToggleParameter])

  const isParameterModified = useCallback((paramId) => 
    modifiedParameterIds.includes(paramId)
  , [modifiedParameterIds])

  const getTextEditorValue = useCallback(() => {
    if (!editingParam) return ''
    if (!editingParam.clearOnApply) return parameterValues[editingParam.id] ?? ''
    return isParameterModified(editingParam.id)
      ? (parameterValues[editingParam.id] ?? '')
      : ''
  }, [editingParam, parameterValues, isParameterModified])

  // Global keydown handler for transaction submit
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      if (e.key !== 'Enter') return
      if (!transactionMode) return
      if (editingParamId !== null) return
      if (!canSubmitTransaction) return
      e.preventDefault()
      onSubmitTransaction?.()
    }

    document.addEventListener('keydown', handleGlobalKeydown)
    return () => document.removeEventListener('keydown', handleGlobalKeydown)
  }, [transactionMode, editingParamId, canSubmitTransaction, onSubmitTransaction])

  // Modal type checks
  const isEditingPercentage = editingParam?.type === 'percentage'
  const isEditingText = editingParam?.type === 'text' || editingParam?.type === 'password'
  const isEditingDate = editingParam?.type === 'date'
  const isEditingEnum = editingParam?.type === 'enum'

  return (
    <div className="page-parameters-view">
      {(parameters.length || hasPanels) && (
        <div
          className={`panels-wrapper ${hasPanels ? 'panels-wrapper--active' : ''}`}
          onMouseDown={hasPanels ? onDragStart : undefined}
          onMouseUp={hasPanels ? onDragEnd : undefined}
          onMouseLeave={hasPanels ? onDragEnd : undefined}
          onTouchStart={hasPanels ? onDragStart : undefined}
          onTouchEnd={hasPanels ? onDragEnd : undefined}
        >
          <div className="widget-grid">
            {visibleParameters.map((param) => (
              <ParameterWidget
                key={param.id}
                name={param.name}
                type={param.type}
                unit={param.unit}
                precision={param.precision}
                options={param.options}
                value={parameterValues[param.id]}
                readonly={param.readonly}
                modified={isParameterModified(param.id)}
                onToggle={() => handleToggle(param.id)}
                onEdit={() => startEditParameter(param.id)}
              />
            ))}
          </div>

          {/* Panel dot indicators */}
          {hasPanels && totalPanels > 1 && (
            <div className="panel-indicators" role="tablist" aria-label="Panels">
              {Array.from({ length: totalPanels }, (_, i) => (
                <button
                  key={i}
                  className={`panel-dot ${i === currentPanel ? 'panel-dot--active' : ''}`}
                  role="tab"
                  aria-selected={i === currentPanel}
                  aria-label={`Panel ${i + 1}`}
                  aria-controls={`panel-${i}`}
                  tabIndex={i === currentPanel ? 0 : -1}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPanel(i)
                  }}
                  onKeyDown={(e) => handlePanelKeydown(e, i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {transactionMode && (
        <div className="transaction-actions" role="group" aria-label="Transaction actions">
          <button
            className="transaction-button transaction-button--reset"
            type="button"
            aria-label="Reset"
            disabled={!canSubmitTransaction}
            onClick={onResetTransaction}
          >
            <AppIcon name="reset" size={16} />
          </button>
          <button
            className="transaction-button transaction-button--submit"
            type="button"
            aria-label="Invia"
            disabled={!canSubmitTransaction}
            onClick={onSubmitTransaction}
          >
            <AppIcon name="send" size={16} />
          </button>
        </div>
      )}

      {/* Modals */}
      {editingParam && isEditingEnum && (
        <EnumEditorModal
          name={editingParam.name}
          value={parameterValues[editingParam.id]}
          options={editingParam.options ?? []}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
        />
      )}

      {editingParam && isEditingPercentage && (
        <PercentageEditorModal
          name={editingParam.name}
          value={Number(parameterValues[editingParam.id] ?? 0)}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}

      {editingParam && isEditingText && (
        <TextEditorModal
          key={editingParam.id}
          name={editingParam.name}
          value={getTextEditorValue()}
          inputType={editingParam.type === 'password' ? 'password' : 'text'}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}

      {editingParam && isEditingDate && (
        <DateEditorModal
          name={editingParam.name}
          value={parameterValues[editingParam.id] ?? ''}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}
    </div>
  )
}