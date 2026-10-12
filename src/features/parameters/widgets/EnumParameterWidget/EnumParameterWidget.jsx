import '../parameterWidget.css'
import IconLock from '@/icons/IconLock.jsx'

function getLabelFromValue(value, optionsValue, labels, isOnOff) {
  const comparable = isOnOff ? (value == true ? 1 : 0) : value
  const index = optionsValue.findIndex((u) => u == comparable)
  return index !== -1 ? labels[index] : ''
}

export default function EnumParameterWidget({ name, value, options = [], optionsValue = [], readonly = false, modified = false, onEdit }) {
  const isOnOffEnum =
    Array.isArray(options) &&
    Array.isArray(optionsValue) &&
    options.length === 2 &&
    optionsValue.length === 2 &&
    options.includes('ON') &&
    options.includes('OFF')

  const displayValue = value === null || value === undefined
    ? '—'
    : String(getLabelFromValue(value, optionsValue, options, isOnOffEnum))
  const isClickable = !readonly && options.length > 0

  const handleClick = () => {
    if (isClickable) onEdit?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const classes = [
    'param-widget',
    'param-widget--enum',
    isClickable ? 'param-widget--clickable' : '',
    readonly ? 'param-widget--readonly' : '',
    modified ? 'param-widget--modified' : '',
    isOnOffEnum && value ? 'param-widget--on' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? name : undefined}
      aria-readonly={readonly || undefined}
      onClick={handleClick}
      onKeyDown={isClickable ? handleKey : undefined}
    >
      <div className="param-name" title={name}>
        {readonly && <IconLock size={14} />}
        {name}
      </div>
      <div className="param-value">{displayValue}</div>
    </div>
  )
}
