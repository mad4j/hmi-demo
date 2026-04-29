<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  level1Items: {
    type: Array,
    required: true,
  },
  activeLevel1Id: {
    type: String,
    default: null,
  },
  canGoToPreviousPage: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['go-back', 'go-home', 'select-item'])
</script>

<template>
  <footer class="bar bottom-bar">
    <button
      class="tab-button tab-button--back"
      type="button"
      aria-label="Back"
      :disabled="!canGoToPreviousPage"
      @click="$emit('go-back')"
    >
      <AppIcon name="back" :size="22" class="tab-icon" />
    </button>
    <button
      class="tab-button tab-button--home"
      type="button"
      aria-label="Home"
      @click="$emit('go-home')"
    >
      <AppIcon name="home" :size="22" class="tab-icon" />
      <span class="tab-label">Home</span>
    </button>
    <button
      v-for="item in level1Items"
      :key="item.id"
      class="tab-button"
      :class="{ 'tab-button--active': item.id === activeLevel1Id }"
      type="button"
      @click="$emit('select-item', item)"
    >
      <AppIcon v-if="item.icon" :name="item.icon" :size="22" class="tab-icon" />
      <span class="tab-label">{{ item.label }}</span>
    </button>
  </footer>
</template>

<style scoped>
/* ── Bars ───────────────────────────────────────────────── */
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: var(--bg-bar);
  border-bottom: 1px solid var(--border);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.03em;
  transition: background 0.25s, border-color 0.25s;
}

/* ── Bottom tab bar ─────────────────────────────────────── */
.bottom-bar {
  border-bottom: 0;
  border-top: 1px solid var(--border);
  padding: 0;
  gap: 0;
  align-items: stretch;
  justify-content: space-around;
}

/* ── Buttons ────────────────────────────────────────────── */
button {
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

button:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.35rem 0.25rem;
  border: none;
  border-left: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.tab-button:first-child {
  border-left: none;
}

.tab-button--back {
  flex: 0.333333;
}

.tab-button:disabled {
  color: var(--text-secondary);
  opacity: 0.45;
  cursor: not-allowed;
}

.tab-button:disabled:active {
  background: transparent;
}

.tab-button:active {
  background: var(--btn-active-bg);
}

.tab-button--active {
  color: var(--text-blue);
  background: var(--btn-active-bg);
  border-top: 2px solid var(--btn-active-border);
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.tab-label {
  font-size: 1rem;
}
</style>
