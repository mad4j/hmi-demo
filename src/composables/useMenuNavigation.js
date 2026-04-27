import { ref, computed } from 'vue'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
} from './useMenuConfig.js'

// ── Constants ─────────────────────────────────────────────
const HOME_PAGE_ID = '__home__'
const HOME_PAGE = {
  id: HOME_PAGE_ID,
  label: '',
  icon: '',
  visibility: 'visible',
  mode: 'standard',
  goOnApply: 'STAY_HERE',
  submenus: [],
  parameters: [],
}

// ── Singleton state ───────────────────────────────────────
const selectablePages = flattenSelectablePages(menuConfig.pages)

const currentPageId = ref(HOME_PAGE_ID)
const pageHistory = ref([])

export const useMenuNavigation = () => {
  const setCurrentPage = (pageId, { trackHistory = true } = {}) => {
    if (!pageId || pageId === currentPageId.value) return
    if (trackHistory && currentPageId.value) {
      pageHistory.value.push(currentPageId.value)
    }
    currentPageId.value = pageId
  }

  // ── Actions ───────────────────────────────────────────────
  const navigateToPage = (pageId) => {
    setCurrentPage(pageId)
  }

  const selectLevel1Item = (item) => {
    setCurrentPage(item.id)
  }

  const goHome = () => {
    if (currentPageId.value === HOME_PAGE_ID) return
    pageHistory.value = currentPageId.value ? [currentPageId.value] : []
    setCurrentPage(HOME_PAGE_ID, { trackHistory: false })
  }

  const goToPreviousPage = () => {
    while (pageHistory.value.length) {
      const previousPageId = pageHistory.value.pop()
      if (!previousPageId || previousPageId === currentPageId.value) continue
      setCurrentPage(previousPageId, { trackHistory: false })
      return
    }
  }

  const canGoToPreviousPage = computed(() =>
    pageHistory.value.some((pageId) => pageId && pageId !== currentPageId.value),
  )

  // ── Computed ──────────────────────────────────────────────
  const isAtHome = computed(() => currentPageId.value === HOME_PAGE_ID)

  const currentPage = computed(() => {
    if (currentPageId.value === HOME_PAGE_ID) return HOME_PAGE
    return (
      findPageById(menuConfig.pages, currentPageId.value) ??
      selectablePages[0] ??
      menuConfig.pages[0]
    )
  })

  const level1Items = computed(() =>
    menuConfig.pages.filter((page) => page.visibility !== 'hidden'),
  )

  const activeLevel1Id = computed(() => {
    if (currentPageId.value === HOME_PAGE_ID) return null
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
    // computed
    currentPage,
    isAtHome,
    level1Items,
    activeLevel1Id,
    canGoToPreviousPage,
    // actions
    selectLevel1Item,
    goHome,
    goToPreviousPage,
    navigateToPage,
  }
}
