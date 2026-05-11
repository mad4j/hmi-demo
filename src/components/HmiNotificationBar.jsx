import { AppIcon } from './AppIcon.jsx'
import './HmiNotificationBar.css'

export const HmiNotificationBar = ({ 
  icon, 
  message, 
  pendingCount = 0, 
  barClasses = [],
  onTap 
}) => {
  return (
    <div
      className={`notification-bar ${barClasses.join(' ')}`}
      role="status"
      aria-live="polite"
      onClick={onTap}
    >
      <AppIcon name={icon} size={16} className="notification-icon" aria-hidden="true" />
      <span className="notification-message">{message}</span>
      {pendingCount > 0 && (
        <span
          className="notification-count"
          aria-label="Queued messages"
        >
          {pendingCount}
        </span>
      )}
    </div>
  )
}