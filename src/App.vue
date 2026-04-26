<script setup>
import PageParametersView from './components/PageParametersView.vue'
import ParameterWidget from './components/ParameterWidget.vue'
import LinkWidget from './components/LinkWidget.vue'
import AppIcon from './components/AppIcon.vue'
import StatusIconBar from './components/StatusIconBar.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { menuConfig } from './composables/useMenuConfig.js'
import { useMenuNavigation } from './composables/useMenuNavigation.js'
import { useTheme } from './composables/useTheme.js'
import { useParameterStore } from './composables/useParameterStore.js'
import { useNotificationBar } from './composables/useNotificationBar.js'
import { useTransactionPageActions } from './composables/useTransactionPageActions.js'

const {
  currentPage,
  level1Items,
  activeLevel1Id,
  selectLevel1Item,
  goHome,
  goToPreviousPage,
  canGoToPreviousPage,
  navigateToPage,
} = useMenuNavigation()

const { isDark, toggleTheme } = useTheme()

const {
  parameterValues,
  toggleParameter,
  setParameterValue,
  toggleTransactionParameter,
  setTransactionParameterValue,
  getTransactionDisplayValues,
  getTransactionModifiedIds,
  hasTransactionChanges,
  resetTransactionPage,
  commitTransactionPage,
  refreshParameters,
} = useParameterStore()

const {
  notification,
  pendingCount,
  notificationBarClasses,
  setNotification,
  handleNotificationTap,
  disposeNotificationBar,
} = useNotificationBar()

const NOTIFICATION_ICON = {
  NORMAL: 'info',
  SUCCESS: 'check-circle',
  WARNING: 'fault',
  ERROR: 'x-circle',
}

const notificationIcon = computed(
  () => NOTIFICATION_ICON[notification.value.status] ?? 'info',
)

const {
  isTransactionPage,
  currentPageValues,
  currentPageModifiedIds,
  canSubmitTransaction,
  handleToggleParameter,
  handleSetParameterValue,
  handleResetTransaction,
  handleSubmitTransaction,
} = useTransactionPageActions({
  currentPage,
  parameterValues,
  setNotification,
  goHome,
  goToPreviousPage,
  toggleParameter,
  setParameterValue,
  toggleTransactionParameter,
  setTransactionParameterValue,
  getTransactionDisplayValues,
  getTransactionModifiedIds,
  hasTransactionChanges,
  resetTransactionPage,
  commitTransactionPage,
})

// ── Grid layout helpers ───────────────────────────────────
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 800)

const onResize = () => { viewportWidth.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  disposeNotificationBar()
})

const widgetCols = computed(() => {
  if (viewportWidth.value <= 399) return 2
  if (viewportWidth.value <= 599) return 3
  return 4
})

// ── Refresh parameters on page navigation ────────────────
watch(
  () => currentPage.value,
  (page) => {
    if (!page) return
    const ids = page.parameters?.map((p) => p.id) ?? []
    if (ids.length > 0) {
      refreshParameters(ids)
    }
  },
)

// ── Settings page ───────────────────────────────────────
const SETTINGS_PAGE_ID = 'tema'
const LOGOUT_PAGE_ID = 'logout'

const logoutInProgress = ref(false)

