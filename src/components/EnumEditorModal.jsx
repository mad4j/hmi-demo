export const EnumEditorModal = ({ name, value, options, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{name}</h3>
        <div className="enum-options">
          {options.map((option) => (
            <button
              key={option.value}
              className={`enum-option ${value === option.value ? 'enum-option--selected' : ''}`}
              onClick={() => onConfirm(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}