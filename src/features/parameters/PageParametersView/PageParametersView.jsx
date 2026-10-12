import { useEffect, useRef, useMemo, useState } from 'react'
import './PageParametersView.css'
import IconReset from '@/icons/IconReset.jsx'
import IconReload from '@/icons/IconReload.jsx'
import IconSend from '@/icons/IconSend.jsx'
import BooleanParameterWidget from '../widgets/BooleanParameterWidget/BooleanParameterWidget.jsx'
import NumberParameterWidget from '../widgets/NumberParameterWidget/NumberParameterWidget.jsx'
import PercentageParameterWidget from '../widgets/PercentageParameterWidget/PercentageParameterWidget.jsx'
import TextParameterWidget from '../widgets/TextParameterWidget/TextParameterWidget.jsx'
import PasswordParameterWidget from '../widgets/PasswordParameterWidget/PasswordParameterWidget.jsx'
import DateParameterWidget from '../widgets/DateParameterWidget/DateParameterWidget.jsx'
import EnumParameterWidget from '../widgets/EnumParameterWidget/EnumParameterWidget.jsx'
import PlainParameterWidget from '../widgets/PlainParameterWidget/PlainParameterWidget.jsx'
import EnumEditorModal from '../modals/EnumEditorModal/EnumEditorModal.jsx'
import PercentageEditorModal from '../modals/PercentageEditorModal/PercentageEditorModal.jsx'
import TextEditorModal from '../modals/TextEditorModal/TextEditorModal.jsx'
import DateEditorModal from '../modals/DateEditorModal/DateEditorModal.jsx'
import NumberEditorModal from '../modals/NumberEditorModal/NumberEditorModal.jsx'
import LinkWidget from '@/features/link-grid/LinkWidget/LinkWidget.jsx'
import AlarmPanel from '@/features/alarms/AlarmPanel/AlarmPanel.jsx'

const EDITABLE_TYPES = ['percentage', 'text', 'password', 'date', 'enum', 'number']

