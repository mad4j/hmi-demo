<script setup>
import { ref, computed } from 'vue'
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
})

const emit = defineEmits(['toggle-parameter', 'set-parameter-value'])

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
const isEditingDate = computed(() => editingParam.value?.type === 'date')

const handleToggle = (paramId) => {
  emit('toggle-parameter', paramId)
}
</script>

<template>
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

  <DateEditorModal
    v-if="editingParam && isEditingDate"
    :name="editingParam.name"
    :value="parameterValues[editingParam.id] ?? ''"
    @confirm="confirmEdit"
    @cancel="cancelEdit"
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
