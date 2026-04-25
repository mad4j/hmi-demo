<script setup>
import PageParametersView from './components/PageParametersView.vue'
import ParameterWidget from './components/ParameterWidget.vue'
import AppIcon from './components/AppIcon.vue'
import StatusIconBar from './components/StatusIconBar.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { menuConfig } from './composables/useMenuConfig.js'
import { useMenuNavigation } from './composables/useMenuNavigation.js'
import { useTheme } from './composables/useTheme.js'
import { useParameterStore } from './composables/useParameterStore.js'

const {
  currentPage,
  showingSecondLevel,
  level1Items,
  secondLevelItems,
  activeLevel1Id,
  selectLevel1Item,
  selectLevel2Item,
  goBack,
  goHome,
} = useMenuNavigation()

const { isDark, toggleTheme } = useTheme()

const { parameterValues, toggleParameter, setParameterValue } = useParameterStore()

// ── Grid layout helpers ───────────────────────────────────
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 800)

const onResize = () => { viewportWidth.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const widgetCols = computed(() => {
  if (viewportWidth.value <= 399) return 2
  if (viewportWidth.value <= 599) return 3
  return 4
})

const submenuCols = computed(() => {
  if (viewportWidth.value <= 399) return 2
  return 3
})

// Returns a style object with gridColumnStart for each item in the last
// incomplete row so that the row is centred horizontally inside the grid.
const centredGridStyle = (index, total, cols) => {
  const lastRowCount = total % cols || cols
  if (lastRowCount === cols) return {}
  const firstInLastRow = total - lastRowCount
  if (index < firstInLastRow) return {}
  const offset = Math.floor((cols - lastRowCount) / 2)
  const posInRow = index - firstInLastRow
  return { gridColumnStart: offset + posInRow + 1 }
}

// +1 for the back tile prepended in the template
const submenuTileStyle = (index) =>
  centredGridStyle(index, secondLevelItems.value.length + 1, submenuCols.value)

// ── Settings page ───────────────────────────────────────
const SETTINGS_PAGE_ID = 'tema'
</script>

<template>
  <div class="hmi-shell" :data-theme="isDark ? 'dark' : 'light'">
    <header class="bar top-bar">
      <div class="top-left">
        <span>{{ menuConfig.title }}</span>
      </div>
      <div class="top-right">
        <StatusIconBar />
      </div>
    </header>

    <main class="content">
      <template v-if="showingSecondLevel">
        <div class="submenu-page">
          <div class="submenu-grid">
            <!-- back tile (always first, index 0) -->
            <button
              class="submenu-tile submenu-tile--back"
              :style="submenuTileStyle(0)"
              type="button"
              aria-label="Indietro"
              @click="goBack"
            >
              <AppIcon name="back" :size="28" />
              <span class="tile-label">Indietro</span>
            </button>
            <!-- second-level items (index starts at 1) -->
            <button
              v-for="(item, idx) in secondLevelItems"
              :key="item.id"
              class="submenu-tile"
              :style="submenuTileStyle(idx + 1)"
              type="button"
              @click="selectLevel2Item(item)"
            >
              <AppIcon v-if="item.icon" :name="item.icon" :size="28" />
              <span class="tile-label">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-if="currentPage.id === SETTINGS_PAGE_ID" class="settings-page">
          <div class="settings-widget">
            <ParameterWidget
              name="Tema scuro"
              type="boolean"
              :value="isDark"
              @toggle="toggleTheme"
            />
          </div>
        </div>
        <PageParametersView
          v-else
          :parameters="currentPage.parameters"
          :parameter-values="parameterValues"
          :viewport-width="viewportWidth"
          @toggle-parameter="toggleParameter"
          @set-parameter-value="setParameterValue"
        />
      </template>
    </main>

    <footer class="bar bottom-bar">
      <button
        class="tab-button tab-button--home"
        type="button"
        aria-label="Home"
        @click="goHome"
      >
        <AppIcon name="home" :size="22" class="tab-icon" />
        <span class="tab-label">Home</span>
      </button>
      <button
        v-for="item in level1Items"
        :key="item.id"
        class="tab-button"
        :class="{ 'tab-button--active': item.id === activeLevel1Id }"
        type="button"
        @click="selectLevel1Item(item)"
      >
        <AppIcon v-if="item.icon" :name="item.icon" :size="22" class="tab-icon" />
        <span class="tab-label">{{ item.label }}</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
/* ── Theme: dark (default) ──────────────────────────────── */
.hmi-shell[data-theme='dark'] {
  --bg-main: #161b22;
  --bg-bar: #0d1117;
  --bg-btn: #21262d;
  --border: #30363d;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-blue: #58a6ff;
  --text-green: #3fb950;
  --status-bg: rgba(35, 134, 54, 0.2);
  --status-border: rgba(63, 185, 80, 0.4);
  --status-color: #3fb950;
  --btn-active-bg: #388bfd22;
  --btn-active-border: #388bfd;
  --active-border: rgba(63, 185, 80, 0.5);
  --active-name-bg: rgba(35, 134, 54, 0.2);
  --active-name-border: rgba(63, 185, 80, 0.4);
  --active-text: #3fb950;
}

/* ── Theme: light ───────────────────────────────────────── */
.hmi-shell[data-theme='light'] {
  --bg-main: #f6f8fa;
  --bg-bar: #ffffff;
  --bg-btn: #f0f3f6;
  --border: #d0d7de;
  --text-primary: #1f2328;
  --text-secondary: #57606a;
  --text-blue: #0550ae;
  --text-green: #1a7f37;
  --status-bg: rgba(31, 136, 61, 0.1);
  --status-border: rgba(31, 136, 61, 0.35);
  --status-color: #1a7f37;
  --btn-active-bg: rgba(5, 80, 174, 0.1);
  --btn-active-border: #0550ae;
  --active-border: rgba(31, 136, 61, 0.45);
  --active-name-bg: rgba(31, 136, 61, 0.1);
  --active-name-border: rgba(31, 136, 61, 0.35);
  --active-text: #1a7f37;
}

/* ── Shell ──────────────────────────────────────────────── */
.hmi-shell {
  display: grid;
  grid-template-rows: 3.5rem 1fr 4.5rem;
  width: 100%;
  height: 100%;
  background: var(--bg-main);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: background 0.25s, color 0.25s, border-color 0.25s;
}

/* ── Bars ───────────────────────────────────────────────── */
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  background: var(--bg-bar);
  border-bottom: 1px solid var(--border);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  transition: background 0.25s, border-color 0.25s;
}

