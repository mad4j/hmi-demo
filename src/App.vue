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
const canGoPrevious = computed(() => currentPageIndex.value > 0)
const canGoNext = computed(() => currentPageIndex.value < menuConfig.pages.length - 1)
const pageCounterLabel = computed(() => `${currentPageIndex.value + 1}/${menuConfig.pages.length}`)

const goPreviousPage = () => {
  if (canGoPrevious.value) {
    currentPageIndex.value -= 1
  }
}

const goNextPage = () => {
  if (canGoNext.value) {
    currentPageIndex.value += 1
  }
}
</script>

<template>
  <div class="hmi-shell">
    <header class="bar top-bar">
      <span>{{ menuConfig.title }}</span>
      <span class="status">{{ menuConfig.status }}</span>
    </header>

    <main class="content">
      <h1>{{ currentPage.title }}</h1>
      <p>{{ currentPage.content }}</p>
    </main>

    <footer class="bar bottom-bar">
      <button type="button" :disabled="!canGoPrevious" @click="goPreviousPage">
        ← {{ menuConfig.navigation.previousLabel }}
      </button>
      <span class="menu-indicator" role="status" aria-live="polite">
        {{ currentPage.label }} ({{ pageCounterLabel }})
      </span>
      <button type="button" :disabled="!canGoNext" @click="goNextPage">
        {{ menuConfig.navigation.nextLabel }} →
      </button>
    </footer>
  </div>
</template>

<style scoped>
.hmi-shell {
  display: grid;
  grid-template-rows: 4rem 1fr 4.5rem;
  width: 100%;
  height: 100%;
  background: #9bbc0f;
  color: #0f380f;
  border: 2px solid #0f380f;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: #8bac0f;
  border-bottom: 2px solid #0f380f;
  font-weight: 700;
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
}

button {
  flex: 1;
  height: 3rem;
  border: 2px solid #0f380f;
  border-radius: 0.4rem;
  background: #9bbc0f;
  color: #0f380f;
  font-size: 1rem;
  font-weight: 700;
  touch-action: manipulation;
}

button:disabled {
  opacity: 0.55;
}

.menu-indicator {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border: 2px solid #0f380f;
  border-radius: 0.4rem;
  background: #9bbc0f;
  color: #0f380f;
  font-size: 1rem;
  font-weight: 700;
}

h1 {
  font-size: 1.3rem;
  font-weight: 700;
}

p {
  max-width: 60ch;
}
</style>
