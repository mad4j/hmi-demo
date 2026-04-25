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
  inputType: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'password'].includes(v),
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const localValue = ref(String(props.value ?? ''))

watch(
  () => props.value,
  (v) => {
    localValue.value = String(v ?? '')
  },
)

const handleConfirm = () => emit('confirm', localValue.value)
const handleCancel = () => emit('cancel')
</script>

<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div class="modal" role="dialog" :aria-label="`Modifica ${name}`" aria-modal="true">
      <div class="modal-header">{{ name }}</div>

      <div class="modal-body">
        <input
          v-model="localValue"
          class="text-input"
          :type="inputType"
          :autocomplete="inputType === 'password' ? 'current-password' : 'username'"
          :aria-label="name"
          spellcheck="false"
        />
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" aria-label="Annulla" title="Annulla" @click="handleCancel">✕</button>
        <button class="btn btn-confirm" type="button" aria-label="Conferma" title="Conferma" @click="handleConfirm">✓</button>
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
  font-size: 0.72rem;
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

.text-input {
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

.text-input:focus {
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
