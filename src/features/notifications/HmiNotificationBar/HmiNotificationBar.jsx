import './HmiNotificationBar.css'
import AppIcon from './AppIcon.jsx'

export default function HmiNotificationBar({ icon, message, pendingCount = 0, barClasses = [], onTap }) {
  return (
    <div
      className={['notification-bar', ...barClasses].join(' ')}
      role="status"
      aria-live="polite"
      onClick={onTap}
    >
      <AppIcon name={icon} size={16} />
      <span className="notification-message">{message}</span>
      {pendingCount > 0 && (
        <span className="notification-count" aria-label="Queued messages">{pendingCount}</span>
      )}
    </div>
  )
}
