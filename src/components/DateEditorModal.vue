<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '',
  },
})

const emit = defineEmits(['confirm', 'cancel', 'confirm-and-next'])

const toInputDate = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''

  const yyyy = parsed.getFullYear()
  const mm = String(parsed.getMonth() + 1).padStart(2, '0')
  const dd = String(parsed.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const localValue = ref(toInputDate(props.value))

watch(
  () => props.value,
  (v) => {
    localValue.value = toInputDate(v)
  },
)

const handleConfirm = () => emit('confirm', localValue.value)
const handleCancel = () => emit('cancel')
const handleConfirmAndNext = () => emit('confirm-and-next', localValue.value)
</script>

<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div class="modal" role="dialog" :aria-label="`Edit ${name}`" aria-modal="true">
      <div class="modal-header">{{ name }}</div>

      <div class="modal-body">
        <input
          v-model="localValue"
          class="date-input"
          type="date"
          :aria-label="name"
          @keydown.enter.prevent.stop="handleConfirm"
          @keydown.tab.prevent.stop="handleConfirmAndNext"
        />
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" aria-label="Cancel" title="Cancel" @click="handleCancel">✕</button>
        <button class="btn btn-confirm" type="button" aria-label="Confirm" title="Confirm" @click="handleConfirm">✓</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.modal-body {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
}

.date-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  transition: border-color 0.12s, background 0.12s;
  box-sizing: border-box;
}

.date-input:focus {
  border-color: var(--btn-active-border);
  background: var(--bg-main);
}

.modal-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--border);
  background: var(--bg-bar);
}

.btn {
  width: 100%;
  height: 2.6rem;
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: color-mix(in srgb, var(--btn-active-border) 18%, var(--bg-btn));
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.btn-cancel {
  color: var(--text-secondary);
}

.btn-confirm {
  color: var(--text-blue);
  border-color: var(--btn-active-border);
  background: var(--btn-active-bg);
}
</style>
