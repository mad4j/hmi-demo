import { useState, useRef, useEffect } from 'react'
import './EnumEditorModal.css'

export default function EnumEditorModal({ name, value, options, onConfirm, onCancel }) {
  const [focusedIndex, setFocusedIndex] = useState(Math.max(0, options.indexOf(value)))
  const itemRefs = useRef([])

  useEffect(() => {
    itemRefs.current[focusedIndex]?.focus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const moveFocus = (delta) => {
    const next = Math.max(0, Math.min(options.length - 1, focusedIndex + delta))
    setFocusedIndex(next)
    itemRefs.current[next]?.focus()
  }

  const handleListKeydown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1) }
    else if (e.key === 'Home') { e.preventDefault(); moveFocus(-options.length) }
    else if (e.key === 'End') { e.preventDefault(); moveFocus(options.length) }
    else if (e.key === 'Escape') { e.preventDefault(); onCancel() }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" role="dialog" aria-label={`Select ${name}`} aria-modal="true">
        <div className="modal-header">{name}</div>
        <ul className="option-list" role="listbox" aria-label={name} onKeyDown={handleListKeydown}>
          {options.map((option, index) => (
            <li
              key={option}
              ref={(el) => { if (el) itemRefs.current[index] = el }}
              className={`option-item${option === value ? ' option-item--selected' : ''}`}
              role="option"
              aria-selected={option === value}
              tabIndex={index === focusedIndex ? 0 : -1}
              onClick={() => onConfirm(option)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onConfirm(option) } }}
              onFocus={() => setFocusedIndex(index)}
            >
              {option}
              {option === value && <span className="option-check" aria-hidden="true">✓</span>}
            </li>
          ))}
        </ul>
        <div className="modal-footer">
          <button className="btn btn-cancel" type="button" aria-label="Cancel" onClick={onCancel}>✕</button>
        </div>
      </div>
    </div>
  )
}
