import '../parameterWidget.css'
import IconLock from '@/icons/IconLock.jsx'

function getDisplayValue(value, precision) {
  if (value === null || value === undefined) return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return precision !== null && precision !== undefined ? num.toFixed(precision) : String(value)
}

export default function PercentageParameterWidget({ name, value, precision = null, readonly = false, modified = false, onEdit }) {
  const isClickable = !readonly
  const displayValue = getDisplayValue(value, precision)

  const handleClick = () => {
    if (isClickable) onEdit?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const classes = [
    'param-widget',
    'param-widget--percentage',
    isClickable ? 'param-widget--clickable' : '',
    readonly ? 'param-widget--readonly' : '',
    modified ? 'param-widget--modified' : '',
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
      <div className="param-value">
        {displayValue}
        <span className="param-unit">%</span>
      </div>
    </div>
  )
}
