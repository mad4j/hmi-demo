import { computed, ref, watch } from 'vue'

export const useCurrentPagePanels = ({ currentPage }) => {
  const currentPanelIndex = ref(0)

  const currentPagePanels = computed(() =>
    Array.isArray(currentPage.value?.panels) && currentPage.value.panels.length > 0
      ? currentPage.value.panels
      : null,
  )

  const pageParameters = computed(() =>
    currentPagePanels.value
      ? currentPagePanels.value.flatMap((panel) => panel.parameters ?? [])
      : (currentPage.value?.parameters ?? []),
  )

  const currentPanelLabel = computed(() => {
    if (!currentPagePanels.value) return ''
    const panel = currentPagePanels.value[currentPanelIndex.value]
    return typeof panel?.label === 'string' ? panel.label.trim() : ''
  })

  watch(
    () => currentPage.value?.id,
    () => {
      currentPanelIndex.value = 0
    },
  )

  const handlePanelChange = (index) => {
    currentPanelIndex.value = Number.isInteger(index) && index >= 0 ? index : 0
  }

  return {
    currentPagePanels,
    pageParameters,
    currentPanelLabel,
    handlePanelChange,
  }
}
