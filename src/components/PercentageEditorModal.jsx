import { useState, useMemo, useRef } from 'react'
import './PercentageEditorModal.css'

const TICK_INTERVAL = 5

export default function PercentageEditorModal({ name, value, min = 0, max = 100, step = 1, onConfirm, onCancel, onConfirmAndNext }) {
  const [localValue, setLocalValue] = useState(Math.round(Number(value) || 0))

  const ticks = useMemo(() => {
    const marks = []
    for (let v = min; v <= max; v += TICK_INTERVAL) marks.push(v)
    return marks
  }, [min, max])

  const snapToMark = () => {
    setLocalValue((v) => {
      const snapped = Math.round(v / TICK_INTERVAL) * TICK_INTERVAL
      return Math.max(min, Math.min(max, snapped))
    })
  }

  const lastVibratedAtRef = useRef(null)
  const handleSliderInput = (e) => {
    const v = Number(e.target.value)
    setLocalValue(v)
    if ('vibrate' in navigator && v % TICK_INTERVAL === 0 && v !== lastVibratedAtRef.current) {
      navigator.vibrate(10)
      lastVibratedAtRef.current = v
    }
  }

  const handleKeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onConfirm(localValue) }
    else if (e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); onConfirmAndNext?.(localValue) }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" role="dialog" aria-label={`Edit ${name}`} aria-modal="true" onKeyDown={handleKeydown}>
        <div className="modal-header">{name}</div>
        <div className="modal-body">
          <div className="value-display" aria-live="polite" aria-atomic="true">{localValue}%</div>
          <div className="slider-wrapper">
            <input
              className="slider"
              type="range"
              min={min} max={max} step={step}
              value={localValue}
              aria-label="Percentage value"
              onChange={handleSliderInput}
              onMouseUp={snapToMark}
              onTouchEnd={snapToMark}
            />
            <div className="ticks" aria-hidden="true">
              {ticks.map((tick) => (
                <span key={tick} className={`tick${tick % 10 === 0 ? ' major' : ''}`} />
              ))}
            </div>
          </div>
          <div className="stepper">
            <button className="step-btn" type="button" disabled={localValue <= min} aria-label="Decrease" onClick={() => setLocalValue((v) => Math.max(min, v - step))}>−</button>
            <button className="step-btn" type="button" disabled={localValue >= max} aria-label="Increase" onClick={() => setLocalValue((v) => Math.min(max, v + step))}>+</button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" type="button" aria-label="Cancel" onClick={onCancel}>✕</button>
          <button className="btn btn-confirm" type="button" aria-label="Confirm" onClick={() => onConfirm(localValue)}>✓</button>
        </div>
      </div>
    </div>
  )
}
