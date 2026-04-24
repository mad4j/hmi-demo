<script setup>
import ParameterWidget from './components/ParameterWidget.vue'
import PercentageEditorModal from './components/PercentageEditorModal.vue'
import { ref, computed } from 'vue'
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
} = useMenuNavigation()

const { isDark, toggleTheme } = useTheme()

const { parameterValues, toggleParameter, setParameterValue } = useParameterStore()

// ── Percentage editor state ───────────────────────────────
const editingParamId = ref(null)

const editingParam = computed(() =>
  editingParamId.value
    ? currentPage.value.parameters.find((p) => p.id === editingParamId.value) ?? null
    : null,
)

const startEditParameter = (id) => {
  editingParamId.value = id
}

const confirmEdit = (newValue) => {
  if (editingParamId.value !== null) {
    setParameterValue(editingParamId.value, newValue)
  }
  editingParamId.value = null
}

const cancelEdit = () => {
  editingParamId.value = null
}
</script>

<template>
  <div class="hmi-shell" :data-theme="isDark ? 'dark' : 'light'">
    <header class="bar top-bar">
      <div class="top-left">
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
      <template v-if="showingSecondLevel">
        <div class="submenu-page">
          <button class="back-button" type="button" aria-label="Indietro" @click="goBack">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Indietro
          </button>
          <div class="submenu-grid">
            <button
              v-for="item in secondLevelItems"
              :key="item.id"
              class="submenu-button"
              type="button"
              @click="selectLevel2Item(item)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
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
            :options="param.options"
            :value="parameterValues[param.id]"
            :readonly="param.readonly"
            @toggle="toggleParameter(param.id)"
            @edit="startEditParameter(param.id)"
          />
        </div>
      </template>
    </main>

    <footer class="bar bottom-bar">
      <button
        v-for="item in level1Items"
        :key="item.id"
        class="tab-button"
        :class="{ 'tab-button--active': item.id === activeLevel1Id }"
        type="button"
        @click="selectLevel1Item(item)"
      >
        <span class="tab-icon" aria-hidden="true">{{ item.icon }}</span>
        <span class="tab-label">{{ item.label }}</span>
      </button>
    </footer>

    <PercentageEditorModal
      v-if="editingParam"
      :name="editingParam.name"
      :value="parameterValues[editingParam.id] ?? 0"
      @confirm="confirmEdit"
      @cancel="cancelEdit"
    />
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
  font-size: 1.4rem;
  line-height: 1;
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
  justify-content: center;
  padding: 0.75rem;
  min-height: 0;
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

.back-button {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.88rem;
}

.submenu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

.submenu-button {
  min-height: 4rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 0.5rem;
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

@media (max-width: 600px), (max-height: 600px) {
  .hmi-shell {
    border-radius: 0;
    border: none;
  }
}
</style>
