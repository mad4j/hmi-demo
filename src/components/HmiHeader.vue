<script setup>
import StatusIconBar from './StatusIconBar.vue'
import { applicationConfig } from '../composables/useApplicationConfig.js'
</script>

<template>
  <header class="bar top-bar">
    <div class="top-left">
      <span>{{ applicationConfig.name }}</span>
    </div>
    <div class="top-right">
      <StatusIconBar />
    </div>
  </header>
</template>

<style scoped>
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

.top-left {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.top-right {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}
</style>
