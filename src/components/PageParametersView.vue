<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
})

const emit = defineEmits([
  'toggle-parameter',
  'set-parameter-value',
  'submit-transaction',
  'reset-transaction',
])

// ── Parameter editing state ───────────────────────────────
const editingParamId = ref(null)

const editingParam = computed(() =>
  editingParamId.value
    ? props.parameters.find((p) => p.id === editingParamId.value) ?? null
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
  const editableParams = props.parameters.filter(
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
    <div v-if="parameters.length" class="widget-grid">
      <ParameterWidget
        v-for="(param, index) in parameters"
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
  cursor: not-allowed;
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
