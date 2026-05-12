<script setup>
defineProps({
  size: {
    type: Number,
    default: 24,
  },
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <line x1="1" y1="6" x2="1" y2="18" />
    <line x1="7" y1="10" x2="7" y2="18" />
    <line x1="13" y1="13" x2="13" y2="18" />
    <line x1="19" y1="16" x2="19" y2="18" />
  </svg>
</template>