watch(
  () => currentPage.value?.id,
  async (pageId) => {
    if (pageId !== LOGOUT_PAGE_ID || logoutInProgress.value) return

    const wasLoggedIn = parameterValues.status_login === 'ok'
    logoutInProgress.value = true
    setNotification('WARNING', 'Logout in corso...')
    try {
      // Always send both credentials reset commands: local values can already
      // be empty due to clearOnApply, while remote state may still be logged in.
      const nameResult = await setParameterValue('login_name', '')
      const passwordResult = await setParameterValue('login_password', '')

      if (!nameResult.ok || !passwordResult.ok) {
        const msg = (!nameResult.ok ? nameResult.message : passwordResult.message)
          ?? 'Errore durante il logout: comando non applicato.'
        setNotification('ERROR', msg, { displayMode: 'ACKNOWLEDGED' })
      } else if (wasLoggedIn) {
        setNotification('SUCCESS', 'Logout completato con successo.')
      } else {
        setNotification('WARNING', 'Nessuna sessione attiva: utente gia disconnesso.')
      }
      navigateToPage('login')
    } finally {
      logoutInProgress.value = false
    }
  },
)
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

    <div
      class="notification-bar"
      :class="notificationBarClasses"
      role="status"
      aria-live="polite"
      @click="handleNotificationTap"
    >
      <AppIcon :name="notificationIcon" :size="16" class="notification-icon" aria-hidden="true" />
      <span class="notification-message">{{ notification.message }}</span>
      <span
        v-if="pendingCount > 0"
        class="notification-count"
        aria-label="Messaggi in coda"
      >
        {{ pendingCount }}
      </span>
    </div>

    <main class="content">
      <template v-if="currentPage.submenus.length">
        <div class="widget-grid">
          <LinkWidget
            v-for="item in currentPage.submenus"
            :key="item.id"
            :label="item.label"
            :icon="item.icon"
            @navigate="navigateToPage(item.id)"
          />
        </div>
      </template>
      <template v-else-if="currentPage.id === SETTINGS_PAGE_ID">
        <div class="settings-page">
          <div class="settings-widget">
            <ParameterWidget
              name="Tema scuro"
              type="boolean"
              :value="isDark"
              @toggle="toggleTheme"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <PageParametersView
          :parameters="currentPage.parameters"
          :parameter-values="currentPageValues"
          :transaction-mode="isTransactionPage"
          :modified-parameter-ids="currentPageModifiedIds"
          :can-submit-transaction="canSubmitTransaction"
          :viewport-width="viewportWidth"
          @toggle-parameter="handleToggleParameter"
          @set-parameter-value="handleSetParameterValue"
          @reset-transaction="handleResetTransaction"
          @submit-transaction="handleSubmitTransaction"
        />
      </template>
    </main>

    <footer class="bar bottom-bar">
      <button
        class="tab-button tab-button--back"
        type="button"
        aria-label="Back"
        :disabled="!canGoToPreviousPage"
        @click="goToPreviousPage"
      >
        <AppIcon name="back" :size="22" class="tab-icon" />
      </button>
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
  --transaction-modified-border: #c99500;
  --transaction-modified-bg: #fff3bf;
  --transaction-modified-text: #5f4300;
  --notification-normal-bg: var(--bg-bar);
  --notification-normal-border: var(--border);
  --notification-normal-text: var(--text-primary);
  --notification-warning-bg: #4a3900;
  --notification-warning-border: #c99500;
  --notification-warning-text: #ffe08a;
  --notification-success-bg: #123a22;
  --notification-success-border: #2ea043;
  --notification-success-text: #b7f5c8;
  --notification-error-bg: #4b141b;
  --notification-error-border: #f85149;
  --notification-error-text: #ffd6d6;
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
  --transaction-modified-border: #c99500;
  --transaction-modified-bg: #fff3bf;
  --transaction-modified-text: #5f4300;
  --notification-normal-bg: var(--bg-bar);
  --notification-normal-border: var(--border);
  --notification-normal-text: var(--text-primary);
  --notification-warning-bg: #fff3bf;
  --notification-warning-border: #c99500;
  --notification-warning-text: #5f4300;
  --notification-success-bg: #dcffe4;
  --notification-success-border: #2da44e;
  --notification-success-text: #0f5132;
  --notification-error-bg: #ffe3e3;
  --notification-error-border: #d1242f;
  --notification-error-text: #7f1d1d;
}

/* ── Shell ──────────────────────────────────────────────── */
.hmi-shell {
  display: grid;
  grid-template-rows: 3.5rem auto 1fr 4.5rem;
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

.notification-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 2rem;
  padding: 0.25rem 0.85rem;
  border-bottom: 1px solid var(--notification-normal-border);
  background: var(--notification-normal-bg);
  color: var(--notification-normal-text);
  font-size: 0.9rem;
  line-height: 1.15;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.notification-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
}

.notification-message {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-count {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 0.12rem 0.35rem;
  border-radius: 999px;
  border: 1px solid currentColor;
  opacity: 0.85;
}

.notification-bar--normal {
  background: var(--notification-normal-bg);
  border-bottom-color: var(--notification-normal-border);
  color: var(--notification-normal-text);
}

.notification-bar--warning {
  background: var(--notification-warning-bg);
  border-bottom-color: var(--notification-warning-border);
  color: var(--notification-warning-text);
}

.notification-bar--success {
  background: var(--notification-success-bg);
  border-bottom-color: var(--notification-success-border);
  color: var(--notification-success-text);
}

.notification-bar--error {
  background: var(--notification-error-bg);
  border-bottom-color: var(--notification-error-border);
  color: var(--notification-error-text);
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

.tab-button--back {
  flex: 0.333333;
}

.tab-button:disabled {
  color: var(--text-secondary);
  opacity: 0.45;
  cursor: pointer;
}

.tab-button:disabled:active {
  background: transparent;
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

/* ── Widget grid ────────────────────────────────────────── */
.widget-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin: auto 0;
}

.widget-grid > * {
  box-sizing: border-box;
  flex: 0 0 calc(25% - 0.375rem);
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
  .widget-grid > * {
    flex: 0 0 calc(33.333% - 0.334rem);
  }

  .settings-widget {
    width: calc((100% - 1rem) / 3);
  }
}

@media (max-width: 399px) {
  .notification-bar {
    font-size: 0.86rem;
    line-height: 1.12;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
  }

  .notification-count {
    font-size: 0.64rem;
  }

  .widget-grid > * {
    flex: 0 0 calc(50% - 0.25rem);
  }

  .settings-widget {
    width: calc((100% - 0.5rem) / 2);
  }
}

@media (max-width: 600px), (max-height: 600px) {
  .hmi-shell {
    border-radius: 0;
    border: none;
  }
}
</style>
