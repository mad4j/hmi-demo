<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    required: true,
  },
  type: {
    type: String,
    default: 'number',
    validator: (v) => ['number', 'enum', 'boolean'].includes(v),
  },
  unit: {
    type: String,
    default: '',
  },
  precision: {
    type: Number,
    default: null,
  },
})

const displayValue = computed(() => {
  if (props.type === 'boolean') {
    return props.value ? 'ON' : 'OFF'
  }
  if (props.type === 'number') {
    const num = Number(props.value)
    if (Number.isNaN(num)) {
      return '—'
    }
    const formatted =
      props.precision !== null ? num.toFixed(props.precision) : String(props.value)
    return props.unit ? `${formatted} ${props.unit}` : formatted
  }
  return String(props.value ?? '—')
})

const isActive = computed(() => props.type === 'boolean' && Boolean(props.value))
</script>

<template>
  <div class="param-widget" :class="{ 'param-widget--active': isActive, [`param-widget--${type}`]: true }">
    <div class="param-name">{{ name }}</div>
    <div class="param-value">{{ displayValue }}</div>
  </div>
</template>

<style scoped>
.param-widget {
  display: flex;
  flex-direction: column;
  width: 9rem;
  min-height: 5.5rem;
  border: 2px solid #0f380f;
  border-radius: 0.3rem;
  overflow: hidden;
  background: #829258;
  color: #0f380f;
}

.param-name {
  flex: 0 0 auto;
  padding: 0.2rem 0.45rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 2px solid #0f380f;
  background: #6a7a48;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.param-value {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.45rem;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  word-break: break-all;
}

/* Boolean widget: invert colours when active (true) */
.param-widget--boolean.param-widget--active {
  background: #0f380f;
  color: #9bbc0f;
}

.param-widget--boolean.param-widget--active .param-name {
  background: #0a2a0a;
  border-bottom-color: #9bbc0f;
  color: #9bbc0f;
}

/* Enum widget: slightly smaller value text to fit longer labels */
.param-widget--enum .param-value {
  font-size: 1.1rem;
}
</style>
