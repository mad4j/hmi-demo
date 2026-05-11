import './ParameterWidget.css'

export const ParameterWidget = ({
  name,
  type,
  unit,
  precision,
  options,
  value,
  readonly = false,
  modified = false,
  onToggle,
  onEdit
}) => {
  const formatValue = (val) => {
    if (val === null || val === undefined) return ''
    if (type === 'percentage') return `${val}%`
    if (type === 'boolean') return val ? 'ON' : 'OFF'
    if (type === 'enum' && options) {
      const option = options.find(opt => opt.value === val)
      return option ? option.label : val
    }
    if (typeof val === 'number' && precision !== undefined) {
      return val.toFixed(precision)
    }
    return String(val)
  }

  const handleClick = () => {
    if (readonly) return
    if (type === 'boolean') {
      onToggle?.()
    } else {
      onEdit?.()
    }
  }

  return (
    <div 
      className={`parameter-widget parameter-widget--${type} ${modified ? 'parameter-widget--modified' : ''} ${readonly ? 'parameter-widget--readonly' : ''}`}
      onClick={handleClick}
    >
      <div className="parameter-name">{name}</div>
      <div className="parameter-value">
        {formatValue(value)}
        {unit && <span className="parameter-unit">{unit}</span>}
      </div>
    </div>
  )
}