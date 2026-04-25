<script setup>
import { ref, computed } from 'vue'
import ParameterWidget from './ParameterWidget.vue'
import PercentageEditorModal from './PercentageEditorModal.vue'
import TextEditorModal from './TextEditorModal.vue'

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
})

const emit = defineEmits(['toggle-parameter', 'set-parameter-value'])

// ── Grid layout helpers ───────────────────────────────────
const widgetCols = computed(() => {
  if (props.viewportWidth <= 399) return 2
  if (props.viewportWidth <= 599) return 3
  return 4
})

const centredGridStyle = (index, total, cols) => {
  const lastRowCount = total % cols || cols
  if (lastRowCount === cols) return {}
  const firstInLastRow = total - lastRowCount
  if (index < firstInLastRow) return {}
  const offset = Math.floor((cols - lastRowCount) / 2)
  const posInRow = index - firstInLastRow
  return { gridColumnStart: offset + posInRow + 1 }
}

const paramStyle = (index) =>
  centredGridStyle(index, props.parameters.length, widgetCols.value)

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

const isEditingPercentage = computed(() => editingParam.value?.type === 'percentage')
const isEditingText = computed(
  () => editingParam.value?.type === 'text' || editingParam.value?.type === 'password',
)

const handleToggle = (paramId) => {
  emit('toggle-parameter', paramId)
}
</script>

<template>
  <div v-if="parameters.length" class="widget-grid">
    <ParameterWidget
      v-for="(param, index) in parameters"
      :key="param.id"
      :style="paramStyle(index)"
      :name="param.name"
      :type="param.type"
      :unit="param.unit"
      :precision="param.precision"
      :options="param.options"
      :value="parameterValues[param.id]"
      :readonly="param.readonly"
      @toggle="handleToggle(param.id)"
      @edit="startEditParameter(param.id)"
    />
  </div>

  <PercentageEditorModal
    v-if="editingParam && isEditingPercentage"
    :name="editingParam.name"
    :value="Number(parameterValues[editingParam.id] ?? 0)"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
  />

  <TextEditorModal
    v-if="editingParam && isEditingText"
    :name="editingParam.name"
    :value="parameterValues[editingParam.id] ?? ''"
    :input-type="editingParam.type === 'password' ? 'password' : 'text'"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
  />
</template>

<style scoped>
.widget-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin: auto 0;
}

@media (max-width: 599px) {
  .widget-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 399px) {
  .widget-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
