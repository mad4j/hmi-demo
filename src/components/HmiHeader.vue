<script setup>
import StatusIconBar from './StatusIconBar.vue'
import IconCommState from './icons/IconCommState.vue'
import AppIcon from './AppIcon.vue'
import { useHeaderState } from '../composables/useHeaderState.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'
import { useEquipmentGateway } from '../composables/useEquipmentGateway.js'

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

const triggerEmergencyZeroization = async () => {
  await sendCommand('KEY_ZEROIZE')
}

const commLabel = {
  'tx':            'TX – Transmitting',
  'rx':            'RX – Receiving',
  'idle-ct':       'IDLE – Secure (CT)',
  'idle-pt':       'IDLE – Plain Text (PT)',
  'radio-silence': 'RADIO SILENCE',
}
</script>

<template>
  <header class="bar top-bar">

    <!-- Comm icon – far left -->
    <button
      class="comm-icon-wrap"
      :class="`comm--${commIconVariant}`"
      :title="commLabel[commIconVariant]"
      :aria-label="commLabel[commIconVariant]"
      type="button"
      @click="navigateToPage('waveform-attiva')"
    >
      <IconCommState :variant="commIconVariant" :size="24" />
    </button>

    <!-- Zone 0b: Dedicated channel area -->
    <div class="zone zone-channel" aria-label="Active channel">
      <span class="channel-value">{{ activeChannelLabel }}</span>
    </div>

    <!-- Zone 1: Active waveform/preset (button fills remaining space) -->
    <div class="zone zone-identity-wrap">
      <button class="zone zone-identity" type="button" @click="navigateToPage('waveform-attiva')">
        <span class="waveform-name">{{ activeWaveformName }}</span>
        <span class="preset-name">{{ activePresetName }}</span>
      </button>
    </div>

    

    <!-- Zone 2: Crypto info (2 rows: algo / ctx badge) -->
    <div class="zone zone-crypto" aria-label="Crypto state">
      <div class="crypto-main-row">
        <span class="crypto-algo">{{ cryptoAlgorithm }}</span>
      </div>
      <span class="crypto-ctx" :class="`ctx--${(cryptoContext ?? '').toLowerCase()}`">{{ cryptoContext }}</span>
    </div>

    <!-- Zone 2b: Emergency zeroization -->
    <button
      class="zone zone-zeroize si-btn si--error"
      type="button"
      title="Emergency zeroization"
      aria-label="Emergency zeroization"
      @click="triggerEmergencyZeroization"
    >
      <AppIcon name="reset" :size="22" />
    </button>

    <!-- Zone 3: Status icons -->
    <div class="zone zone-status">
      <StatusIconBar />
    </div>

    <!-- Zone 4: Mission time – far right -->
    <div class="zone zone-time" aria-label="Mission time">
      <span class="time-value">{{ missionTimeTod }}</span>
    </div>

  </header>
</template>

<style scoped>
.bar {
  display: grid;
  grid-template-columns: auto auto 1fr auto auto auto auto;
  align-items: center;
  gap: 0;
  padding: 0 0.5rem 0 0;
  height: 3.5rem;
  box-sizing: border-box;
  background: var(--bg-bar);
  border-bottom: 1px solid var(--border);
  transition: background 0.25s, border-color 0.25s;
}

/* ── Zone shared ── */
.zone {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
}

/* ── Zone 1: Identity (button, reset styles) ── */
.zone-identity-wrap {
  display: flex;
  align-items: stretch;
  min-width: 0;
  height: 100%;
  border-right: 1px solid var(--border);
}

.zone-identity {
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  line-height: 1.2;
  padding: 0 0.6rem;
  height: 100%;
  /* button reset */
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.zone-identity:hover {
  background: var(--btn-active-bg);
}

.zone-identity:active {
  background: var(--btn-active-bg);
  opacity: 0.8;
}

.waveform-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
}

.preset-name {
  font-size: 0.875rem;
  color: var(--text-blue);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
}

/* ── Zone 2: Crypto ── */
.zone-crypto {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  line-height: 1.2;
  padding: 0 0.65rem;
  border-right: 1px solid var(--border);
}

.crypto-main-row {
  display: flex;
  align-items: baseline;
  gap: 0.18rem;
  font-size: 0.875rem;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.crypto-algo {
  font-weight: 700;
  color: var(--text-primary);
}

.zone-zeroize {
  padding: 0;
  margin: 0 0.12rem;
}

.si-btn {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.35rem;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.si-btn:active {
  background: var(--btn-active-bg);
}

.si--error {
  color: var(--status-critical-color);
  border-color: var(--status-critical-border);
  background: var(--status-critical-bg);
}

.zone-channel {
  justify-content: center;
  height: 100%;
  min-width: 3.2rem;
  padding: 0 0.4rem;
  border-right: 1px solid var(--border);
}

.channel-value {
  font-weight: 700;
  font-size: 1.0rem;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  color: var(--text-primary);
  white-space: nowrap;
  letter-spacing: 0.04em;
  line-height: 1;
}

.zone-zeroize:hover {
  background: var(--btn-active-bg);
}

.zone-zeroize:active {
  opacity: 0.82;
}

.crypto-ctx {
  font-weight: 700;
  font-size: 0.875rem;
  font-family: ui-monospace, 'Cascadia Code', monospace;
  border-radius: 0.2rem;
  padding: 0 0.3rem;
  line-height: 1.5;
}

.ctx--nato {
  background: rgba(56, 139, 253, 0.15);
  color: var(--text-blue);
  border: 1px solid rgba(56, 139, 253, 0.3);
}

.ctx--naz {
  background: rgba(63, 185, 80, 0.12);
  color: var(--text-green);
  border: 1px solid rgba(63, 185, 80, 0.3);
}

/* ── Zone 3: Status icons ── */
.zone-status {
  justify-content: flex-end;
  padding-left: 0;
}

/* ── Zone 4: Mission time (TOD) ── */
.zone-time {
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding: 0 0.4rem 0 0.35rem;
  border-left: 1px solid var(--border);
  font-family: ui-monospace, 'Cascadia Code', monospace;
}

.time-main-row {
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  line-height: 1;
}

.time-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1;
  white-space: nowrap;
}

.time-zone {
  color: var(--text-secondary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.time-label {
  margin-top: 0.08rem;
  color: var(--text-secondary);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  line-height: 1;
  align-self: center;
  text-align: center;
}

/* ── Comm icon button – far left ── */
.comm-icon-wrap {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 100%;
  border-radius: 0;
  border: none;
  border-right: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

/* Comm state colours */
.comm--idle-ct {
  color: var(--text-green);
  background: var(--status-ok-bg);
}

.comm--idle-pt {
  color: var(--status-warning-color);
  background: var(--status-warning-bg);
}

.comm--tx {
  color: var(--text-blue);
  background: var(--btn-active-bg);
}

.comm--rx {
  color: var(--text-green);
  background: var(--active-name-bg);
}

.comm--radio-silence {
  color: var(--status-critical-color);
  background: var(--status-critical-bg);
  animation: blink-bg 1s step-start infinite;
}

@keyframes blink-bg {
  50% { background: transparent; }
}
</style>

