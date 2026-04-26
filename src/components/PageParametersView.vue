<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import ParameterWidget from './ParameterWidget.vue'
import PercentageEditorModal from './PercentageEditorModal.vue'
import TextEditorModal from './TextEditorModal.vue'
import DateEditorModal from './DateEditorModal.vue'

const props = defineProps({
  parameters: {
    type: Array,
    required: true,
  },
  parameterValues: {
    type: Object,
    required: true,
  },
  viewportWidth: {
    type: Number,
    required: true,
  },
  transactionMode: {
    type: Boolean,
    default: false,
  },
  modifiedParameterIds: {
    type: Array,
    default: () => [],
  },
  canSubmitTransaction: {
    type: Boolean,
    default: false,
  },
  panels: {
    type: Array,
    default: null,
  },
})

const emit = defineEmits([
  'toggle-parameter',
  'set-parameter-value',
  'submit-transaction',
  'reset-transaction',
  'panel-change',
])

// ── Panel navigation ──────────────────────────────────────
const currentPanel = ref(0)

const hasPanels = computed(() => Array.isArray(props.panels) && props.panels.length > 0)

const totalPanels = computed(() => hasPanels.value ? props.panels.length : 1)

const visibleParameters = computed(() =>
  hasPanels.value
    ? (props.panels[currentPanel.value]?.parameters ?? [])
    : props.parameters,
)

// All parameters flattened (used for edit-next cycling)
const allParameters = computed(() =>
  hasPanels.value
    ? props.panels.flatMap((p) => p.parameters ?? [])
    : props.parameters,
)

watch(
  () => props.panels,
  () => { currentPanel.value = 0 },
)

watch(
  () => currentPanel.value,
  (index) => {
    emit('panel-change', index)
  },
  { immediate: true },
)

const goToPanel = (index) => {
  currentPanel.value = Math.max(0, Math.min(index, totalPanels.value - 1))
}

// Drag / touch swipe
let dragStartX = 0
let isDragging = false

const onDragStart = (e) => {
  dragStartX = e.touches ? e.touches[0].clientX : e.clientX
  isDragging = true
}

const onDragEnd = (e) => {
  if (!isDragging) return
  isDragging = false
  const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
  const delta = dragStartX - endX
  if (Math.abs(delta) > 40) {
    goToPanel(currentPanel.value + (delta > 0 ? 1 : -1))
  }
}

// ── Parameter editing state ───────────────────────────────
const editingParamId = ref(null)

const editingParam = computed(() =>
  editingParamId.value
    ? allParameters.value.find((p) => p.id === editingParamId.value) ?? null
    : null,
)

const startEditParameter = (id) => {
  editingParamId.value = id
}

const confirmEdit = (newValue) => {
  if (editingParamId.value !== null) {
    emit('set-parameter-value', editingParamId.value, newValue)
  }
  editingParamId.value = null
}

const cancelEdit = () => {
  editingParamId.value = null
}

const EDITABLE_TYPES = ['percentage', 'text', 'password', 'date']

const confirmAndNext = (newValue) => {
  if (editingParamId.value !== null) {
    emit('set-parameter-value', editingParamId.value, newValue)
  }
  const editableParams = allParameters.value.filter(
    (p) => !p.readonly && EDITABLE_TYPES.includes(p.type),
  )
  const currentIdx = editableParams.findIndex((p) => p.id === editingParamId.value)
  const nextParam = editableParams[currentIdx + 1] ?? null
  editingParamId.value = nextParam?.id ?? null
}

const isEditingPercentage = computed(() => editingParam.value?.type === 'percentage')
const isEditingText = computed(
  () => editingParam.value?.type === 'text' || editingParam.value?.type === 'password',
)
const isEditingDate = computed(() => editingParam.value?.type === 'date')

const handleToggle = (paramId) => {
  emit('toggle-parameter', paramId)
}

const isParameterModified = (paramId) => props.modifiedParameterIds.includes(paramId)

const getTextEditorValue = () => {
  if (!editingParam.value) return ''
  if (!editingParam.value.clearOnApply) return props.parameterValues[editingParam.value.id] ?? ''
  return isParameterModified(editingParam.value.id)
    ? (props.parameterValues[editingParam.value.id] ?? '')
    : ''
}

const handleGlobalKeydown = (e) => {
  if (e.key !== 'Enter') return
  if (!props.transactionMode) return
  if (editingParamId.value !== null) return
  if (!props.canSubmitTransaction) return
  e.preventDefault()
  emit('submit-transaction')
}

onMounted(() => document.addEventListener('keydown', handleGlobalKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleGlobalKeydown))
</script>

