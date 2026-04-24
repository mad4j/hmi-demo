import { computed, onMounted, reactive, ref } from 'vue'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
  getMenuItemsByPath,
} from './useMenuConfig.js'

// Sample values used to pre-populate parameters on startup.
// In a real application these would come from the model/bus layer.
const sampleValues = {
  temp_abitacolo: 21.5,
  temp_impostata: 22.0,
  temp_esterna: 14.2,
  umidita: 65,
  ventilazione_attiva: true,
  aria_ricircolo: false,
  velocita_ventola: 3,
  modalita_clima: 'AUTO',
  porta_ant_sx: false,
  porta_ant_dx: false,
  porta_post_sx: false,
  porta_post_dx: false,
  blocco_centrale: true,
  cofano: false,
  portabagagli: false,
  finestre_chiuse: true,
  allarme_batteria: false,
  allarme_temp_motore: false,
  allarme_pressione: false,
  allarme_olio: false,
  allarme_abs: false,
  allarme_airbag: false,
  allarme_carburante: true,
  livello_carburante: 23,
  versione_hmi: '1.0.3',
  stato_rete: 'ONLINE',
  connessione: 'CAN-BUS',
  uptime: 142,
  tensione_batteria: 12.4,
  temperatura_cpu: 48,
  data_sistema: '23/04/2026',
  ora_sistema: '17:30',
}

export const useMenuState = () => {
  // ── Selectable pages ──────────────────────────────────────
  const selectablePages = flattenSelectablePages(menuConfig.pages)
  const selectablePageIndexById = new Map(
    selectablePages.map((page, index) => [page.id, index]),
  )

  // ── Navigation state ──────────────────────────────────────
  const currentPageId = ref(selectablePages[0]?.id ?? menuConfig.pages[0].id)
  const menuPath = ref([])
  const menuModeEnabled = ref(false)

  // ── Parameter values – initialised from sampleValues ──────
  // Only the first occurrence of each parameter id is kept to
  // avoid accidental cross-page aliasing.
  const seenParameterIds = new Set()
  const uniqueParameters = selectablePages
    .flatMap((page) => page.parameters)
    .filter((p) => {
      if (seenParameterIds.has(p.id)) return false
      seenParameterIds.add(p.id)
      return true
    })

  const parameterValues = reactive(
    Object.fromEntries(uniqueParameters.map((p) => [p.id, sampleValues[p.id] ?? null])),
  )

  // ── Parameter actions ─────────────────────────────────────
  const toggleParameter = (id) => {
    if (typeof parameterValues[id] === 'boolean') {
      parameterValues[id] = !parameterValues[id]
      return
    }
    const param = uniqueParameters.find((p) => p.id === id)
    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(parameterValues[id]))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      parameterValues[id] = param.options[nextIndex]
    }
  }

  const setParameterValue = (id, value) => {
    if (id in parameterValues) {
      parameterValues[id] = value
    }
  }

  // ── Theme ─────────────────────────────────────────────────
  const isDark = ref(true)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.body.dataset.theme = isDark.value ? 'dark' : 'light'
  }

  onMounted(() => {
    document.body.dataset.theme = isDark.value ? 'dark' : 'light'
  })

  // ── Menu navigation helpers ───────────────────────────────
  const findPathToPage = (pages, targetId, currentPath = []) => {
    for (const page of pages) {
      if (page.id === targetId) {
        return currentPath
      }
      if (page.submenus?.length) {
        const result = findPathToPage(page.submenus, targetId, [...currentPath, page.id])
        if (result !== null) return result
      }
    }
    return null
  }

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
    if (!menuPath.value.length) {
      return
    }
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
    if (!menuPath.value.length) {
      return 'Menu'
    }
    const currentContainer = findPageById(
      menuConfig.pages,
      menuPath.value[menuPath.value.length - 1],
    )
    return currentContainer?.label ?? 'Menu'
  })

  return {
    // config
    menuConfig,
    // state
    currentPageId,
    menuPath,
    menuModeEnabled,
    parameterValues,
    isDark,
    // computed
    currentPage,
    pageCounterLabel,
    breadcrumbs,
    visibleMenuItems,
    currentMenuTitle,
    isOnHomePage,
    // actions
    toggleParameter,
    setParameterValue,
    toggleTheme,
    toggleMenuMode,
    navigateToBreadcrumb,
    selectMenuItem,
    goToParentMenu,
    goHome,
  }
}
