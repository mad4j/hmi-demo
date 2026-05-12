import './HmiHeader.css'
import StatusIconBar from './StatusIconBar.jsx'
import IconCommState from './icons/IconCommState.jsx'
import { useHeaderState } from '../composables/useHeaderState.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'
import { useEquipmentGateway } from '../composables/useEquipmentGateway.js'

const commLabel = {
  'tx': 'TX – Transmitting',
  'rx': 'RX – Receiving',
  'idle-ct': 'IDLE – Secure (CT)',
  'idle-pt': 'IDLE – Plain Text (PT)',
  'radio-silence': 'RADIO SILENCE',
}

export default function HmiHeader() {
  const { activeWaveformName, activePresetName, activeChannelLabel, cryptoAlgorithm, cryptoContext, commIconVariant, missionTimeTod } = useHeaderState()
  const { navigateToPage } = useMenuNavigation()
  const { sendCommand } = useEquipmentGateway()

  const triggerEmergencyZeroization = async () => { await sendCommand('KEY_ZEROIZE') }

  return (
    <header className="bar top-bar">
      <button
        className={`comm-icon-wrap comm--${commIconVariant}`}
        title={commLabel[commIconVariant]}
        aria-label={commLabel[commIconVariant]}
        type="button"
        onClick={() => navigateToPage('waveform-attiva')}
      >
        <IconCommState variant={commIconVariant} size={30} />
      </button>

      <div className="zone zone-channel" aria-label="Active channel">
        <span className="channel-value">{activeChannelLabel}</span>
      </div>

      <div className="zone zone-identity-wrap">
        <button className="zone zone-identity" type="button" onClick={() => navigateToPage('waveform-attiva')}>
          <span className="waveform-name">{activeWaveformName}</span>
          <span className="preset-name">{activePresetName}</span>
        </button>
      </div>

      <div className="zone zone-crypto" aria-label="Crypto state">
        <div className="crypto-main-row">
          <span className="crypto-algo">{cryptoAlgorithm}</span>
        </div>
        <span className={`crypto-ctx ctx--${(cryptoContext ?? '').toLowerCase()}`}>{cryptoContext}</span>
      </div>

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

      <div className="zone zone-status">
        <StatusIconBar />
      </div>

      <div className="zone zone-time" aria-label="Mission time">
        <span className="time-value">{missionTimeTod}</span>
      </div>
    </header>
  )
}
