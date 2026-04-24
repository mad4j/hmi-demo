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
    validator: (v) => ['number', 'percentage', 'enum', 'boolean'].includes(v),
  },
  unit: {
    type: String,
    default: '',
  },
  precision: {
    type: Number,
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['toggle', 'edit'])

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '—'
  if (props.type === 'boolean') {
    return props.value ? 'ON' : 'OFF'
  }
  if (props.type === 'percentage') {
    const num = Number(props.value)
    if (Number.isNaN(num)) return '—'
    const formatted = props.precision !== null ? num.toFixed(props.precision) : String(props.value)
    return `${formatted} %`
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

const isClickable = computed(
  () =>
    props.type === 'boolean' ||
    props.type === 'percentage' ||
    (props.type === 'enum' && props.options.length > 0),
)

const handleClick = () => {
  if (!isClickable.value) return
  if (props.type === 'percentage') {
    emit('edit')
  } else {
    emit('toggle')
  }
}
</script>

<template>
  <div
    class="param-widget"
    :class="{ 'param-widget--active': isActive, [`param-widget--${type}`]: true, 'param-widget--clickable': isClickable }"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable ? 0 : undefined"
    :aria-pressed="type === 'boolean' ? isActive : undefined"
    :aria-label="isClickable ? name : undefined"
    @click="handleClick"
    @keydown.enter.space.prevent="handleClick"
  >
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
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  overflow: hidden;
  background: var(--bg-btn);
  color: var(--text-primary);
  transition: border-color 0.15s, background 0.25s, color 0.25s;
}

.param-name {
  flex: 0 0 auto;
  padding: 0.25rem 0.55rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--bg-main);
  transition: background 0.25s, color 0.25s, border-color 0.25s;
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
  color: var(--text-primary);
}

/* ── Boolean: clickable ──────────────────────────────────── */
.param-widget--clickable {
  cursor: pointer;
  user-select: none;
}

.param-widget--clickable:focus-visible {
  outline: 2px solid var(--active-border);
  outline-offset: 2px;
}

/* ── Boolean: OFF state ──────────────────────────────────── */
.param-widget--boolean .param-value {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* ── Boolean: ON / active state ──────────────────────────── */
.param-widget--boolean.param-widget--active {
  border-color: var(--active-border);
}

.param-widget--boolean.param-widget--active .param-name {
  background: var(--active-name-bg);
  border-bottom-color: var(--active-name-border);
  color: var(--active-text);
}

.param-widget--boolean.param-widget--active .param-value {
  color: var(--active-text);
  font-size: 1rem;
}

/* ── Enum widget ─────────────────────────────────────────── */
.param-widget--enum .param-value {
  font-size: 1rem;
  color: var(--text-blue);
}

/* ── Percentage widget ───────────────────────────────────── */
.param-widget--percentage .param-value {
  color: var(--text-blue);
}

.param-widget--percentage.param-widget--clickable:hover .param-value {
  color: var(--active-text);
}
</style>
