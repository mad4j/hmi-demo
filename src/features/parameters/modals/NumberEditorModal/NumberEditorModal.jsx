import { useState, useEffect, useRef } from 'react'
import './NumberEditorModal.css'

export default function NumberEditorModal({
  name,
  value,
  min = null,
  max = null,
  unit = '',
  precision = null,
  onConfirm,
  onCancel,
  onConfirmAndNext,
}) {
  const [localValue, setLocalValue] = useState(() => {
    const v = Number(value)
    return Number.isNaN(v) ? 0 : v
  })

  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const clamp = (v) => {
    let num = Number(v)

    if (Number.isNaN(num)) return localValue

    if (min !== null && min !== undefined) num = Math.max(Number(min), num)
    if (max !== null && max !== undefined) num = Math.min(Number(max), num)

    return num
  }

  const formatValue = (v) => {
    if (precision !== null && precision !== undefined) {
      return Number(v).toFixed(precision)
    }
    return String(v)
  }

   const isOutOfRange = (v) => {
  const num = Number(v)
  if (Number.isNaN(num)) return true
  if (min !== null && min !== undefined && num < Number(min)) return true
  if (max !== null && max !== undefined && num > Number(max)) return true
  return false
}
const commit = () => {
  const finalValue = Number(localValue)

  if (isOutOfRange(finalValue)) {
    return // blocca conferma
  }

  onConfirm(clamp(finalValue))
}

const commitAndNext = () => {
  const finalValue = Number(localValue)

  if (isOutOfRange(finalValue)) {
    return // blocca avanzamento
  }

  onConfirmAndNext?.(clamp(finalValue))
}
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="modal" role="dialog" aria-label={`Edit ${name}`} aria-modal="true">
        <div className="modal-header">{name}</div>

        <div className="modal-body">
          <input
            ref={inputRef}
            className="number-input"
            type="number"
            value={localValue}
            min={min ?? undefined}
            max={max ?? undefined}
            step={ 1}
            aria-label={name}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.stopPropagation()
                commit()
              } else if (e.key === 'Tab') {
                e.preventDefault()
                e.stopPropagation()
                commitAndNext()
              }
            }}
          />
        </div>

        {(min !== null || max !== null || unit) && (
          <div className="modal-hint">
            {min !== null && max !== null && (
              <span>
                Range: {min} - {max}
              </span>
            )}
            {unit && <span>Unit: {unit}</span>}
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-cancel" type="button" onClick={onCancel}>
            ✕
          </button>
          <button className="btn btn-confirm" type="button" onClick={commit}>
            ✓
          </button>
        </div>
      </div>
    </div>
  )
}