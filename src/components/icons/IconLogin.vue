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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <rect x="15" y="11" width="6" height="5" rx="1" />
    <line x1="18" y1="11" x2="18" y2="10" />
  </svg>
</template>