.top-left {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.top-right {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

/* ── Bottom tab bar ─────────────────────────────────────── */
.bottom-bar {
  border-bottom: 0;
  border-top: 1px solid var(--border);
  padding: 0;
  gap: 0;
  align-items: stretch;
  justify-content: space-around;
}

.tab-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.35rem 0.25rem;
  border: none;
  border-left: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.tab-button:first-child {
  border-left: none;
}

.tab-button:active {
  background: var(--btn-active-bg);
}

.tab-button--active {
  color: var(--text-blue);
  background: var(--btn-active-bg);
  border-top: 2px solid var(--btn-active-border);
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.tab-label {
  font-size: 0.68rem;
}

/* ── Content ────────────────────────────────────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

/* ── Buttons ────────────────────────────────────────────── */
button {
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  background: var(--bg-btn);
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

button:active {
  background: var(--btn-active-bg);
  border-color: var(--btn-active-border);
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

/* ── Second-level submenu page ──────────────────────────── */
.submenu-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.submenu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.submenu-tile {
  /* fixed height prevents tiles from overflowing the content area on wide screens */
  height: 5.5rem;
  min-width: 0;
  padding: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-align: center;
  border-radius: 0.6rem;
}

.submenu-tile--back {
  color: var(--text-secondary);
  border-color: var(--border);
}

.tile-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.2;
}

/* ── Widget grid ────────────────────────────────────────── */
.widget-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  width: 100%;
  margin: auto 0;
}

/* ── Settings page ──────────────────────────────────────── */
.settings-page {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.settings-widget {
  width: calc((100% - 1.5rem) / 4);
}

@media (max-width: 599px) {
  .widget-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .settings-widget {
    width: calc((100% - 1rem) / 3);
  }
}

@media (max-width: 399px) {
  .widget-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .settings-widget {
    width: calc((100% - 0.5rem) / 2);
  }

  .submenu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px), (max-height: 600px) {
  .hmi-shell {
    border-radius: 0;
    border: none;
  }
}
</style>
