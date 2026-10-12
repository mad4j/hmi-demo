import '../parameterWidget.css'
import IconLock from '@/icons/IconLock.jsx'

// Read-only display for parameter types without a dedicated editor (string, textarea, button).
export default function PlainParameterWidget({ name, value, type = 'string', readonly = false, modified = false }) {
  const displayValue = value === null || value === undefined ? '—' : String(value)

  const classes = [
    'param-widget',
    `param-widget--${type}`,
    readonly ? 'param-widget--readonly' : '',
    modified ? 'param-widget--modified' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-readonly={readonly || undefined}>
      <div className="param-name" title={name}>
        {readonly && <IconLock size={14} />}
        {name}
      </div>
      <div className="param-value">{displayValue}</div>
    </div>
  )
}
