import { useState } from 'react'
import './DateEditorModal.css'

function toInputDate(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  const yyyy = parsed.getFullYear()
  const mm = String(parsed.getMonth() + 1).padStart(2, '0')
  const dd = String(parsed.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DateEditorModal({ name, value = '', onConfirm, onCancel, onConfirmAndNext }) {
  const [localValue, setLocalValue] = useState(toInputDate(value))

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" role="dialog" aria-label={`Edit ${name}`} aria-modal="true">
        <div className="modal-header">{name}</div>
        <div className="modal-body">
          <input
            className="date-input"
            type="date"
            value={localValue}
            aria-label={name}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onConfirm(localValue) }
              else if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); onConfirmAndNext?.(localValue) }
            }}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" type="button" aria-label="Cancel" onClick={onCancel}>✕</button>
          <button className="btn btn-confirm" type="button" aria-label="Confirm" onClick={() => onConfirm(localValue)}>✓</button>
        </div>
      </div>
    </div>
  )
}
