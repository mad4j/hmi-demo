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
      <AppIcon :name="icon.icon" :size="18" />
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
  width: 2rem;
  height: 2rem;
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
  border-color: rgba(63, 185, 80, 0.35);
  background: rgba(63, 185, 80, 0.1);
}

.si--warning {
  color: #e3a008;
  border-color: rgba(227, 160, 8, 0.4);
  background: rgba(227, 160, 8, 0.12);
}

.si--error {
  color: #f85149;
  border-color: rgba(248, 81, 73, 0.4);
  background: rgba(248, 81, 73, 0.12);
}

.si--off {
  color: var(--text-secondary);
  border-color: transparent;
  background: transparent;
}
</style>
