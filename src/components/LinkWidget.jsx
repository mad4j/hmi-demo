import { AppIcon } from './AppIcon.jsx'
import './LinkWidget.css'

export const LinkWidget = ({ label, icon = '', active = false, onNavigate }) => {
  const handleClick = () => {
    onNavigate?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNavigate?.()
    }
  }

  return (
    <div
      className={`link-widget ${active ? 'link-widget--active' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={active}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="link-icon">
        {icon ? (
          <AppIcon name={icon} size={28} />
        ) : (
          <span className="link-icon-arrow">›</span>
        )}
      </div>
      <div className="link-label">{label}</div>
    </div>
  )
}