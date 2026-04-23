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
  if (props.value === null || props.value === undefined) return '—'
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
/* ── Base widget ─────────────────────────────────────────── */
.param-widget {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 5.5rem;
  border: 1px solid #30363d;
  border-radius: 0.45rem;
  overflow: hidden;
  background: #21262d;
  color: #e6edf3;
  transition: border-color 0.15s;
}

.param-name {
  flex: 0 0 auto;
  padding: 0.25rem 0.55rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #8b949e;
  border-bottom: 1px solid #30363d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #161b22;
}

.param-value {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.4rem;
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  overflow-wrap: break-word;
  color: #e6edf3;
}

/* ── Boolean: OFF state ──────────────────────────────────── */
.param-widget--boolean .param-value {
  font-size: 1rem;
  color: #8b949e;
}

/* ── Boolean: ON / active state ──────────────────────────── */
.param-widget--boolean.param-widget--active {
  border-color: rgba(63, 185, 80, 0.5);
}

.param-widget--boolean.param-widget--active .param-name {
  background: rgba(35, 134, 54, 0.2);
  border-bottom-color: rgba(63, 185, 80, 0.4);
  color: #3fb950;
}

.param-widget--boolean.param-widget--active .param-value {
  color: #3fb950;
  font-size: 1rem;
}

/* ── Enum widget ─────────────────────────────────────────── */
.param-widget--enum .param-value {
  font-size: 1rem;
  color: #58a6ff;
}
</style>
