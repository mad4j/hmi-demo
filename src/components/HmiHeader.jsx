import { StatusIconBar } from './StatusIconBar.jsx'
import { IconCommState } from './icons/IconCommState.jsx'
import { useHeaderState } from '../hooks/useHeaderState.js'
import { useMenuNavigation } from '../hooks/useMenuNavigation.js'
import { sendCommand } from '../hooks/useEquipmentGateway.js'
import './HmiHeader.css'

const COMM_LABEL = {
  'tx':            'TX – Transmitting',
  'rx':            'RX – Receiving',
  'idle-ct':       'IDLE – Secure (CT)',
  'idle-pt':       'IDLE – Plain Text (PT)',
  'radio-silence': 'RADIO SILENCE',
}

export const HmiHeader = () => {
  const {
    activeWaveformName,
    activePresetName,
    activeChannelLabel,
    cryptoAlgorithm,
    cryptoContext,
    commIconVariant,
    missionTimeTod,
  } = useHeaderState()

  const { navigateToPage } = useMenuNavigation()

  const triggerEmergencyZeroization = async () => {
    await sendCommand('KEY_ZEROIZE')
  }

  return (
    <header className="bar top-bar">
      {/* Comm icon – far left */}
      <button
        className={`comm-icon-wrap comm--${commIconVariant}`}
        title={COMM_LABEL[commIconVariant]}
        aria-label={COMM_LABEL[commIconVariant]}
        type="button"
        onClick={() => navigateToPage('waveform-attiva')}
      >
        <IconCommState variant={commIconVariant} size={30} />
      </button>

      {/* Zone 0b: Dedicated channel area */}
      <div className="zone zone-channel" aria-label="Active channel">
        <span className="channel-value">{activeChannelLabel}</span>
      </div>

      {/* Zone 1: Active waveform/preset */}
      <div className="zone zone-identity-wrap">
        <button className="zone zone-identity" type="button" onClick={() => navigateToPage('waveform-attiva')}>
          <span className="waveform-name">{activeWaveformName}</span>
          <span className="preset-name">{activePresetName}</span>
        </button>
      </div>

      {/* Zone 2: Crypto info */}
      <div className="zone zone-crypto" aria-label="Crypto state">
        <div className="crypto-main-row">
          <span className="crypto-algo">{cryptoAlgorithm}</span>
        </div>
        <span className={`crypto-ctx ctx--${(cryptoContext ?? '').toLowerCase()}`}>{cryptoContext}</span>
      </div>

      {/* Zone 2b: Emergency zeroization */}
      <div className="zone zone-zeroize-area" aria-label="Zeroization area">
        <button
          className="zone-zeroize si-btn si--error"
          type="button"
          title="Emergency zeroization"
          aria-label="Emergency zeroization"
          onClick={triggerEmergencyZeroization}
        >
          <span className="zeroize-symbol" aria-hidden="true">Z</span>
        </button>
      </div>

      {/* Zone 3: Status icons */}
      <div className="zone zone-status">
        <StatusIconBar />
      </div>

      {/* Zone 4: Mission time – far right */}
      <div className="zone zone-time" aria-label="Mission time">
        <span className="time-value">{missionTimeTod}</span>
      </div>
    </header>
  )
}
