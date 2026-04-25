import { ref, computed } from 'vue'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
} from './useMenuConfig.js'

// ── Singleton state ───────────────────────────────────────
const selectablePages = flattenSelectablePages(menuConfig.pages)
const selectablePageIndexById = new Map(
  selectablePages.map((page, index) => [page.id, index]),
)

const currentPageId = ref(selectablePages[0]?.id ?? menuConfig.pages[0].id)
const showingSecondLevel = ref(false)
const secondLevelParentId = ref(null)

export const useMenuNavigation = () => {
  // ── Actions ───────────────────────────────────────────────
  const navigateToPage = (pageId) => {
    if (!pageId) return
    currentPageId.value = pageId
    showingSecondLevel.value = false
    secondLevelParentId.value = null
  }

  const selectLevel1Item = (item) => {
    if (item.submenus?.length) {
      secondLevelParentId.value = item.id
      showingSecondLevel.value = true
    } else {
      currentPageId.value = item.id
      showingSecondLevel.value = false
      secondLevelParentId.value = null
    }
  }

  const selectLevel2Item = (item) => {
    currentPageId.value = item.id
    showingSecondLevel.value = false
    secondLevelParentId.value = null
  }

  const goBack = () => {
    showingSecondLevel.value = false
  }

  const goHome = () => {
    currentPageId.value = selectablePages[0]?.id ?? menuConfig.pages[0].id
    showingSecondLevel.value = false
    secondLevelParentId.value = null
  }

  // ── Computed ──────────────────────────────────────────────
  const currentPage = computed(
    () =>
      findPageById(menuConfig.pages, currentPageId.value) ??
      selectablePages[0] ??
      menuConfig.pages[0],
  )

  const pageCounterLabel = computed(() => {
    const safeIndex = (selectablePageIndexById.get(currentPage.value.id) ?? 0) + 1
    const total = selectablePages.length || 1
    return `${safeIndex}/${total}`
  })

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
    pageCounterLabel,
    level1Items,
    secondLevelItems,
    activeLevel1Id,
    // actions
    selectLevel1Item,
    selectLevel2Item,
    goBack,
    goHome,
    navigateToPage,
  }
}
