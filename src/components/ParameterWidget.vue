<script setup>
import { computed } from 'vue'
import IconLock from './icons/IconLock.vue'

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
    validator: (v) =>
      ['number', 'percentage', 'enum', 'boolean', 'text', 'password', 'date'].includes(v),
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
  readonly: {
    type: Boolean,
    default: false,
  },
  modified: {
    type: Boolean,
    default: false,
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
    return props.precision !== null ? num.toFixed(props.precision) : String(props.value)
  }
  if (props.type === 'number') {
    const num = Number(props.value)
    if (Number.isNaN(num)) {
      return '—'
    }
    return props.precision !== null ? num.toFixed(props.precision) : String(props.value)
  }
  if (props.type === 'text') {
    const str = String(props.value ?? '').trim()
    return str === '' ? '---' : str
  }
  if (props.type === 'password') {
    return '•••'
  }
  if (props.type === 'date') {
    const raw = String(props.value ?? '').trim()
    if (!raw) return '—'
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(raw)
    if (Number.isNaN(parsed.getTime())) return '—'
    return new Intl.DateTimeFormat('it-IT').format(parsed)
  }
  return String(props.value ?? '—')
})

const displayUnit = computed(() => {
  if (props.type === 'percentage') return '%'
  if (props.type === 'number' && props.unit) return props.unit
  return ''
})

const isActive = computed(() => props.type === 'boolean' && Boolean(props.value))

const isClickable = computed(
  () =>
    !props.readonly &&
    (props.type === 'boolean' ||
      props.type === 'percentage' ||
      props.type === 'text' ||
      props.type === 'date' ||
      props.type === 'password' ||
      (props.type === 'enum' && props.options.length > 0)),
)

const handleClick = () => {
  if (!isClickable.value) return
  if (props.type === 'boolean') {
    emit('toggle')
  } else {
    emit('edit')
  }
}
</script>

<template>
  <div
    class="param-widget"
    :class="{ 'param-widget--active': isActive, [`param-widget--${type}`]: true, 'param-widget--clickable': isClickable, 'param-widget--readonly': readonly, 'param-widget--modified': modified }"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable ? 0 : undefined"
    :aria-pressed="type === 'boolean' ? isActive : undefined"
    :aria-label="isClickable ? name : undefined"
    :aria-readonly="readonly || undefined"
    @click="handleClick"
    @keydown.enter.space.prevent="handleClick"
  >
    <div class="param-name">
      {{ name }}
      <IconLock v-if="readonly" class="readonly-icon" aria-hidden="true" />
    </div>
    <div class="param-value">{{ displayValue }}<span v-if="displayUnit" class="param-unit">{{ displayUnit }}</span></div>
  </div>
</template>

<style scoped>
/* ── Base widget ─────────────────────────────────────────── */
.param-widget {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 5.5rem;
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
  font-size: 1rem;
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

.param-widget--text .param-value,
.param-widget--password .param-value,
.param-widget--date .param-value {
  font-size: 1rem;
  color: var(--text-blue);
}

.param-widget--percentage.param-widget--clickable:hover .param-value {
  color: var(--active-text);
}

/* ── Read-only widget ────────────────────────────────────── */
.param-widget--readonly {
  opacity: 0.75;
}

.param-widget--modified {
  border-color: var(--transaction-modified-border);
}

.param-widget--modified .param-name {
  background: var(--transaction-modified-bg);
  border-bottom-color: var(--transaction-modified-border);
  color: var(--transaction-modified-text);
}

.param-widget--modified .param-value {
  color: var(--transaction-modified-text);
}

.param-unit {
  font-size: 0.65em;
  font-weight: 600;
  margin-left: 0.2em;
  opacity: 0.75;
  vertical-align: baseline;
}

.readonly-icon {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  margin-left: 0.2rem;
  vertical-align: middle;
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