<template>
  <div class="page-parameters-view">
    <div
      v-if="parameters.length || hasPanels"
      class="panels-wrapper"
      :class="{ 'panels-wrapper--active': hasPanels }"
      @mousedown="hasPanels ? onDragStart($event) : undefined"
      @mouseup="hasPanels ? onDragEnd($event) : undefined"
      @mouseleave="hasPanels ? onDragEnd($event) : undefined"
      @touchstart.passive="hasPanels ? onDragStart($event) : undefined"
      @touchend.passive="hasPanels ? onDragEnd($event) : undefined"
    >
      <div class="widget-grid">
        <ParameterWidget
          v-for="param in visibleParameters"
          :key="param.id"
          :name="param.name"
          :type="param.type"
          :unit="param.unit"
          :precision="param.precision"
          :options="param.options"
          :value="parameterValues[param.id]"
          :readonly="param.readonly"
          :modified="isParameterModified(param.id)"
          @toggle="handleToggle(param.id)"
          @edit="startEditParameter(param.id)"
        />
      </div>

      <!-- Panel dot indicators -->
      <div v-if="hasPanels && totalPanels > 1" class="panel-indicators" role="tablist" aria-label="Pannelli">
        <button
          v-for="i in totalPanels"
          :key="i"
          class="panel-dot"
          :class="{ 'panel-dot--active': i - 1 === currentPanel }"
          role="tab"
          :aria-selected="i - 1 === currentPanel"
          :aria-label="`Pannello ${i}`"
          @click.stop="goToPanel(i - 1)"
        />
      </div>
    </div>

    <div v-if="transactionMode" class="transaction-actions" role="group" aria-label="Azioni transazione">
      <button
        class="transaction-button transaction-button--reset"
        type="button"
        aria-label="Reset"
        :disabled="!canSubmitTransaction"
        @click="emit('reset-transaction')"
      >
        <AppIcon name="reset" :size="16" />
      </button>
      <button
        class="transaction-button transaction-button--submit"
        type="button"
        aria-label="Invia"
        :disabled="!canSubmitTransaction"
        @click="emit('submit-transaction')"
      >
        <AppIcon name="send" :size="16" />
      </button>
    </div>
  </div>

  <PercentageEditorModal
    v-if="editingParam && isEditingPercentage"
    :name="editingParam.name"
    :value="Number(parameterValues[editingParam.id] ?? 0)"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
    @confirm-and-next="confirmAndNext"
  />

  <TextEditorModal
    v-if="editingParam && isEditingText"
    :key="editingParam.id"
    :name="editingParam.name"
    :value="getTextEditorValue()"
    :input-type="editingParam.type === 'password' ? 'password' : 'text'"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
    @confirm-and-next="confirmAndNext"
  />

  <DateEditorModal
    v-if="editingParam && isEditingDate"
    :name="editingParam.name"
    :value="parameterValues[editingParam.id] ?? ''"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
    @confirm-and-next="confirmAndNext"
  />
</template>

<style scoped>
.panels-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  position: relative;
  user-select: none;
}

.panels-wrapper--active {
  cursor: grab;
}

.panels-wrapper--active:active {
  cursor: grabbing;
}

.widget-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin: auto 0;
}

.widget-grid > * {
  box-sizing: border-box;
  flex: 0 0 calc(25% - 0.375rem);
}

/* Panel dot indicators */
.panel-indicators {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0 0.2rem;
}

.panel-dot {
  width: 1.9rem;
  height: 1.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.panel-dot::before {
  content: '';
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: var(--text-secondary);
  opacity: 0.45;
  transition: opacity 0.2s, transform 0.2s, background 0.2s;
}

.panel-dot--active {
  transform: scale(1.06);
}

.panel-dot--active::before {
  width: 0.9rem;
  height: 0.9rem;
  background: var(--text-blue);
  opacity: 1;
}

.panel-dot:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--text-blue) 60%, white);
  outline-offset: 2px;
}

.page-parameters-view {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
  min-height: 100%;
  gap: 0.75rem;
}

.transaction-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: stretch;
  width: 100%;
  margin-top: auto;
  padding-top: 0.45rem;
}

.transaction-button {
  flex: 1 1 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.45rem;
  border: 1px solid var(--border);
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.6rem 0.4rem;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.transaction-button:disabled {
  opacity: 0.55;
  filter: saturate(0.45);
}

.transaction-button--submit {
  background: color-mix(in srgb, var(--btn-active-border) 18%, var(--bg-btn));
}

.transaction-button--reset {
  background: color-mix(in srgb, var(--btn-active-border) 18%, var(--bg-btn));
}

.transaction-button--submit:not(:disabled) {
  border-color: var(--btn-active-border);
  color: var(--text-blue);
}

.transaction-button--reset:not(:disabled) {
  border-color: var(--transaction-modified-border);
  color: var(--transaction-modified-text);
}

.transaction-button:not(:disabled):hover {
  filter: brightness(1.08);
}

@media (max-width: 599px) {
  .widget-grid > * {
    flex: 0 0 calc(33.333% - 0.3333rem);
  }
}

@media (max-width: 399px) {
  .widget-grid > * {
    flex: 0 0 calc(50% - 0.25rem);
  }
}
</style>
