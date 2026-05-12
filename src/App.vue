<script setup>
import HmiShell from './components/HmiShell.vue'
import HmiHeader from './components/HmiHeader.vue'
import HmiNotificationBar from './components/HmiNotificationBar.vue'
import HmiFooter from './components/HmiFooter.vue'
import PageParametersView from './components/PageParametersView.vue'
import ParameterWidget from './components/ParameterWidget.vue'
import EnumEditorModal from './components/EnumEditorModal.vue'
import LinkWidget from './components/LinkWidget.vue'
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { menuConfig, findPageById } from './composables/useMenuConfig.js'
import { applicationConfig } from './composables/useApplicationConfig.js'
import { useMenuNavigation } from './composables/useMenuNavigation.js'
import { useTheme, VALID_THEMES } from './composables/useTheme.js'
import { useParameterStore } from './composables/useParameterStore.js'
import { useNotificationBar } from './composables/useNotificationBar.js'
import { useTransactionPageActions } from './composables/useTransactionPageActions.js'
import { useCurrentPagePanels } from './composables/useCurrentPagePanels.js'
import { useCurrentPageParameterRefresh } from './composables/useCurrentPageParameterRefresh.js'
import { useLogoutPageAction } from './features/page-actions/useLogoutPageAction.js'

const {
  currentPage,
  isAtHome,
  level1Items,
  activeLevel1Id,
  selectLevel1Item,
  goHome,
  goToPreviousPage,
  canGoToPreviousPage,
  navigateToPage,
} = useMenuNavigation()

const { theme, setTheme } = useTheme()

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
  currentPagePanels,
  pageParameters,
  currentPanelLabel,
  handlePanelChange,
} = useCurrentPagePanels({ currentPage })

const transactionStore = {
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
}

const menuNotificationMessage = computed(() => {
  const menuLabel = currentPage.value?.label ?? ''
  return currentPanelLabel.value ? `${menuLabel} / ${currentPanelLabel.value}` : menuLabel
})

const {
  notification,
  pendingCount,
  notificationBarClasses,
  setNotification,
  handleNotificationTap,
  disposeNotificationBar,
} = useNotificationBar({ menuMessage: menuNotificationMessage })

const notifications = {
  setNotification,
}

const navigation = {
  goHome,
  goToPreviousPage,
}

const NOTIFICATION_ICON = {
  MENU: 'menu',
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
  transactionStore,
  notifications,
  navigation,
})

// ── Grid layout helpers ───────────────────────────────────
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 800)

const onResize = () => { viewportWidth.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  disposeNotificationBar()
})

const visibleCurrentSubmenus = computed(() =>
  (currentPage.value?.submenus ?? []).filter((item) => item.visibility !== 'hidden'),
)

const visibleHomePages = computed(() =>
  (applicationConfig.pages ?? []).filter((item) => item.visibility !== 'hidden'),
)

const autoOpenedHomePageId = computed(() =>
  visibleHomePages.value.length === 1 ? visibleHomePages.value[0]?.id ?? null : null,
)

const isHomeTabActive = computed(() =>
  isAtHome.value ||
  (autoOpenedHomePageId.value !== null && currentPage.value?.id === autoOpenedHomePageId.value),
)

const activeLevel1IdForFooter = computed(() =>
  isHomeTabActive.value ? null : activeLevel1Id.value,
)

watchEffect(() => {
  if (!isAtHome.value || !autoOpenedHomePageId.value) return
  navigateToPage(autoOpenedHomePageId.value)
})

useCurrentPageParameterRefresh({
  currentPage,
  pageParameters,
  refreshParameters,
})

// ── Settings page ───────────────────────────────────────
const SETTINGS_PAGE_ID = 'tema'
const LOGOUT_PAGE_ID = 'logout'
const logoutPageConfig = findPageById(menuConfig.pages, LOGOUT_PAGE_ID)
const isEditingTheme = ref(false)

useLogoutPageAction({
  currentPage,
  parameterValues,
  setParameterValue,
  setNotification,
  goHome,
  goToPreviousPage,
  logoutPageId: LOGOUT_PAGE_ID,
  logoutPageGoOnApply: logoutPageConfig?.goOnApply ?? 'STAY_HERE',
})
</script>

<template>
  <HmiShell :theme="theme">
    <template #header>
      <HmiHeader />
    </template>

    <template #notification>
      <HmiNotificationBar
        :icon="notificationIcon"
        :message="notification.message"
        :pending-count="pendingCount"
        :bar-classes="notificationBarClasses"
        @tap="handleNotificationTap"
      />
    </template>

    <template v-if="isAtHome">
      <div class="widget-grid">
        <LinkWidget
          v-for="item in visibleHomePages"
          :key="item.id"
          :label="item.label"
          :icon="item.icon"
          @navigate="navigateToPage(item.id)"
        />
      </div>
    </template>
    <template v-else-if="visibleCurrentSubmenus.length">
      <div class="widget-grid">
        <LinkWidget
          v-for="item in visibleCurrentSubmenus"
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
            name="Theme"
            type="enum"
            :value="theme.toUpperCase()"
            :options="VALID_THEMES.map((t) => t.toUpperCase())"
            @edit="isEditingTheme = true"
          />
        </div>
      </div>
      <EnumEditorModal
        v-if="isEditingTheme"
        name="Theme"
        :value="theme.toUpperCase()"
        :options="VALID_THEMES.map((t) => t.toUpperCase())"
        @confirm="(v) => { setTheme(v.toLowerCase()); isEditingTheme = false }"
        @cancel="isEditingTheme = false"
      />
    </template>
    <template v-else>
      <PageParametersView
        :parameters="pageParameters"
        :parameter-values="currentPageValues"
        :transaction-mode="isTransactionPage"
        :modified-parameter-ids="currentPageModifiedIds"
        :can-submit-transaction="canSubmitTransaction"
        :viewport-width="viewportWidth"
        :panels="currentPagePanels"
        @toggle-parameter="handleToggleParameter"
        @set-parameter-value="handleSetParameterValue"
        @reset-transaction="handleResetTransaction"
        @submit-transaction="handleSubmitTransaction"
        @panel-change="handlePanelChange"
      />
    </template>

    <template #footer>
      <HmiFooter
        :level1-items="level1Items"
        :active-level1-id="activeLevel1IdForFooter"
        :is-at-home="isHomeTabActive"
        :can-go-to-previous-page="canGoToPreviousPage"
        @go-back="goToPreviousPage"
        @go-home="goHome"
        @select-item="selectLevel1Item"
      />
    </template>
  </HmiShell>
</template>

<style scoped>
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
  .widget-grid > * {
    flex: 0 0 calc(50% - 0.25rem);
  }

  .settings-widget {
    width: calc((100% - 0.5rem) / 2);
  }
}
</style>
