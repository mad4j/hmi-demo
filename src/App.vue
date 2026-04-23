<script setup>
import { computed, ref } from 'vue'
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
    },
  ],
}

const MAX_MENU_DEPTH = 8

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

const toggleMenuMode = () => {
  menuModeEnabled.value = !menuModeEnabled.value
  if (menuModeEnabled.value) {
    menuPath.value = []
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
        <h1>{{ currentMenuTitle }}</h1>
        <button v-if="menuPath.length" class="menu-back-button" type="button" @click="goToParentMenu">
          ← Indietro
        </button>
        <ul class="menu-list">
          <li v-for="item in visibleMenuItems" :key="item.id">
            <button class="menu-item" type="button" @click="selectMenuItem(item)">
              <span>{{ item.label }}</span>
              <span v-if="item.submenus.length" class="submenu-indicator" aria-hidden="true">›</span>
            </button>
          </li>
        </ul>
      </template>
      <template v-else>
        <h1>{{ currentPage.title }}</h1>
        <p v-if="currentPage.content">{{ currentPage.content }}</p>
        <div class="widget-grid">
          <ParameterWidget name="Velocità" :value="87.3" type="number" unit="km/h" :precision="1" />
          <ParameterWidget name="Temperatura" :value="42" type="number" unit="°C" />
          <ParameterWidget name="Pressione" :value="2.45" type="number" unit="bar" :precision="2" />
          <ParameterWidget name="Modalità" :value="'AUTO'" type="enum" />
          <ParameterWidget name="Stato" :value="'PRONTO'" type="enum" />
          <ParameterWidget name="Acceso" :value="true" type="boolean" />
          <ParameterWidget name="Allarme" :value="false" type="boolean" />
        </div>
      </template>
    </main>

    <footer class="bar bottom-bar">
      <span class="menu-indicator" role="status" aria-live="polite">
        {{ currentPage.label }} ({{ pageCounterLabel }})
      </span>
      <span class="menu-hint">Attiva ☰ per aprire, entrare nei sottomenu e selezionare</span>
    </footer>
  </div>
</template>

<style scoped>
.hmi-shell {
  display: grid;
  grid-template-rows: 4rem 1fr 4.5rem;
  width: 100%;
  height: 100%;
  background: #829258;
  color: #0f380f;
  border: 2px solid #0f380f;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #829258;
  border-bottom: 2px solid #0f380f;
  font-weight: 700;
}

.top-left {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}

.bottom-bar {
  border-bottom: 0;
  border-top: 2px solid #0f380f;
  gap: 0.75rem;
}

.status {
  font-size: 0.9rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  font-size: 1.05rem;
  overflow: hidden;
}

button {
  border: 2px solid #0f380f;
  border-radius: 0.4rem;
  background: #829258;
  color: #0f380f;
  font-size: 1rem;
  font-weight: 700;
  touch-action: manipulation;
}

.icon-button {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.menu-indicator {
  flex: 0 1 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f380f;
  font-size: 1rem;
  font-weight: 700;
}

.menu-hint {
  font-size: 0.95rem;
}

.menu-list {
  width: min(100%, 30rem);
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  overflow-y: auto;
}

.menu-item {
  width: 100%;
  min-height: 2.8rem;
  padding: 0.45rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-back-button {
  min-height: 2.5rem;
  padding: 0.35rem 0.8rem;
}

.submenu-indicator {
  margin-left: 0.65rem;
  font-size: 1.2rem;
  line-height: 1;
}

h1 {
  font-size: 1.3rem;
  font-weight: 700;
}

p {
  max-width: 60ch;
}

.widget-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}
</style>
