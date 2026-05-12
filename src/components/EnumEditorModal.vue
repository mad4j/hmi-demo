<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['confirm', 'cancel'])

const focusedIndex = ref(
  Math.max(0, props.options.indexOf(props.value)),
)

const itemRefs = ref([])

const handleSelect = (option) => {
  emit('confirm', option)
}

const handleCancel = () => emit('cancel')

const moveFocus = (delta) => {
  const next = Math.max(0, Math.min(props.options.length - 1, focusedIndex.value + delta))
  focusedIndex.value = next
  itemRefs.value[next]?.focus()
}

const handleListKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveFocus(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveFocus(-1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    moveFocus(-props.options.length)
  } else if (e.key === 'End') {
    e.preventDefault()
    moveFocus(props.options.length)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    handleCancel()
  }
}

const itemTabindex = computed(() => (index) => index === focusedIndex.value ? 0 : -1)

onMounted(() => {
  itemRefs.value[focusedIndex.value]?.focus()
})
</script>

<template>
  <div class="modal-backdrop" @click.self="handleCancel">
    <div
      class="modal"
      role="dialog"
      :aria-label="`Select ${name}`"
      aria-modal="true"
    >
      <div class="modal-header">{{ name }}</div>

      <ul
        class="option-list"
        role="listbox"
        :aria-label="name"
        @keydown="handleListKeydown"
      >
        <li
          v-for="(option, index) in options"
          :key="option"
          :ref="(el) => { if (el) itemRefs[index] = el }"
          class="option-item"
          :class="{ 'option-item--selected': option === value }"
          role="option"
          :aria-selected="option === value"
          :tabindex="itemTabindex(index)"
          @click="handleSelect(option)"
          @keydown.enter.space.prevent="handleSelect(option)"
          @focus="focusedIndex = index"
        >
          {{ option }}
          <span v-if="option === value" class="option-check" aria-hidden="true">✓</span>
        </li>
      </ul>

      <div class="modal-footer">
        <button class="btn btn-cancel" type="button" aria-label="Cancel" title="Cancel" @click="handleCancel">✕</button>
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
  max-height: 80vh;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background: var(--bg-main);
  color: var(--text-primary);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

/* ── Header ──────────────────────────────────────────────── */
.modal-header {
  flex-shrink: 0;
  padding: 0.55rem 1rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  background: var(--bg-bar);
}

/* ── Option list ─────────────────────────────────────────── */
.option-list {
  list-style: none;
  margin: 0;
  padding: 0.35rem 0;
  overflow-y: auto;
  flex: 1 1 auto;
  outline: none;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.1rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  min-height: 3rem;
  touch-action: manipulation;
  user-select: none;
}

.option-item:hover,
.option-item:focus-visible {
  background: var(--btn-active-bg);
  outline: none;
}

.option-item--selected {
  border-left-color: var(--btn-active-border);
  color: var(--text-blue);
}

.option-check {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-blue);
  flex-shrink: 0;
}

/* ── Footer ──────────────────────────────────────────────── */
.modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
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
  background: var(--bg-btn);
  color: var(--text-secondary);
  transition: background 0.12s, border-color 0.12s;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-cancel:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}
</style>
