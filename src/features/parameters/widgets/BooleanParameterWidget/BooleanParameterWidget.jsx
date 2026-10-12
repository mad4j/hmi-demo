import '../parameterWidget.css'
import IconLock from '@/icons/IconLock.jsx'

export default function BooleanParameterWidget({ name, value, readonly = false, modified = false, onToggle }) {
  const isActive = Boolean(value)
  const isClickable = !readonly
  const displayValue = value === null || value === undefined ? '—' : (value ? 'ON' : 'OFF')

  const handleClick = () => {
    if (isClickable) onToggle?.()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() }
  }

  const classes = [
    'param-widget',
    'param-widget--boolean',
    isActive ? 'param-widget--active' : '',
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
      aria-pressed={isActive}
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
