import { useEffect, useRef } from 'react'
import './CriticalAlertModal.css'

export default function CriticalAlertModal({ message, onAcknowledge }) {
  const acknowledgeButtonRef = useRef(null)

  useEffect(() => {
    acknowledgeButtonRef.current?.focus()
  }, [])

  return (
    <div className="critical-alert-backdrop">
      <div className="critical-alert-modal" role="alertdialog" aria-modal="true" aria-labelledby="critical-alert-title" aria-describedby="critical-alert-message">
        <div className="critical-alert-header" id="critical-alert-title">Critical Alert</div>
        <div className="critical-alert-body">
          <p className="critical-alert-message" id="critical-alert-message">{message}</p>
        </div>
        <div className="critical-alert-footer">
          <button
            ref={acknowledgeButtonRef}
            className="critical-alert-button"
            type="button"
            onClick={onAcknowledge}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}