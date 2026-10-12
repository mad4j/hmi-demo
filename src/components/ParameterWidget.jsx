import './ParameterWidget.css'
import IconLock from './icons/IconLock.jsx'

const getLabelFromValue = (value, optionsVal, labels, onOff) => {
  if ( onOff )
    value = value == true ? 1 : 0;
  const index = optionsVal.findIndex(u => u == value)
  let res = index !== -1 ? labels[index] : '';
  return res;
};
  
function getDisplayValue(value, type, precision, optionsVal, labels, onOff) {
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
  if(type == 'enum')
  {
   
    return String(getLabelFromValue(value,optionsVal,labels, onOff))
  }
  return String(value ?? '—')
}

function getDisplayUnit(type, unit) {
  if (type === 'percentage') return '%'
  if (type === 'number' && unit) return unit
  return ''
}

export default function ParameterWidget({ name, value, type = 'number', unit = '', precision = null, options = [], optionsValue =[], readonly = false, modified = false, onToggle, onEdit }) {
  const isOnOffEnum =
  type === 'enum' &&
  Array.isArray(options) &&
  Array.isArray(optionsValue) &&
  options.length === 2 &&
  optionsValue.length === 2 &&
  options.includes('ON') &&
  options.includes('OFF')
  const displayValue = getDisplayValue(value, type, precision, optionsValue, options, isOnOffEnum)
  const displayUnit = getDisplayUnit(type, unit)
  const isActive = type === 'boolean' && Boolean(value)
  const isClickable = !readonly && (
    type === 'boolean' || type === 'percentage' || type === 'text' || type == 'number' ||
    type === 'date' || type === 'password' || (type === 'enum' && options.length > 0)
  )

  const isOn = 
  isOnOffEnum && value

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
  isOnOffEnum && isOn ? 'param-widget--on' : '',
]
  .filter(Boolean)
  .join(' ')

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
      <div className="param-name" title={name}>
                {readonly && <IconLock size={14} />}
        {name}

      </div>
      <div className="param-value">
        {displayValue}
        {displayUnit && <span className="param-unit">{displayUnit}</span>}
      </div>
    </div>
  )
}
