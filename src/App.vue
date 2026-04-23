<script setup>
import { computed, reactive, ref } from 'vue'
import ParameterWidget from './components/ParameterWidget.vue'
import { load } from 'js-yaml'
import rawMenuConfig from './config/menu.yml?raw'

const fallbackConfig = {
  title: 'HMI Demo',
  status: 'ONLINE',
  navigation: {
    previousLabel: 'Precedente',
    nextLabel: 'Successiva',
  },
  pages: [
    {
      id: 'home',
      label: 'Menu',
      title: 'Menu principale',
      content: 'Interfaccia ottimizzata per 800x600 e uso su mezzi mobili.',
      submenus: [],
      parameters: [],
    },
  ],
}

const MAX_MENU_DEPTH = 8

const normalizeParameters = (params) => {
  if (!Array.isArray(params)) return []
  return params
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim())
    .map((p) => ({
      id: p.id.trim(),
      name: typeof p.name === 'string' && p.name.trim() ? p.name : p.id.trim(),
      type: ['number', 'enum', 'boolean'].includes(p.type) ? p.type : 'number',
      unit: typeof p.unit === 'string' ? p.unit : '',
      precision: typeof p.precision === 'number' ? p.precision : null,
    }))
}

const normalizeMenuItems = (items, idPrefix = 'page', depth = 0) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const id =
        typeof item.id === 'string' && item.id.trim() ? item.id : `${idPrefix}-${index + 1}`
      const normalizedSubmenus = Array.isArray(item.submenus)
        ? depth < MAX_MENU_DEPTH
          ? normalizeMenuItems(item.submenus, `${id}-submenu`, depth + 1)
          : []
        : []

      return {
        id,
        label:
          typeof item.label === 'string' && item.label.trim() ? item.label : `Pagina ${index + 1}`,
        title:
          typeof item.title === 'string' && item.title.trim() ? item.title : `Pagina ${index + 1}`,
        content: typeof item.content === 'string' ? item.content : '',
        submenus: normalizedSubmenus,
        parameters: normalizeParameters(item.parameters),
      }
    })

const flattenSelectablePages = (pages) =>
  pages.flatMap((page) =>
    page.submenus.length ? flattenSelectablePages(page.submenus) : [page],
  )

const findPageById = (pages, targetId) => {
  for (const page of pages) {
    if (page.id === targetId) {
      return page
    }

    if (page.submenus.length) {
      const nestedPage = findPageById(page.submenus, targetId)
      if (nestedPage) {
        return nestedPage
      }
    }
  }

  return null
}

const getMenuItemsByPath = (pages, path) => {
  let currentItems = pages

  for (const id of path) {
    const currentNode = currentItems.find((item) => item.id === id)
    if (!currentNode || !currentNode.submenus.length) {
      return pages
    }
    currentItems = currentNode.submenus
  }

  return currentItems
}

const buildConfig = () => {
  try {
    const parsedConfig = load(rawMenuConfig)
    const sourceConfig =
      parsedConfig && typeof parsedConfig === 'object' ? parsedConfig : {}
    const sourcePages = Array.isArray(sourceConfig.pages) ? sourceConfig.pages : []
    const normalizedPages = normalizeMenuItems(sourcePages)
    const selectablePages = flattenSelectablePages(normalizedPages)

    if (!normalizedPages.length || !selectablePages.length) {
      return fallbackConfig
    }

    return {
      title:
        typeof sourceConfig.title === 'string' && sourceConfig.title.trim()
          ? sourceConfig.title
          : fallbackConfig.title,
      status:
        typeof sourceConfig.status === 'string' && sourceConfig.status.trim()
          ? sourceConfig.status
          : fallbackConfig.status,
      navigation: {
        previousLabel:
          typeof sourceConfig.navigation?.previousLabel === 'string' &&
          sourceConfig.navigation.previousLabel.trim()
            ? sourceConfig.navigation.previousLabel
            : fallbackConfig.navigation.previousLabel,
        nextLabel:
          typeof sourceConfig.navigation?.nextLabel === 'string' &&
          sourceConfig.navigation.nextLabel.trim()
            ? sourceConfig.navigation.nextLabel
            : fallbackConfig.navigation.nextLabel,
      },
      pages: normalizedPages,
    }
  } catch {
    return fallbackConfig
  }
}

const menuConfig = buildConfig()
const selectablePages = flattenSelectablePages(menuConfig.pages)
const selectablePageIndexById = new Map(selectablePages.map((page, index) => [page.id, index]))
const currentPageId = ref(selectablePages[0]?.id ?? fallbackConfig.pages[0].id)
const menuPath = ref([])
const menuModeEnabled = ref(false)

// Reactive map of parameter id → current value (null = not yet received from model).
// Only the first occurrence of each id is kept to avoid accidental cross-page aliasing.
const seenParameterIds = new Set()
const uniqueParameters = selectablePages
  .flatMap((page) => page.parameters)
  .filter((p) => {
    if (seenParameterIds.has(p.id)) return false
    seenParameterIds.add(p.id)
    return true
  })
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

const parameterValues = reactive(
  Object.fromEntries(uniqueParameters.map((p) => [p.id, sampleValues[p.id] ?? null])),
)

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

