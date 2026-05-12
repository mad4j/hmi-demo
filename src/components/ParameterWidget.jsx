import './ParameterWidget.css'
import IconLock from './icons/IconLock.jsx'

function getDisplayValue(value, type, precision) {
  if (value === null || value === undefined) return '—'
  if (type === 'boolean') return value ? 'ON' : 'OFF'
  if (type === 'percentage' || type === 'number') {
    const num = Number(value)
    if (Number.isNaN(num)) return '—'
    return precision !== null && precision !== undefined ? num.toFixed(precision) : String(value)
  }
  if (type === 'text') {
    const str = String(value ?? '').trim()
    return str === '' ? '---' : str
  }
  if (type === 'password') return '•••'
  if (type === 'date') {
    const raw = String(value ?? '').trim()
    if (!raw) return '—'
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat('it-IT').format(parsed)
  }
  return String(value ?? '—')
}

function getDisplayUnit(type, unit) {
  if (type === 'percentage') return '%'
  if (type === 'number' && unit) return unit
  return ''
}

export default function ParameterWidget({ name, value, type = 'number', unit = '', precision = null, options = [], readonly = false, modified = false, onToggle, onEdit }) {
  const displayValue = getDisplayValue(value, type, precision)
  const displayUnit = getDisplayUnit(type, unit)
  const isActive = type === 'boolean' && Boolean(value)
  const isClickable = !readonly && (
    type === 'boolean' || type === 'percentage' || type === 'text' ||
    type === 'date' || type === 'password' || (type === 'enum' && options.length > 0)
  )

  const handleClick = () => {
    if (!isClickable) return
    if (type === 'boolean') { onToggle?.() } else { onEdit?.() }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const classes = [
    'param-widget',
    `param-widget--${type}`,
    isActive ? 'param-widget--active' : '',
    isClickable ? 'param-widget--clickable' : '',
    readonly ? 'param-widget--readonly' : '',
    modified ? 'param-widget--modified' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={type === 'boolean' ? isActive : undefined}
      aria-label={isClickable ? name : undefined}
      aria-readonly={readonly || undefined}
      onClick={handleClick}
      onKeyDown={isClickable ? handleKey : undefined}
    >
      <div className="param-name">
        {name}
        {readonly && <IconLock size={10} />}
      </div>
      <div className="param-value">
        {displayValue}
        {displayUnit && <span className="param-unit">{displayUnit}</span>}
      </div>
    </div>
  )
}
