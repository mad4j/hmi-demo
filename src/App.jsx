import { useState, useEffect, useMemo } from 'react'
import { HmiShell } from './components/HmiShell.jsx'
import { HmiHeader } from './components/HmiHeader.jsx'
import { HmiNotificationBar } from './components/HmiNotificationBar.jsx'
import { HmiFooter } from './components/HmiFooter.jsx'
import { PageParametersView } from './components/PageParametersView.jsx'
import { ParameterWidget } from './components/ParameterWidget.jsx'
import { EnumEditorModal } from './components/EnumEditorModal.jsx'
import { LinkWidget } from './components/LinkWidget.jsx'
import { menuConfig, findPageById } from './composables/useMenuConfig.js'
import { applicationConfig } from './composables/useApplicationConfig.js'
import { useMenuNavigation } from './hooks/useMenuNavigation.js'
import { useTheme, VALID_THEMES } from './hooks/useTheme.js'
import { useParameterStore } from './hooks/useParameterStore.js'
import { useNotificationBar } from './hooks/useNotificationBar.js'
import { useTransactionPageActions } from './hooks/useTransactionPageActions.js'
import { useCurrentPagePanels } from './hooks/useCurrentPagePanels.js'
import { useLogoutPageAction } from './hooks/useLogoutPageAction.js'
import './App.css'

export default function App() {
  // Navigation hooks
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

  // Theme management
  const { theme, setTheme } = useTheme()

  // Parameter management
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

  // Page panels
  const {
    currentPagePanels,
    pageParameters,
    currentPanelLabel,
    handlePanelChange,
  } = useCurrentPagePanels({ currentPage })

  // Viewport tracking
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 800
  )

  // Theme settings modal
  const [isEditingTheme, setIsEditingTheme] = useState(false)

  // Menu message for notifications
  const menuNotificationMessage = useMemo(() => {
    const menuLabel = currentPage?.label ?? ''
    return currentPanelLabel ? `${menuLabel} / ${currentPanelLabel}` : menuLabel
  }, [currentPage, currentPanelLabel])

  // Notification management
  const {
    notification,
    notificationBarClasses,
    setNotification,
    handleNotificationTap,
    disposeNotificationBar,
  } = useNotificationBar({ menuMessage: menuNotificationMessage })

  // Transaction store object
  const transactionStore = useMemo(() => ({
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
  }), [
    toggleParameter, setParameterValue, toggleTransactionParameter,
    setTransactionParameterValue, getTransactionDisplayValues,
    getTransactionModifiedIds, hasTransactionChanges, resetTransactionPage,
    commitTransactionPage, refreshParameters
  ])

  // Notifications object
  const notifications = useMemo(() => ({
    setNotification,
  }), [setNotification])

  // Navigation object
  const navigation = useMemo(() => ({
    goHome,
    goToPreviousPage,
  }), [goHome, goToPreviousPage])

  // Transaction actions
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

  // Viewport resize handling
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      disposeNotificationBar()
    }
  }, [disposeNotificationBar])

  // Home page helpers
  const visibleCurrentSubmenus = useMemo(() =>
    (currentPage?.submenus ?? []).filter((item) => item.visibility !== 'hidden')
  , [currentPage])

  const visibleHomePages = useMemo(() =>
    (applicationConfig.pages ?? []).filter((item) => item.visibility !== 'hidden')
  , [])

  const autoOpenedHomePageId = useMemo(() =>
    visibleHomePages.length === 1 ? visibleHomePages[0]?.id ?? null : null
  , [visibleHomePages])

  const isHomeTabActive = useMemo(() =>
    isAtHome || (autoOpenedHomePageId !== null && currentPage?.id === autoOpenedHomePageId)
  , [isAtHome, autoOpenedHomePageId, currentPage])

  const activeLevel1IdForFooter = useMemo(() =>
    isHomeTabActive ? null : activeLevel1Id
  , [isHomeTabActive, activeLevel1Id])

  // Auto-navigate to single home page
  useEffect(() => {
    if (!isAtHome || !autoOpenedHomePageId) return
    navigateToPage(autoOpenedHomePageId)
  }, [isAtHome, autoOpenedHomePageId, navigateToPage])

  // Settings and logout page constants
  const SETTINGS_PAGE_ID = 'tema'
  const LOGOUT_PAGE_ID = 'logout'
  const logoutPageConfig = findPageById(menuConfig.pages, LOGOUT_PAGE_ID)

  // Logout page action
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

  // Notification icons mapping
  const NOTIFICATION_ICON = {
    MENU: 'menu',
    NORMAL: 'info',
    SUCCESS: 'check-circle',
    WARNING: 'alarm',
    ERROR: 'x-circle',
  }

  const notificationIcon = NOTIFICATION_ICON[notification.status] ?? 'info'

  // Render different page types
  const renderPageContent = () => {
    if (isAtHome) {
      return (
        <div className="widget-grid">
          {visibleHomePages.map((item) => (
            <LinkWidget
              key={item.id}
              label={item.label}
              icon={item.icon}
              onNavigate={() => navigateToPage(item.id)}
            />
          ))}
        </div>
      )
    }

    if (visibleCurrentSubmenus.length > 0) {
      return (
        <div className="widget-grid">
          {visibleCurrentSubmenus.map((item) => (
            <LinkWidget
              key={item.id}
              label={item.label}
              icon={item.icon}
              onNavigate={() => navigateToPage(item.id)}
            />
          ))}
        </div>
      )
    }

    if (currentPage?.id === SETTINGS_PAGE_ID) {
      return (
        <>
          <div className="settings-page">
            <div className="settings-widget">
              <ParameterWidget
                name="Theme"
                type="enum"
                value={theme.toUpperCase()}
                options={VALID_THEMES.map((t) => ({ value: t.toUpperCase(), label: t.toUpperCase() }))}
                onEdit={() => setIsEditingTheme(true)}
              />
            </div>
          </div>
          {isEditingTheme && (
            <EnumEditorModal
              name="Theme"
              value={theme.toUpperCase()}
              options={VALID_THEMES.map((t) => ({ value: t.toUpperCase(), label: t.toUpperCase() }))}
              onConfirm={(v) => {
                setTheme(v.toLowerCase())
                setIsEditingTheme(false)
              }}
              onCancel={() => setIsEditingTheme(false)}
            />
          )}
        </>
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
    <HmiShell theme={theme}>
      <HmiHeader />
      
      <HmiNotificationBar
        icon={notificationIcon}
        message={notification.message}
        barClasses={notificationBarClasses}
        onTap={handleNotificationTap}
      />
      
      {renderPageContent()}
      
      <HmiFooter
        level1Items={level1Items}
        activeLevel1Id={activeLevel1IdForFooter}
        isAtHome={isHomeTabActive}
        canGoToPreviousPage={canGoToPreviousPage}
        onGoBack={goToPreviousPage}
        onGoHome={goHome}
        onSelectItem={selectLevel1Item}
      />
    </HmiShell>
  )
}