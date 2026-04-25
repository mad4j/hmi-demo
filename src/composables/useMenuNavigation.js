import { ref, computed } from 'vue'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
} from './useMenuConfig.js'

// ── Singleton state ───────────────────────────────────────
const selectablePages = flattenSelectablePages(menuConfig.pages)

const currentPageId = ref(selectablePages[0]?.id ?? menuConfig.pages[0].id)
const showingSecondLevel = ref(false)
const secondLevelParentId = ref(null)
const pageHistory = ref([])

export const useMenuNavigation = () => {
  const setCurrentPage = (pageId, { trackHistory = true } = {}) => {
    if (!pageId || pageId === currentPageId.value) return
    if (trackHistory && currentPageId.value) {
      pageHistory.value.push(currentPageId.value)
    }
    currentPageId.value = pageId
    showingSecondLevel.value = false
    secondLevelParentId.value = null
  }

  // ── Actions ───────────────────────────────────────────────
  const navigateToPage = (pageId) => {
    setCurrentPage(pageId)
  }

  const selectLevel1Item = (item) => {
    if (item.submenus?.length) {
      secondLevelParentId.value = item.id
      showingSecondLevel.value = true
    } else {
      setCurrentPage(item.id)
    }
  }

  const selectLevel2Item = (item) => {
    setCurrentPage(item.id)
  }

  const goBack = () => {
    showingSecondLevel.value = false
  }

  const goHome = () => {
    setCurrentPage(selectablePages[0]?.id ?? menuConfig.pages[0].id)
  }

  const goToPreviousPage = () => {
    while (pageHistory.value.length) {
      const previousPageId = pageHistory.value.pop()
      if (!previousPageId || previousPageId === currentPageId.value) continue
      setCurrentPage(previousPageId, { trackHistory: false })
      return
    }
  }

  // ── Computed ──────────────────────────────────────────────
  const currentPage = computed(
    () =>
      findPageById(menuConfig.pages, currentPageId.value) ??
      selectablePages[0] ??
      menuConfig.pages[0],
  )

  const level1Items = computed(() => menuConfig.pages)

  const secondLevelItems = computed(() => {
    if (!secondLevelParentId.value) return []
    const parent = menuConfig.pages.find((p) => p.id === secondLevelParentId.value)
    return parent?.submenus ?? []
  })

  const activeLevel1Id = computed(() => {
    if (showingSecondLevel.value) return secondLevelParentId.value
    const direct = menuConfig.pages.find((p) => p.id === currentPageId.value)
    if (direct) return direct.id
    for (const page of menuConfig.pages) {
      if (page.submenus?.some((s) => s.id === currentPageId.value)) {
        return page.id
      }
    }
    return null
  })

  return {
    // state
    currentPageId,
    showingSecondLevel,
    // computed
    currentPage,
    level1Items,
    secondLevelItems,
    activeLevel1Id,
    // actions
    selectLevel1Item,
    selectLevel2Item,
    goBack,
    goHome,
    goToPreviousPage,
    navigateToPage,
  }
}
