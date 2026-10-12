import './HmiNotificationBar.css'

export default function HmiNotificationBar({ Icon, message, pendingCount = 0, barClasses = [], onTap }) {
  return (
    <div
      className={['notification-bar', ...barClasses].join(' ')}
      role="status"
      aria-live="polite"
      onClick={onTap}
    >
      <Icon size={16} />
      <span className="notification-message">{message}</span>
      {pendingCount > 0 && (
        <span className="notification-count" aria-label="Queued messages">{pendingCount}</span>
      )}
    </div>
  )
}
