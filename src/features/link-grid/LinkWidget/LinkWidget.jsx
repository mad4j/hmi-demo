import './LinkWidget.css'
import AppIcon from './AppIcon.jsx'

export default function LinkWidget({ label, icon = '', active = false, onNavigate }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate?.() }
  }
  return (
    <div
      className={`link-widget${active ? ' link-widget--active' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={active}
      onClick={onNavigate}
      onKeyDown={handleKey}
    >
      <div className="link-icon">
        {icon ? <AppIcon name={icon} size={28} /> : <span className="link-icon-arrow">›</span>}
      </div>
      <div className="link-label">{label}</div>
    </div>
  )
}
