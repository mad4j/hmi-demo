import { useEffect, useRef, useMemo, useState } from 'react'
import './PageParametersView.css'
import AppIcon from './AppIcon.jsx'
import ParameterWidget from './ParameterWidget.jsx'
import EnumEditorModal from './EnumEditorModal.jsx'
import PercentageEditorModal from './PercentageEditorModal.jsx'
import TextEditorModal from './TextEditorModal.jsx'
import DateEditorModal from './DateEditorModal.jsx'
import TableParameterView from './TableParameterView.jsx'

const EDITABLE_TYPES = ['percentage', 'text', 'password', 'date', 'enum']

export default function PageParametersView({
  parameters,
  parameterValues,
  transactionMode = false,
  modifiedParameterIds = [],
  canSubmitTransaction = false,
  panels = null,
  currentPanel = 0,
  onToggleParameter,
  onSetParameterValue,
  onSubmitTransaction,
  onResetTransaction,
  onPanelChange,
}) {
  // editingParamId is intentionally kept as internal state: it controls which modal is
  // open and has no cross-cutting concern (unlike currentPanel which feeds the notification bar).
  const [editingParamId, setEditingParamId] = useState(null)
  const dragRef = useRef({ startX: 0, isDragging: false })

  const hasPanels = Array.isArray(panels) && panels.length > 0
  const totalPanels = hasPanels ? panels.length : 1

  // Global Enter keydown for transaction submit
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter') return
      if (!transactionMode) return
      if (editingParamId !== null) return
      if (!canSubmitTransaction) return
      e.preventDefault()
      onSubmitTransaction?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [transactionMode, editingParamId, canSubmitTransaction, onSubmitTransaction])

  const visibleParameters = hasPanels ? (panels[currentPanel]?.parameters ?? []) : parameters
  const tableParameter = visibleParameters.find((param) => param?.type === 'table') ?? null
  const visibleStandardParameters = tableParameter
    ? []
    : visibleParameters
  const allParameters = useMemo(
    () => hasPanels ? panels.flatMap((p) => p.parameters ?? []) : parameters,
    [hasPanels, panels, parameters]
  )

  const goToPanel = (index) => {
    onPanelChange?.(Math.max(0, Math.min(index, totalPanels - 1)))
  }

  const getWrappedPanelIndex = (index) => {
    if (totalPanels <= 0) return 0
    return ((index % totalPanels) + totalPanels) % totalPanels
  }

  useEffect(() => {
    if (!hasPanels || totalPanels <= 1) return undefined

    const handler = (e) => {
      if (e.defaultPrevented) return

      const target = e.target
      const tagName = target?.tagName?.toLowerCase?.() ?? ''
      const isTypingContext =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable

      if (isTypingContext) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToPanel(getWrappedPanelIndex(currentPanel + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPanel(getWrappedPanelIndex(currentPanel - 1))
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [hasPanels, totalPanels, currentPanel, onPanelChange])

  const onDragStart = (e) => {
    dragRef.current.startX = e.touches ? e.touches[0].clientX : e.clientX
    dragRef.current.isDragging = true
  }
  const onDragEnd = (e) => {
    if (!dragRef.current.isDragging) return
    dragRef.current.isDragging = false
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    const delta = dragRef.current.startX - endX
    if (Math.abs(delta) > 40) goToPanel(currentPanel + (delta > 0 ? 1 : -1))
  }

  const editingParam = editingParamId ? allParameters.find((p) => p.id === editingParamId) ?? null : null

  const confirmEdit = (newValue) => {
    if (editingParamId !== null) onSetParameterValue?.(editingParamId, newValue)
    setEditingParamId(null)
  }
  const cancelEdit = () => setEditingParamId(null)

  const confirmAndNext = (newValue) => {
    if (editingParamId !== null) onSetParameterValue?.(editingParamId, newValue)
    const editableParams = allParameters.filter((p) => !p.readonly && EDITABLE_TYPES.includes(p.type))
    const currentIdx = editableParams.findIndex((p) => p.id === editingParamId)
    const nextParam = editableParams[currentIdx + 1] ?? null
    setEditingParamId(nextParam?.id ?? null)
  }

  const isParameterModified = (paramId) => modifiedParameterIds.includes(paramId)

  const getTextEditorValue = () => {
    if (!editingParam) return ''
    if (!editingParam.clearOnApply) return parameterValues[editingParam.id] ?? ''
    return isParameterModified(editingParam.id) ? (parameterValues[editingParam.id] ?? '') : ''
  }

  const panelWrapperProps = hasPanels ? {
    onMouseDown: onDragStart,
    onMouseUp: onDragEnd,
    onMouseLeave: onDragEnd,
    onTouchStart: onDragStart,
    onTouchEnd: onDragEnd,
  } : {}

  return (
    <>
      <div className="page-parameters-view">
        {(parameters.length > 0 || hasPanels) && (
          <div
            className={`panels-wrapper${hasPanels ? ' panels-wrapper--active' : ''}`}
            {...panelWrapperProps}
          >
            <div className={`widget-grid${tableParameter ? ' widget-grid--table' : ''}`}>
              {tableParameter ? (
                <TableParameterView
                  title={tableParameter.name}
                  rawValue={parameterValues[tableParameter.id]}
                />
              ) : (
                visibleStandardParameters.map((param) => (
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
                    onToggle={() => onToggleParameter?.(param.id)}
                    onEdit={() => setEditingParamId(param.id)}
                  />
                ))
              )}
            </div>

            {hasPanels && totalPanels > 1 && (
              <div className="panel-indicators" aria-label="Panels">
                {Array.from({ length: totalPanels }, (_, i) => (
                  <button
                    key={i}
                    className={`panel-dot${i === currentPanel ? ' panel-dot--active' : ''}`}
                    aria-current={i === currentPanel ? 'true' : undefined}
                    aria-label={`Panel ${i + 1}`}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); goToPanel(i) }}
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
      </div>

      {editingParam?.type === 'enum' && (
        <EnumEditorModal
          name={editingParam.name}
          value={parameterValues[editingParam.id]}
          options={editingParam.options ?? []}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
        />
      )}
      {editingParam?.type === 'percentage' && (
        <PercentageEditorModal
          name={editingParam.name}
          value={Number(parameterValues[editingParam.id] ?? 0)}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}
      {(editingParam?.type === 'text' || editingParam?.type === 'password') && (
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
      {editingParam?.type === 'date' && (
        <DateEditorModal
          name={editingParam.name}
          value={parameterValues[editingParam.id] ?? ''}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}
    </>
  )
}
