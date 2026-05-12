<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['confirm', 'cancel', 'confirm-and-next'])

const localValue = ref(Math.round(Number(props.value) || 0))

watch(
  () => props.value,
  (v) => {
    localValue.value = Math.round(Number(v) || 0)
  },
)

const decrement = () => {
  localValue.value = Math.max(props.min, localValue.value - props.step)
}

const increment = () => {
  localValue.value = Math.min(props.max, localValue.value + props.step)
}

const handleConfirm = () => emit('confirm', localValue.value)
const handleCancel = () => emit('cancel')

const handleKeydown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    handleConfirm()
  } else if (e.key === 'Tab') {
    e.preventDefault()
    e.stopPropagation()
    emit('confirm-and-next', localValue.value)
  }
}

// Tick marks at every 5 units (minor) and every 10 units (major)
const TICK_INTERVAL = 5

const ticks = computed(() => {
  const marks = []
  for (let v = props.min; v <= props.max; v += TICK_INTERVAL) {
    marks.push(v)
  }
  return marks
})

// Snap to nearest TICK_INTERVAL on slider release
const snapToMark = () => {
  const snapped = Math.round(localValue.value / TICK_INTERVAL) * TICK_INTERVAL
  localValue.value = Math.max(props.min, Math.min(props.max, snapped))
}

// Haptic feedback when crossing a tick mark
let lastVibratedAt = null
const handleSliderInput = () => {
  if ('vibrate' in navigator && localValue.value % TICK_INTERVAL === 0 && localValue.value !== lastVibratedAt) {
    navigator.vibrate(10)
    lastVibratedAt = localValue.value
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div
      class="modal"
      role="dialog"
      :aria-label="`Edit ${name}`"
      aria-modal="true"
      @keydown="handleKeydown"
    >
      <div class="modal-header">{{ name }}</div>

      <div class="modal-body">
        <div class="value-display" aria-live="polite" aria-atomic="true">
          {{ localValue }}%
        </div>

        <div class="slider-wrapper">
          <input
            class="slider"
            type="range"
            :min="min"
            :max="max"
            :step="step"
            v-model.number="localValue"
            aria-label="Percentage value"
            @input="handleSliderInput"
            @change="snapToMark"
            @mouseup="snapToMark"
            @touchend="snapToMark"
          />
          <div class="ticks" aria-hidden="true">
            <span
              v-for="tick in ticks"
              :key="tick"
              class="tick"
              :class="{ major: tick % 10 === 0 }"
            ></span>
          </div>
        </div>

        <div class="stepper">
          <button
            class="step-btn"
            type="button"
            :disabled="localValue <= min"
            aria-label="Decrease"
            @click="decrement"
          >
            −
          </button>
          <button
            class="step-btn"
            type="button"
            :disabled="localValue >= max"
            aria-label="Increase"
            @click="increment"
          >
            +
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" aria-label="Cancel" title="Cancel" @click="handleCancel">✕</button>
        <button class="btn btn-confirm" type="button" aria-label="Confirm" title="Confirm" @click="handleConfirm">✓</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Backdrop ────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  padding: 1rem;
}

/* ── Modal panel ─────────────────────────────────────────── */
.modal {
  display: flex;
  flex-direction: column;
  width: min(22rem, 100%);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--bg-main);
  color: var(--text-primary);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

/* ── Header ──────────────────────────────────────────────── */
.modal-header {
  padding: 0.55rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  background: var(--bg-bar);
}

/* ── Body ────────────────────────────────────────────────── */
.modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.25rem 0.75rem;
}

.value-display {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--text-blue);
  min-width: 5ch;
  text-align: center;
}

/* ── Slider ──────────────────────────────────────────────── */
.slider-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  --thumb-size: 1rem;
}

.slider {
  width: 100%;
  accent-color: var(--text-blue);
  cursor: pointer;
  height: 0.4rem;
}

.slider::-webkit-slider-thumb {
  width: var(--thumb-size);
  height: var(--thumb-size);
}

.slider::-moz-range-thumb {
  width: var(--thumb-size);
  height: var(--thumb-size);
}

/* ── Tick marks ──────────────────────────────────────────── */
.ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 calc(var(--thumb-size) / 2);
  margin-top: 0.25rem;
}

.tick {
  width: 1px;
  height: 5px;
  background: var(--text-secondary);
  opacity: 0.4;
  flex-shrink: 0;
}

.tick.major {
  height: 9px;
  opacity: 0.75;
}

/* ── Stepper buttons ─────────────────────────────────────── */
.stepper {
  display: flex;
  gap: 0.75rem;
}

.step-btn {
  width: 3.2rem;
  height: 3.2rem;
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s;
  touch-action: manipulation;
  user-select: none;
}

.step-btn:active:not(:disabled) {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.step-btn:disabled {
  opacity: 0.35;
  filter: saturate(0.45);
}

/* ── Footer ──────────────────────────────────────────────── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
  background: var(--bg-bar);
}

.btn {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--btn-active-border) 18%, var(--bg-btn));
  transition: background 0.12s, border-color 0.12s;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-cancel {
  background: var(--bg-btn);
  color: var(--text-secondary);
}

.btn-cancel:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.btn-confirm {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
  color: var(--text-blue);
}

.btn-confirm:active {
  opacity: 0.8;
}
</style>
