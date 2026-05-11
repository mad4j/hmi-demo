import { useState } from 'react'

export const PercentageEditorModal = ({ name, value, onConfirm, onCancel, onConfirmAndNext }) => {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleConfirm = () => {
    const numValue = Math.max(0, Math.min(100, Number(inputValue) || 0))
    onConfirm(numValue)
  }

  const handleConfirmAndNext = () => {
    const numValue = Math.max(0, Math.min(100, Number(inputValue) || 0))
    onConfirmAndNext?.(numValue)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{name}</h3>
        <input
          type="number"
          min="0"
          max="100"
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