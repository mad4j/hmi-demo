import '../parameterWidget.css'
import IconLock from '@/icons/IconLock.jsx'

function getDisplayValue(value) {
  if (value === null || value === undefined) return '—'
  const raw = String(value).trim()
  if (!raw) return '—'
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
  if (Number.isNaN(parsed.getTime())) return '—'
  return new Intl.DateTimeFormat('it-IT').format(parsed)
}

export default function DateParameterWidget({ name, value, readonly = false, modified = false, onEdit }) {
  const isClickable = !readonly
  const displayValue = getDisplayValue(value)

  const handleClick = () => {
    if (isClickable) onEdit?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const classes = [
    'param-widget',
    'param-widget--date',
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
      <div className="param-value">{displayValue}</div>
    </div>
  )
}
