<script setup>
import ParameterWidget from './components/ParameterWidget.vue'
import AppMenu from './components/AppMenu.vue'
import { useMenuState } from './composables/useMenuState.js'

const {
  menuConfig,
  currentPageId,
  menuModeEnabled,
  parameterValues,
  isDark,
  currentPage,
  pageCounterLabel,
  breadcrumbs,
  visibleMenuItems,
  toggleParameter,
  toggleTheme,
  toggleMenuMode,
  navigateToBreadcrumb,
  selectMenuItem,
  isOnHomePage,
  goHome,
} = useMenuState()
</script>

<template>
  <div class="hmi-shell" :data-theme="isDark ? 'dark' : 'light'">
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
        <button
          v-if="menuModeEnabled || !isOnHomePage"
          class="icon-button"
          type="button"
          aria-label="Torna alla pagina principale"
          @click="goHome"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
            <polyline points="9 21 9 12 15 12 15 21"/>
          </svg>
        </button>
        <span>{{ menuConfig.title }}</span>
      </div>
      <div class="top-right">
        <button
          class="icon-button"
          type="button"
          :aria-label="isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
          @click="toggleTheme"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <span class="status">{{ menuConfig.status }}</span>
      </div>
    </header>

    <main class="content">
      <template v-if="menuModeEnabled">
        <AppMenu
          :breadcrumbs="breadcrumbs"
          :visible-menu-items="visibleMenuItems"
          :current-page-id="currentPageId"
          @navigate-breadcrumb="navigateToBreadcrumb"
          @select-item="selectMenuItem"
        />
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
            @toggle="toggleParameter(param.id)"
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
  grid-template-rows: 3.5rem 1fr 3.5rem;
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

.bottom-bar {
  border-bottom: 0;
  border-top: 1px solid var(--border);
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Status badge */
.status {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--status-bg);
  color: var(--status-color);
  border: 1px solid var(--status-border);
  transition: background 0.25s, color 0.25s, border-color 0.25s;
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

/* ── Menu list ──────────────────────────────────────────── */
h1 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.02em;
  text-transform: uppercase;
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

@media (max-width: 599px) {
  .widget-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 399px) {
  .widget-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