export default function PageParametersView({
  pageId,
  parameters,
  submenus = [],  
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
  onRefreshParameter,
  onPanelChange,
  onNavigate,
}) {
  const [editingParamId, setEditingParamId] = useState(null)
  // Valori locali pendenti: { [id]: value }
  const [pendingValues, setPendingValues] = useState({})
  const dragRef = useRef({ startX: 0, isDragging: false })

  const hasPanels = Array.isArray(panels) && panels.length > 0
  const totalPanels = hasPanels ? panels.length : 1
  const visibleSubmenus = hasPanels
  ? (panels[currentPanel]?.submenus ?? []).filter((s) => s.visibility !== 'hidden')
  : (submenus ?? []).filter((s) => s.visibility !== 'hidden')
  const hasModifications = Object.keys(pendingValues).length > 0

  // Valore effettivo da mostrare: pending ha priorità su parameterValues
  const resolvedValues = useMemo(
    () => ({ ...parameterValues, ...pendingValues }),
    [parameterValues, pendingValues]
  )

  // Global Enter keydown for transaction submit
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Enter') return
      if (!transactionMode) return
      if (editingParamId !== null) return
      if (!hasModifications) return
      e.preventDefault()
      handleSubmit()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [transactionMode, editingParamId, hasModifications, pendingValues])

  const visibleParameters = hasPanels ? (panels[currentPanel]?.parameters ?? []).filter(
    (p) => p.visibility !== 'hidden'): parameters


  const allParameters = useMemo(
    () => hasPanels ? panels.flatMap((p) => p.parameters ?? []) : parameters,
    [hasPanels, panels, parameters]
  )

  const goToPanel = (index) => {
    onPanelChange?.(Math.max(0, Math.min(index, totalPanels - 1)))
  }

  const handlePanelKeydown = (e, panelIndex) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goToPanel(panelIndex + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goToPanel(panelIndex - 1) }
    else if (e.key === 'Home') { e.preventDefault(); goToPanel(0) }
    else if (e.key === 'End') { e.preventDefault(); goToPanel(totalPanels - 1) }
  }

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

  const editingParam = editingParamId
    ? allParameters.find((p) => p.id === editingParamId) ?? null
    : null

  // Salva in pendingValues invece di chiamare subito onSetParameterValue
  const applyPendingValue = (id, newValue) => {
    setPendingValues((prev) => ({ ...prev, [id]: newValue }))
  }

  const confirmEdit = (newValue) => {
    if (editingParamId !== null) applyPendingValue(editingParamId, newValue)
    setEditingParamId(null)
  }
  const cancelEdit = () => setEditingParamId(null)

  const confirmAndNext = (newValue) => {
    if (editingParamId !== null) applyPendingValue(editingParamId, newValue)
    const editableParams = allParameters.filter((p) => !p.readonly && EDITABLE_TYPES.includes(p.type))
    const currentIdx = editableParams.findIndex((p) => p.id === editingParamId)
    const nextParam = editableParams[currentIdx + 1] ?? null
    setEditingParamId(nextParam?.id ?? null)
  }

  const isParameterModified = (paramId) => paramId in pendingValues

  const getTextEditorValue = () => {
    if (!editingParam) return ''
    if (!editingParam.clearOnApply) return resolvedValues[editingParam.id] ?? ''
    return isParameterModified(editingParam.id) ? (resolvedValues[editingParam.id] ?? '') : ''
  }

  // Submit: manda tutti i pending come [{id: value}, ...]
  const handleSubmit = async () => {
    const fieldMap = new Map(
      visibleParameters.map(p => [p.id, p.field])
    );

    const payload = Object.entries(pendingValues).map(([id, value]) => ({
      id,
      value,
      field: fieldMap.get(id)
    }));
    await onSubmitTransaction?.(payload)
    setPendingValues({})
  }

  // Reset: svuota i pending e chiede refresh dei valori originali
  const handleReset = () => {
    setPendingValues({})
    const visibleIds = visibleParameters.map((p) => p.id)
    onRefreshParameter?.(visibleIds)
  }

  const panelWrapperProps = hasPanels ? {
    onMouseDown: onDragStart,
    onMouseUp: onDragEnd,
    onMouseLeave: onDragEnd,
    onTouchStart: onDragStart,
    onTouchEnd: onDragEnd,
  } : {}

  const renderParameterWidget = (param) => {
    const modified = isParameterModified(param.id)
    const value = resolvedValues[param.id]
    const onEdit = () => setEditingParamId(param.id)

    switch (param.type) {
      case 'boolean':
        return (
          <BooleanParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            readonly={param.readonly}
            modified={modified}
            onToggle={() => onToggleParameter?.(param.id)}
          />
        )
      case 'number':
        return (
          <NumberParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            unit={param.unit}
            precision={1}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      case 'percentage':
        return (
          <PercentageParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            precision={param.precision}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      case 'text':
        return (
          <TextParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      case 'password':
        return (
          <PasswordParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      case 'date':
        return (
          <DateParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      case 'enum':
        return (
          <EnumParameterWidget
            key={param.id}
            name={param.name}
            value={value}
            options={param.optionsLabel}
            optionsValue={param.optionsValue}
            readonly={param.readonly}
            modified={modified}
            onEdit={onEdit}
          />
        )
      default:
        return (
          <PlainParameterWidget
            key={param.id}
            name={param.name}
            type={param.type}
            value={value}
            readonly={param.readonly}
            modified={modified}
          />
        )
    }
  }

  if (pageId === 'allarmi') {
    return <AlarmPanel />
  }

  return (
    <>
      <div className="page-parameters-view">
        {(parameters.length > 0 || hasPanels) && (
          <div
            className={`panels-wrapper${hasPanels ? ' panels-wrapper--active' : ''}`}
            {...panelWrapperProps}
          >
            <div className="widget-grid">
              {visibleParameters.map(renderParameterWidget)}

              {/* <-- AGGIUNGI QUESTO BLOCCO: Stampa i sottomenu se ce ne sono --> */}
              {visibleSubmenus.map((submenu) => (
                <LinkWidget
                  key={submenu.id}
                  label={submenu.label}
                  icon={submenu.icon}
                  onNavigate={() => onNavigate?.(submenu.id)}
                />
              ))}
            </div>

            {hasPanels && totalPanels > 1 && (
              <div className="panel-indicators" role="tablist" aria-label="Panels">
                {Array.from({ length: totalPanels }, (_, i) => (
                  <button
                    key={i}
                    className={`panel-dot${i === currentPanel ? ' panel-dot--active' : ''}`}
                    role="tab"
                    aria-selected={i === currentPanel}
                    aria-label={`Panel ${i + 1}`}
                    tabIndex={i === currentPanel ? 0 : -1}
                    onClick={(e) => { e.stopPropagation(); goToPanel(i) }}
                    onKeyDown={(e) => handlePanelKeydown(e, i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

         <div
  className={`transaction-actions ${
    hasModifications ? "transaction-actions--modified" : ""
  }`}
  role="group"
  aria-label="Transaction actions"
>

  {/* RESET / RELOAD */}
  <button
    className="transaction-button transaction-button--reset"
    type="button"
    aria-label={hasModifications ? "Reset" : "Reload"}
    onClick={handleReset}
  >
    {hasModifications
      ? <IconReset size={24} />
      : <IconReload size={24} />}
  </button>

  {/* SUBMIT */}
  <button
    className="transaction-button transaction-button--submit"
    type="button"
    aria-label="Invia"
    onClick={handleSubmit}
    disabled={!hasModifications}
  >
    <IconSend size={24} />
  </button>

</div>
        
      </div>

      {editingParam?.type === 'enum' && (
        <EnumEditorModal
          name={editingParam.name}
          value={resolvedValues[editingParam.id]}
          optionsValue={editingParam.optionsValue}
          options={editingParam.optionsLabel ?? []}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
        />
      )}
      {editingParam?.type === 'percentage' && (
        <PercentageEditorModal
          name={editingParam.name}
          value={Number(resolvedValues[editingParam.id] ?? 0)}
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
          value={resolvedValues[editingParam.id] ?? ''}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}
      {editingParam?.type === 'number' && (
        <NumberEditorModal
          key={editingParam.id}
          name={editingParam.name}
          value={resolvedValues[editingParam.id]}
          min={editingParam.min}
          max={editingParam.max}
          unit={editingParam.unit}
          precision={editingParam.precision}
          onConfirm={confirmEdit}
          onCancel={cancelEdit}
          onConfirmAndNext={confirmAndNext}
        />
      )}
    </>
  )
}