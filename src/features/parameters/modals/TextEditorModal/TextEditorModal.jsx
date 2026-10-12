import { useState, useRef, useEffect } from 'react'
import './TextEditorModal.css'

export default function TextEditorModal({ name, value = '', inputType = 'text', onConfirm, onCancel, onConfirmAndNext }) {
  const [localValue, setLocalValue] = useState(String(value ?? ''))
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" role="dialog" aria-label={`Edit ${name}`} aria-modal="true">
        <div className="modal-header">{name}</div>
        <div className="modal-body">
          <input
            ref={inputRef}
            className="text-input"
            type={inputType}
            value={localValue}
            autoComplete={inputType === 'password' ? 'new-password' : 'off'}
            aria-label={name}
            spellCheck={false}
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
