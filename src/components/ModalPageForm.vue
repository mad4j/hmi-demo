<script setup>
import { reactive, watch } from 'vue'
import { useParameterStore } from '../composables/useParameterStore.js'

const props = defineProps({
  /** The current menu page object (with parameters and modal: true). */
  page: {
    type: Object,
    required: true,
  },
})

const { parameterValues, sendBatchCommands } = useParameterStore()

// ── Local draft ───────────────────────────────────────────
// Holds uncommitted edits until the user clicks "Invia".
// Readonly parameters are excluded – they are only displayed.
const draftValues = reactive({})

const initDraft = () => {
  props.page.parameters.forEach((p) => {
    draftValues[p.id] = parameterValues[p.id]
  })
}

initDraft()

// Re-initialise draft whenever the user navigates to a different page.
watch(() => props.page.id, initDraft)

// ── Actions ───────────────────────────────────────────────
const handleReset = () => initDraft()

const handleSubmit = async () => {
  const updates = {}
  props.page.parameters.forEach((p) => {
    if (!p.readonly) updates[p.id] = draftValues[p.id]
  })
  await sendBatchCommands(updates)
}

// ── Display helpers ───────────────────────────────────────
const formatReadonlyValue = (param, value) => {
  if (value === null || value === undefined) return '—'
  if (param.type === 'percentage') {
    const n = Number(value)
    return Number.isNaN(n) ? '—' : `${param.precision !== null ? n.toFixed(param.precision) : n}%`
  }
  if (param.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return '—'
    const fmt = param.precision !== null ? n.toFixed(param.precision) : String(value)
    return param.unit ? `${fmt} ${param.unit}` : fmt
  }
  if (param.type === 'boolean') return value ? 'ON' : 'OFF'
  return String(value)
}

// Number input step derived from precision (e.g. precision 1 → step 0.1)
const numberStep = (param) =>
  param.precision !== null ? Math.pow(10, -param.precision) : 1
</script>

<template>
  <form class="modal-form" novalidate @submit.prevent="handleSubmit">
    <div class="form-fields">
      <div
        v-for="param in page.parameters"
        :key="param.id"
        class="form-row"
        :class="{ 'form-row--readonly': param.readonly }"
      >
        <!-- Label -->
        <label class="form-label" :for="`mp-${param.id}`">
          {{ param.name }}
          <span v-if="param.unit" class="form-unit">({{ param.unit }})</span>
          <svg
            v-if="param.readonly"
            class="readonly-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </label>

        <!-- Readonly: value display only -->
        <div
          v-if="param.readonly"
          :id="`mp-${param.id}`"
          class="form-value-readonly"
          aria-readonly="true"
        >
          {{ formatReadonlyValue(param, parameterValues[param.id]) }}
        </div>

        <!-- Boolean: toggle button -->
        <button
          v-else-if="param.type === 'boolean'"
          :id="`mp-${param.id}`"
          type="button"
          class="form-toggle"
          :class="{ 'form-toggle--on': draftValues[param.id] }"
          :aria-pressed="String(!!draftValues[param.id])"
          @click="draftValues[param.id] = !draftValues[param.id]"
        >
          {{ draftValues[param.id] ? 'ON' : 'OFF' }}
        </button>

        <!-- Enum: select dropdown -->
        <select
          v-else-if="param.type === 'enum'"
          :id="`mp-${param.id}`"
          v-model="draftValues[param.id]"
          class="form-select"
        >
          <option v-for="opt in param.options" :key="opt" :value="opt">{{ opt }}</option>
        </select>

        <!-- Percentage: range slider + numeric readout -->
        <div
          v-else-if="param.type === 'percentage'"
          :id="`mp-${param.id}`"
          class="form-slider-row"
        >
          <input
            type="range"
            class="form-slider"
            :aria-label="param.name"
            v-model.number="draftValues[param.id]"
            min="0"
            max="100"
            step="1"
          />
          <span class="form-slider-value">{{ draftValues[param.id] ?? 0 }}%</span>
        </div>

        <!-- Number: numeric input -->
        <input
          v-else-if="param.type === 'number'"
          :id="`mp-${param.id}`"
          v-model.number="draftValues[param.id]"
          class="form-input"
          type="number"
          :step="numberStep(param)"
        />
      </div>
    </div>

    <!-- Action bar -->
    <div class="form-actions">
      <button class="form-btn form-btn--reset" type="button" @click="handleReset">
        Reset
      </button>
      <button class="form-btn form-btn--submit" type="submit">
        Invia
      </button>
    </div>
  </form>
</template>

<style scoped>
/* ── Form container ──────────────────────────────────────── */
.modal-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
}

/* ── Field rows ──────────────────────────────────────────── */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  background: var(--bg-btn);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  transition: background 0.25s, border-color 0.25s;
}

.form-row--readonly {
  opacity: 0.75;
}

/* ── Label ───────────────────────────────────────────────── */
.form-label {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-unit {
  font-size: 0.65rem;
  opacity: 0.75;
}

.readonly-icon {
  width: 0.6rem;
  height: 0.6rem;
  opacity: 0.6;
  flex-shrink: 0;
}

/* ── Readonly value ──────────────────────────────────────── */
.form-value-readonly {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
  white-space: nowrap;
}

/* ── Boolean toggle button ───────────────────────────────── */
.form-toggle {
  min-width: 3.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-main);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  touch-action: manipulation;
}

.form-toggle--on {
  background: var(--active-name-bg);
  border-color: var(--active-name-border);
  color: var(--active-text);
}

/* ── Enum select ─────────────────────────────────────────── */
.form-select {
  padding: 0.25rem 0.4rem;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  color: var(--text-blue);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.form-select:focus {
  border-color: var(--btn-active-border);
}

/* ── Percentage slider ───────────────────────────────────── */
.form-slider-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-slider {
  flex: 1;
  accent-color: var(--text-blue);
  min-width: 4rem;
  cursor: pointer;
}

.form-slider-value {
  min-width: 2.5rem;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-blue);
}

/* ── Number input ────────────────────────────────────────── */
.form-input {
  width: 5rem;
  padding: 0.25rem 0.4rem;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: right;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: var(--btn-active-border);
}

/* ── Action bar ──────────────────────────────────────────── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.form-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid var(--border);
  touch-action: manipulation;
  transition: background 0.12s, border-color 0.12s, opacity 0.12s;
}

.form-btn--reset {
  background: var(--bg-btn);
  color: var(--text-secondary);
}

.form-btn--reset:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.form-btn--submit {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
  color: var(--text-blue);
}

.form-btn--submit:active {
  opacity: 0.75;
}
</style>
