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
  <!-- TX: double vertical arrows base, upload emphasized -->
  <svg
    v-if="variant === 'tx'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.4"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <line x1="8" y1="20" x2="8" y2="5" />
    <polyline points="5.5 8 8 5 10.5 8" />
    <line x1="16" y1="4" x2="16" y2="19" opacity="0.45" />
    <polyline points="13.5 16 16 19 18.5 16" opacity="0.45" />
    <path d="M3 21.5H13" stroke-width="1.4" opacity="0.45" />
  </svg>

  <!-- RX: double vertical arrows base, download emphasized -->
  <svg
    v-else-if="variant === 'rx'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.4"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <line x1="8" y1="20" x2="8" y2="5" opacity="0.45" />
    <polyline points="5.5 8 8 5 10.5 8" opacity="0.45" />
    <line x1="16" y1="4" x2="16" y2="19" />
    <polyline points="13.5 16 16 19 18.5 16" />
    <path d="M11 2.5H21" stroke-width="1.4" opacity="0.45" />
  </svg>

  <!-- IDLE-PT: double vertical arrows + warning triangle -->
  <svg
    v-else-if="variant === 'idle-pt'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <line x1="8" y1="19" x2="8" y2="6" />
    <polyline points="5.5 9 8 6 10.5 9" />
    <line x1="16" y1="5" x2="16" y2="18" />
    <polyline points="13.5 15 16 18 18.5 15" />
    <path d="M12 13.4 L9.8 17.4 L14.2 17.4 Z" stroke-width="1.7" />
    <line x1="12" y1="14.6" x2="12" y2="16" stroke-width="1.7" />
    <circle cx="12" cy="16.9" r="0.45" fill="currentColor" stroke="none" />
  </svg>

  <!-- RADIO-SILENCE: double vertical arrows disabled + strike -->
  <svg
    v-else-if="variant === 'radio-silence'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <line x1="8" y1="19" x2="8" y2="6" stroke-dasharray="2 2" />
    <polyline points="5.5 9 8 6 10.5 9" stroke-dasharray="2 2" />
    <line x1="16" y1="5" x2="16" y2="18" stroke-dasharray="2 2" />
    <polyline points="13.5 15 16 18 18.5 15" stroke-dasharray="2 2" />
    <line x1="4" y1="4" x2="20" y2="20" stroke-width="2.8" />
  </svg>

  <!-- IDLE-CT (default): double vertical arrows + lock -->
  <svg
    v-else
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2.2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
  >
    <line x1="8" y1="19" x2="8" y2="6" />
    <polyline points="5.5 9 8 6 10.5 9" />
    <line x1="16" y1="5" x2="16" y2="18" />
    <polyline points="13.5 15 16 18 18.5 15" />
    <rect x="10" y="13.6" width="4" height="3.8" rx="0.65" stroke-width="1.8" />
    <path d="M10.8 13.6v-1.3a1.2 1.2 0 0 1 2.4 0v1.3" stroke-width="1.8" />
  </svg>
</template>
