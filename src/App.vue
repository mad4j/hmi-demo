<script setup>
import { computed, ref } from 'vue'
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
    },
  ],
}

const buildConfig = () => {
  try {
    const parsedConfig = load(rawMenuConfig)
    const sourceConfig =
      parsedConfig && typeof parsedConfig === 'object' ? parsedConfig : {}
    const sourcePages = Array.isArray(sourceConfig.pages) ? sourceConfig.pages : []
    const normalizedPages = sourcePages
      .filter((page) => page && typeof page === 'object')
      .map((page, index) => ({
        id: typeof page.id === 'string' && page.id.trim() ? page.id : `page-${index + 1}`,
        label:
          typeof page.label === 'string' && page.label.trim()
            ? page.label
            : `Pagina ${index + 1}`,
        title:
          typeof page.title === 'string' && page.title.trim()
            ? page.title
            : `Pagina ${index + 1}`,
        content: typeof page.content === 'string' ? page.content : '',
      }))

    if (!normalizedPages.length) {
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
const currentPageIndex = ref(0)

const currentPage = computed(
  () => menuConfig.pages[currentPageIndex.value] ?? menuConfig.pages[0] ?? fallbackConfig.pages[0],
)
const pageCounterLabel = computed(() => `${currentPageIndex.value + 1}/${menuConfig.pages.length}`)
const menuModeEnabled = ref(false)

const toggleMenuMode = () => {
  menuModeEnabled.value = !menuModeEnabled.value
}

const selectPage = (index) => {
  currentPageIndex.value = index
  menuModeEnabled.value = false
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
        <h1>Menu</h1>
        <ul class="menu-list">
          <li v-for="(page, index) in menuConfig.pages" :key="page.id">
            <button class="menu-item" type="button" @click="selectPage(index)">
              {{ page.label }}
            </button>
          </li>
        </ul>
      </template>
      <template v-else>
        <h1>{{ currentPage.title }}</h1>
        <p>{{ currentPage.content }}</p>
      </template>
    </main>

    <footer class="bar bottom-bar">
      <span class="menu-indicator" role="status" aria-live="polite">
        {{ currentPage.label }} ({{ pageCounterLabel }})
      </span>
      <span class="menu-hint">Attiva ☰ per scorrere e selezionare il menu</span>
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
}

h1 {
  font-size: 1.3rem;
  font-weight: 700;
}

p {
  max-width: 60ch;
}
</style>