const currentPage = computed(
  () =>
    findPageById(menuConfig.pages, currentPageId.value) ??
    selectablePages[0] ??
    fallbackConfig.pages[0],
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

const navigateToBreadcrumb = (index) => {
  menuPath.value = menuPath.value.slice(0, index)
}

const visibleMenuItems = computed(() => getMenuItemsByPath(menuConfig.pages, menuPath.value))
const currentMenuTitle = computed(() => {
  if (!menuPath.value.length) {
    return 'Menu'
  }
  const currentContainer = findPageById(menuConfig.pages, menuPath.value[menuPath.value.length - 1])
  return currentContainer?.label ?? 'Menu'
})

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
</script>

<template>
  <div class="hmi-shell">
    <header class="bar top-bar">
      <div class="top-left">
        <button
          class="icon-button"
          type="button"
          :aria-pressed="menuModeEnabled"
          aria-label="Apri menu"
          @click="toggleMenuMode"
        >
          ☰
        </button>
        <span>{{ menuConfig.title }}</span>
      </div>
      <span class="status">{{ menuConfig.status }}</span>
    </header>

    <main class="content">
      <template v-if="menuModeEnabled">
        <nav class="menu-breadcrumb" aria-label="Percorso menu">
          <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id ?? 'root'">
            <span v-if="i > 0" class="breadcrumb-sep" aria-hidden="true">›</span>
            <button
              v-if="i < breadcrumbs.length - 1"
              type="button"
              class="breadcrumb-item"
              @click="navigateToBreadcrumb(i)"
            >{{ crumb.label }}</button>
            <span v-else class="breadcrumb-item breadcrumb-item--current">{{ crumb.label }}</span>
          </template>
        </nav>
        <ul class="menu-list">
          <li v-for="item in visibleMenuItems" :key="item.id">
            <button
              class="menu-item"
              :class="{ 'menu-item--current': item.id === currentPageId }"
              type="button"
              @click="selectMenuItem(item)"
            >
              <span>{{ item.label }}</span>
              <span v-if="item.submenus.length" class="submenu-indicator" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </template>
      <template v-else>
        <div v-if="currentPage.parameters.length" class="widget-grid">
          <ParameterWidget
            v-for="param in currentPage.parameters"
            :key="param.id"
            :name="param.name"
            :type="param.type"
            :unit="param.unit"
            :precision="param.precision"
            :value="parameterValues[param.id]"
          />
        </div>
      </template>
    </main>

    <footer class="bar bottom-bar">
      <span class="menu-indicator" role="status" aria-live="polite">
        {{ currentPage.label }} ({{ pageCounterLabel }})
      </span>
    </footer>
  </div>
</template>

<style scoped>
/* ── Shell ──────────────────────────────────────────────── */
.hmi-shell {
  display: grid;
  grid-template-rows: 3.5rem 1fr 3.5rem;
  width: 100%;
  height: 100%;
  background: #161b22;
  color: #e6edf3;
  border: 1px solid #30363d;
  border-radius: 0.5rem;
  overflow: hidden;
}

/* ── Bars ───────────────────────────────────────────────── */
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #0d1117;
  border-bottom: 1px solid #30363d;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
}

.top-left {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.bottom-bar {
  border-bottom: 0;
  border-top: 1px solid #30363d;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #8b949e;
}

/* Status badge */
.status {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(35, 134, 54, 0.2);
  color: #3fb950;
  border: 1px solid rgba(63, 185, 80, 0.4);
}

/* ── Content ────────────────────────────────────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  overflow: hidden;
}

/* ── Buttons ────────────────────────────────────────────── */
button {
  border: 1px solid #30363d;
  border-radius: 0.4rem;
  background: #21262d;
  color: #e6edf3;
  font-size: 1rem;
  font-weight: 600;
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

button:active {
  background: #388bfd22;
  border-color: #388bfd;
}

.icon-button[aria-pressed='true'] {
  background: #388bfd22;
  border-color: #388bfd;
  color: #58a6ff;
}

.icon-button {
  width: 2.4rem;
  height: 2.4rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  border-radius: 0.4rem;
}

/* ── Menu indicator ─────────────────────────────────────── */
.menu-indicator {
  flex: 0 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 600;
}

/* ── Menu breadcrumb ────────────────────────────────────── */
.menu-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-wrap: wrap;
  width: min(100%, 32rem);
}

.breadcrumb-item {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b949e;
  padding: 0.2rem 0.45rem;
  min-height: unset;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 0.3rem;
  transition: color 0.12s, background 0.12s;
}

.breadcrumb-item:not(.breadcrumb-item--current):hover {
  color: #e6edf3;
  background: #21262d;
  border-color: #30363d;
}

.breadcrumb-item--current {
  color: #e6edf3;
  cursor: default;
  display: inline-flex;
  align-items: center;
}

.breadcrumb-sep {
  color: #484f58;
  font-size: 1rem;
  line-height: 1;
  user-select: none;
}

/* ── Menu list ──────────────────────────────────────────── */

.menu-list {
  width: min(100%, 32rem);
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  min-height: 3.2rem;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.4rem;
  border: 1px solid #30363d;
  background: #21262d;
  font-size: 1rem;
  color: #e6edf3;
}

.menu-item:active {
  background: #388bfd22;
  border-color: #388bfd;
}

.menu-item--current {
  border-color: #388bfd;
  background: #388bfd22;
  color: #58a6ff;
}

.submenu-indicator {
  margin-left: 0.65rem;
  font-size: 1.15rem;
  color: #8b949e;
  line-height: 1;
}

p {
  max-width: 60ch;
}

/* ── Widget grid ────────────────────────────────────────── */
.widget-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  width: 100%;
}
</style>
