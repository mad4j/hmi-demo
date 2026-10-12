import HmiHeader from './HmiHeader.jsx'
import { useHeaderState } from '../composables/useHeaderState.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'
import { useRadioGateway } from '../composables/useRadioGateway.js'

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
  const { sendCommand,getRadioChannels } = useRadioGateway()

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
      getRadioChannels ={getRadioChannels}
      onZeroize={() => sendCommand('KEY_ZEROIZE')}
    />
  )
}
