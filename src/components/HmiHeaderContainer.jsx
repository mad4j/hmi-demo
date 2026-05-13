import HmiHeader from './HmiHeader.jsx'
import { useHeaderState } from '../composables/useHeaderState.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'
import { useEquipmentGateway } from '../composables/useEquipmentGateway.js'

export default function HmiHeaderContainer() {
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
  const { sendCommand } = useEquipmentGateway()

  return (
    <HmiHeader
      activeWaveformName={activeWaveformName}
      activePresetName={activePresetName}
      activeChannelLabel={activeChannelLabel}
      cryptoAlgorithm={cryptoAlgorithm}
      cryptoContext={cryptoContext}
      commIconVariant={commIconVariant}
      missionTimeTod={missionTimeTod}
      onNavigateToWaveform={() => navigateToPage('waveform-attiva')}
      onZeroize={() => sendCommand('KEY_ZEROIZE')}
    />
  )
}
