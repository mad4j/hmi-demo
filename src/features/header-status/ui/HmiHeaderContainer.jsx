import HmiHeader from './HmiHeader.jsx'
import { useHeaderState } from '../hooks/useHeaderState.js'
import { useMenuNavigation } from '@features/navigation'
import { createEquipmentGateway } from '@core/gateway/equipmentGateway.js'

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
  const { sendCommand } = createEquipmentGateway()

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
