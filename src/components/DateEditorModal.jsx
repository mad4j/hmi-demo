import { useState } from 'react'

export const DateEditorModal = ({ name, value, onConfirm, onCancel, onConfirmAndNext }) => {
  const [inputValue, setInputValue] = useState(value)

  const handleConfirm = () => {
    onConfirm(inputValue)
  }

  const handleConfirmAndNext = () => {
    onConfirmAndNext?.(inputValue)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{name}</h3>
        <input
          type="date"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button onClick={handleConfirm}>Confirm</button>
          {onConfirmAndNext && <button onClick={handleConfirmAndNext}>Confirm & Next</button>}
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  )
}