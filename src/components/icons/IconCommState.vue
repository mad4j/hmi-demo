<script setup>
defineProps({
  variant: {
    type: String,
    default: 'idle-ct',
    // 'tx' | 'rx' | 'idle-ct' | 'idle-pt' | 'radio-silence'
  },
  size: {
    type: Number,
    default: 24,
  },
})
</script>

<template>
  <!-- TX: signal waves + arrow pointing up-right -->
  <svg
    v-if="variant === 'tx'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path d="M2 16.5A10 10 0 0 1 12 7a10 10 0 0 1 10 9.5" />
    <path d="M6 16.5A6 6 0 0 1 12 11a6 6 0 0 1 6 5.5" />
    <line x1="12" y1="20" x2="12" y2="14" />
    <polyline points="9 17 12 14 15 17" />
  </svg>

  <!-- RX: signal waves + arrow pointing down -->
  <svg
    v-else-if="variant === 'rx'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path d="M2 7.5A10 10 0 0 1 12 17a10 10 0 0 1 10-9.5" />
    <path d="M6 7.5A6 6 0 0 1 12 13a6 6 0 0 1 6-5.5" />
    <line x1="12" y1="4" x2="12" y2="10" />
    <polyline points="9 7 12 10 15 7" />
  </svg>

  <!-- IDLE-PT: wifi with warning triangle overlay -->
  <svg
    v-else-if="variant === 'idle-pt'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path d="M2 8.5A12 12 0 0 1 12 5a12 12 0 0 1 10 3.5" />
    <path d="M5.5 12A8 8 0 0 1 12 9.5a8 8 0 0 1 6.5 2.5" />
    <line x1="12" y1="20" x2="12" y2="16" />
    <circle cx="12" cy="20" r="0.5" fill="currentColor" />
    <path d="M12 13 L10 16.5 L14 16.5 Z" stroke-width="1.5" />
    <line x1="12" y1="14" x2="12" y2="15.5" />
  </svg>

  <!-- RADIO-SILENCE: signal waves crossed out -->
  <svg
    v-else-if="variant === 'radio-silence'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path d="M2 8.5A12 12 0 0 1 12 5a12 12 0 0 1 10 3.5" stroke-dasharray="2 2" />
    <path d="M5.5 12A8 8 0 0 1 12 9.5a8 8 0 0 1 6.5 2.5" stroke-dasharray="2 2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
    <line x1="3" y1="3" x2="21" y2="21" stroke-width="2.5" />
  </svg>

  <!-- IDLE-CT (default): wifi with lock -->
  <svg
    v-else
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <path d="M2 8.5A12 12 0 0 1 12 5a12 12 0 0 1 10 3.5" />
    <path d="M5.5 12A8 8 0 0 1 12 9.5a8 8 0 0 1 6.5 2.5" />
    <rect x="9.5" y="15" width="5" height="4" rx="0.75" />
    <path d="M10.5 15v-1.5a1.5 1.5 0 0 1 3 0V15" />
  </svg>
</template>
