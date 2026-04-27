<script setup>
import AppIcon from './AppIcon.vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['navigate'])
</script>

<template>
  <div
    class="link-widget"
    :class="{ 'link-widget--active': active }"
    role="button"
    tabindex="0"
    :aria-label="label"
    :aria-pressed="active"
    @click="emit('navigate')"
    @keydown.enter.space.prevent="emit('navigate')"
  >
    <div class="link-icon">
      <AppIcon v-if="icon" :name="icon" :size="28" />
      <span v-else class="link-icon-arrow">›</span>
    </div>
    <div class="link-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.link-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 5.5rem;
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  overflow: hidden;
  background: var(--bg-btn);
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  gap: 0.35rem;
  transition: border-color 0.15s, background 0.25s, color 0.25s;
}

.link-widget:focus-visible {
  outline: 2px solid var(--active-border);
  outline-offset: 2px;
}

.link-widget:hover,
.link-widget:active,
.link-widget--active {
  border-color: var(--btn-active-border);
  background: var(--btn-active-bg);
}

.link-widget--active {
  color: var(--text-blue);
}

.link-widget--active .link-icon,
.link-widget--active .link-icon-arrow,
.link-widget--active .link-label {
  color: var(--text-blue);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.link-icon-arrow {
  font-size: 1.6rem;
  line-height: 1;
  color: var(--text-secondary);
}

.link-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
  text-align: center;
  padding: 0 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
</style>
