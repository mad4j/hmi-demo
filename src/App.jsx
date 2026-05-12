import { useState, useEffect, useRef } from 'react'
import './App.css'
import HmiShell from './components/HmiShell.jsx'
import HmiHeader from './components/HmiHeader.jsx'
import HmiNotificationBar from './components/HmiNotificationBar.jsx'
import HmiFooter from './components/HmiFooter.jsx'
import PageParametersView from './components/PageParametersView.jsx'
import ParameterWidget from './components/ParameterWidget.jsx'
import EnumEditorModal from './components/EnumEditorModal.jsx'
import LinkWidget from './components/LinkWidget.jsx'
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

const SETTINGS_PAGE_ID = 'tema'
const LOGOUT_PAGE_ID = 'logout'

const NOTIFICATION_ICON = {
  MENU: 'menu',
  NORMAL: 'info',
  SUCCESS: 'check-circle',
  WARNING: 'fault',
  ERROR: 'x-circle',
}

export default function App() {
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

  const { currentPagePanels, pageParameters, currentPanelLabel, handlePanelChange } =
    useCurrentPagePanels({ currentPage })

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

  const menuLabel = currentPage?.label ?? ''
  const menuNotificationMessage = currentPanelLabel ? `${menuLabel} / ${currentPanelLabel}` : menuLabel

  const {
    notification,
    pendingCount,
    notificationBarClasses,
    setNotification,
    handleNotificationTap,
    disposeNotificationBar,
  } = useNotificationBar({ menuMessage: menuNotificationMessage })

  useEffect(() => {
    return () => { disposeNotificationBar() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const notifications = { setNotification }
  const navigation = { goHome, goToPreviousPage }

  const notificationIcon = NOTIFICATION_ICON[notification.status] ?? 'info'

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

  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const visibleCurrentSubmenus = (currentPage?.submenus ?? []).filter((item) => item.visibility !== 'hidden')
  const visibleHomePages = (applicationConfig.pages ?? []).filter((item) => item.visibility !== 'hidden')
  const autoOpenedHomePageId = visibleHomePages.length === 1 ? (visibleHomePages[0]?.id ?? null) : null
  const isHomeTabActive = isAtHome || (autoOpenedHomePageId !== null && currentPage?.id === autoOpenedHomePageId)
  const activeLevel1IdForFooter = isHomeTabActive ? null : activeLevel1Id

  // Auto-navigate to only home page
  const didAutoNavigateRef = useRef(false)
  useEffect(() => {
    if (!isAtHome || !autoOpenedHomePageId) return
    navigateToPage(autoOpenedHomePageId)
  }) // runs every render, same as watchEffect

  useCurrentPageParameterRefresh({ currentPage, pageParameters, refreshParameters })

  const logoutPageConfig = findPageById(menuConfig.pages, LOGOUT_PAGE_ID)

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

  const [isEditingTheme, setIsEditingTheme] = useState(false)

  const renderContent = () => {
    if (isAtHome) {
      return (
        <div className="widget-grid">
          {visibleHomePages.map((item) => (
            <LinkWidget key={item.id} label={item.label} icon={item.icon} onNavigate={() => navigateToPage(item.id)} />
          ))}
        </div>
      )
    }
    if (visibleCurrentSubmenus.length > 0) {
      return (
        <div className="widget-grid">
          {visibleCurrentSubmenus.map((item) => (
            <LinkWidget key={item.id} label={item.label} icon={item.icon} onNavigate={() => navigateToPage(item.id)} />
          ))}
        </div>
      )
    }
    if (currentPage?.id === SETTINGS_PAGE_ID) {
      return (
        <div className="settings-page">
          <div className="settings-widget">
            <ParameterWidget
              name="Theme"
              type="enum"
              value={theme.toUpperCase()}
              options={VALID_THEMES.map((t) => t.toUpperCase())}
              onEdit={() => setIsEditingTheme(true)}
            />
          </div>
          {isEditingTheme && (
            <EnumEditorModal
              name="Theme"
              value={theme.toUpperCase()}
              options={VALID_THEMES.map((t) => t.toUpperCase())}
              onConfirm={(v) => { setTheme(v.toLowerCase()); setIsEditingTheme(false) }}
              onCancel={() => setIsEditingTheme(false)}
            />
          )}
        </div>
      )
    }
    return (
      <PageParametersView
        parameters={pageParameters}
        parameterValues={currentPageValues}
        transactionMode={isTransactionPage}
        modifiedParameterIds={currentPageModifiedIds}
        canSubmitTransaction={canSubmitTransaction}
        viewportWidth={viewportWidth}
        panels={currentPagePanels}
        onToggleParameter={handleToggleParameter}
        onSetParameterValue={handleSetParameterValue}
        onResetTransaction={handleResetTransaction}
        onSubmitTransaction={handleSubmitTransaction}
        onPanelChange={handlePanelChange}
      />
    )
  }

  return (
    <HmiShell
      theme={theme}
      header={<HmiHeader />}
      notification={
        <HmiNotificationBar
          icon={notificationIcon}
          message={notification.message}
          pendingCount={pendingCount}
          barClasses={notificationBarClasses}
          onTap={handleNotificationTap}
        />
      }
      footer={
        <HmiFooter
          level1Items={level1Items}
          activeLevel1Id={activeLevel1IdForFooter}
          isAtHome={isHomeTabActive}
          canGoToPreviousPage={canGoToPreviousPage}
          onGoBack={goToPreviousPage}
          onGoHome={goHome}
          onSelectItem={selectLevel1Item}
        />
      }
    >
      {renderContent()}
    </HmiShell>
  )
}
