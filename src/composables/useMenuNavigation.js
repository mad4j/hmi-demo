import { ref, computed } from 'vue'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
  getMenuItemsByPath,
  findPathToPage,
} from './useMenuConfig.js'

// ── Singleton state ───────────────────────────────────────
const selectablePages = flattenSelectablePages(menuConfig.pages)
const selectablePageIndexById = new Map(
  selectablePages.map((page, index) => [page.id, index]),
)

const currentPageId = ref(selectablePages[0]?.id ?? menuConfig.pages[0].id)
const menuPath = ref([])
const menuModeEnabled = ref(false)

export const useMenuNavigation = () => {
  // ── Actions ───────────────────────────────────────────────
  const toggleMenuMode = () => {
    menuModeEnabled.value = !menuModeEnabled.value
    if (menuModeEnabled.value) {
      menuPath.value = findPathToPage(menuConfig.pages, currentPageId.value) ?? []
    }
  }

  const navigateToBreadcrumb = (index) => {
    menuPath.value = menuPath.value.slice(0, index)
  }

  const selectMenuItem = (item) => {
    if (item.submenus.length) {
      menuPath.value = [...menuPath.value, item.id]
      return
    }
    currentPageId.value = item.id
    menuModeEnabled.value = false
    menuPath.value = []
  }

  const goToParentMenu = () => {
    if (!menuPath.value.length) return
    menuPath.value = menuPath.value.slice(0, -1)
  }

  const goHome = () => {
    currentPageId.value = selectablePages[0]?.id ?? menuConfig.pages[0].id
    menuPath.value = []
    menuModeEnabled.value = false
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

  const breadcrumbs = computed(() => {
    const crumbs = [{ id: null, label: 'Menu' }]
    for (const id of menuPath.value) {
      const item = findPageById(menuConfig.pages, id)
      if (item) crumbs.push({ id, label: item.label })
    }
    return crumbs
  })

  const visibleMenuItems = computed(() =>
    getMenuItemsByPath(menuConfig.pages, menuPath.value),
  )

  const isOnHomePage = computed(
    () => currentPageId.value === (selectablePages[0]?.id ?? menuConfig.pages[0].id),
  )

  const currentMenuTitle = computed(() => {
    if (!menuPath.value.length) return 'Menu'
    const currentContainer = findPageById(
      menuConfig.pages,
      menuPath.value[menuPath.value.length - 1],
    )
    return currentContainer?.label ?? 'Menu'
  })

  return {
    // state
    currentPageId,
    menuPath,
    menuModeEnabled,
    // computed
    currentPage,
    pageCounterLabel,
    breadcrumbs,
    visibleMenuItems,
    isOnHomePage,
    currentMenuTitle,
    // actions
    toggleMenuMode,
    navigateToBreadcrumb,
    selectMenuItem,
    goToParentMenu,
    goHome,
  }
}
