import { useEffect } from 'react'
import './App.css'
import HmiShell from './components/HmiShell.jsx'
import HmiHeaderContainer from './components/HmiHeaderContainer.jsx'
import HmiNotificationBar from './components/HmiNotificationBar.jsx'
import HmiFooter from './components/HmiFooter.jsx'
import HmiContentRouter from './components/HmiContentRouter.jsx'
import { menuConfig, findPageById } from './composables/menuConfig.js'
import { applicationConfig } from './composables/applicationConfig.js'
import { useMenuNavigation } from './composables/useMenuNavigation.js'
import { useTheme } from './composables/useTheme.js'
import { useParameterStore } from './composables/useParameterStore.js'
import { useNotificationBar } from './composables/useNotificationBar.js'
import { useCurrentPagePanels } from './composables/useCurrentPagePanels.js'
import { useLogoutPageAction } from './features/page-actions/useLogoutPageAction.js'

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

  const { theme } = useTheme()
  const { parameterValues, setParameterValue } = useParameterStore()

  const { currentPagePanels, currentPanelIndex, pageParameters, currentPanelLabel, handlePanelChange } =
    useCurrentPagePanels({ currentPage })

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

  const visibleHomePages = (applicationConfig.pages ?? []).filter((item) => item.visibility !== 'hidden')
  const autoOpenedHomePageId = visibleHomePages.length === 1 ? (visibleHomePages[0]?.id ?? null) : null
  const isHomeTabActive = isAtHome || (autoOpenedHomePageId !== null && currentPage?.id === autoOpenedHomePageId)
  const activeLevel1IdForFooter = isHomeTabActive ? null : activeLevel1Id

  // Auto-navigate when home screen has exactly one page
  useEffect(() => {
    if (!isAtHome || !autoOpenedHomePageId) return
    navigateToPage(autoOpenedHomePageId)
  }, [isAtHome, autoOpenedHomePageId]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <HmiShell
      theme={theme}
      header={<HmiHeaderContainer />}
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
      <HmiContentRouter
        currentPage={currentPage}
        isAtHome={isAtHome}
        currentPagePanels={currentPagePanels}
        currentPanelIndex={currentPanelIndex}
        pageParameters={pageParameters}
        handlePanelChange={handlePanelChange}
        navigateToPage={navigateToPage}
        notifications={notifications}
        navigation={navigation}
      />
    </HmiShell>
  )
}
