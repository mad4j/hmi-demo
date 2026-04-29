<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  pendingCount: {
    type: Number,
    default: 0,
  },
  barClasses: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['tap'])
</script>

<template>
  <div
    class="notification-bar"
    :class="barClasses"
    role="status"
    aria-live="polite"
    @click="$emit('tap')"
  >
    <AppIcon :name="icon" :size="16" class="notification-icon" aria-hidden="true" />
    <span class="notification-message">{{ message }}</span>
    <span
      v-if="pendingCount > 0"
      class="notification-count"
      aria-label="Queued messages"
    >
      {{ pendingCount }}
    </span>
  </div>
</template>

<style scoped>
.notification-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 2rem;
  padding: 0.25rem 0.85rem;
  border-bottom: 1px solid var(--notification-normal-border);
  background: var(--notification-normal-bg);
  color: var(--notification-normal-text);
  font-size: 1rem;
  line-height: 1.15;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.notification-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.notification-message {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-count {
  flex-shrink: 0;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 0.12rem 0.35rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  opacity: 0.85;
}

.notification-bar--menu {
  background: var(--notification-normal-bg);
  border-bottom-color: var(--notification-normal-border);
  color: var(--text-secondary);
}

.notification-bar--normal {
  background: var(--notification-normal-bg);
  border-bottom-color: var(--notification-normal-border);
  color: var(--notification-normal-text);
}

.notification-bar--warning {
  background: var(--notification-warning-bg);
  border-bottom-color: var(--notification-warning-border);
  color: var(--notification-warning-text);
}

.notification-bar--success {
  background: var(--notification-success-bg);
  border-bottom-color: var(--notification-success-border);
  color: var(--notification-success-text);
}

.notification-bar--error {
  background: var(--notification-error-bg);
  border-bottom-color: var(--notification-error-border);
  color: var(--notification-error-text);
}

@media (max-width: 399px) {
  .notification-bar {
    line-height: 1.12;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
  }
}
</style>
