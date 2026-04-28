<script setup>
import AppIcon from './AppIcon.vue'
import { menuConfig } from '../composables/useMenuConfig.js'
import { useParameterStore } from '../composables/useParameterStore.js'
import { useMenuNavigation } from '../composables/useMenuNavigation.js'

const { parameterValues } = useParameterStore()
const { navigateToPage } = useMenuNavigation()

const getTargetPageId = (icon) => {
  const currentState = parameterValues[icon.parameterId]
  const mappedPageId =
    icon.pageIdByState && typeof icon.pageIdByState === 'object'
      ? icon.pageIdByState[currentState]
      : ''

  return mappedPageId || icon.pageId
}

const stateClass = (parameterId) => {
  const val = parameterValues[parameterId]
  if (val === 'ok') return 'si--ok'
  if (val === 'warning') return 'si--warning'
  if (val === 'error') return 'si--error'
  return 'si--off'
}
</script>

<template>
  <div class="status-icon-bar">
    <button
      v-for="icon in menuConfig.statusIcons"
      :key="icon.id"
      class="si-btn"
      :class="stateClass(icon.parameterId)"
      type="button"
      :aria-label="icon.label"
      :title="icon.label"
      @click="navigateToPage(getTargetPageId(icon))"
    >
      <AppIcon :name="icon.icon" :size="22" />
    </button>
  </div>
</template>

<style scoped>
.status-icon-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.si-btn {
  width: 3rem;
  height: 3rem;
  padding: 0;
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

/* State colours */
.si--ok {
  color: var(--text-green);
  border-color: var(--status-ok-border);
  background: var(--status-ok-bg);
}

.si--warning {
  color: var(--status-warning-color);
  border-color: var(--status-warning-border);
  background: var(--status-warning-bg);
}

.si--error {
  color: var(--status-critical-color);
  border-color: var(--status-critical-border);
  background: var(--status-critical-bg);
}

.si--off {
  color: var(--text-secondary);
  border-color: transparent;
  background: transparent;
}
</style>
