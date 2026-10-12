import { useEffect } from 'react'
import './App.css'
import HmiShell from '@/features/shell/HmiShell/HmiShell.jsx'
import HmiHeaderContainer from '@/features/header/HmiHeaderContainer/HmiHeaderContainer.jsx'
import HmiNotificationBar from '@/features/notifications/HmiNotificationBar/HmiNotificationBar.jsx'
import CriticalAlertModal from '@/features/notifications/CriticalAlertModal/CriticalAlertModal.jsx'
import HmiFooter from '@/features/footer/HmiFooter/HmiFooter.jsx'
import HmiContentRouter from '@/features/content/HmiContentRouter/HmiContentRouter.jsx'
import { menuConfig, findPageById } from '@/features/navigation/menuConfig.js'
import { useMenuNavigation } from '@/features/navigation/useMenuNavigation.js'
import { useTheme } from '@/features/settings/HmiThemeSettingsPage/useTheme.js'
import { useParameterStore } from '@/features/parameters/useParameterStore.js'
import { useNotificationBar } from '@/features/notifications/useNotificationBar.js'
import { useCurrentPagePanels } from '@/features/content/HmiContentRouter/useCurrentPagePanels.js'
import { useLogoutPageAction } from './useLogoutPageAction.js'
import '@/features/settings/HmiScreenSettingsPage/useScreenProfile.js'
import IconMenu from '@/icons/IconMenu.jsx'
import IconAlarm from '@/icons/IconAlarm.jsx'
import IconInfo from '@/icons/IconInfo.jsx'
import IconCheckCircle from '@/icons/IconCheckCircle.jsx'
import IconFault from '@/icons/IconFault.jsx'
import IconXCircle from '@/icons/IconXCircle.jsx'

const LOGOUT_PAGE_ID = 'logout'

const NOTIFICATION_ICON = {
  MENU: IconMenu,
  CRITICAL: IconAlarm,
  NORMAL: IconInfo,
  SUCCESS: IconCheckCircle,
  WARNING: IconFault,
  ERROR: IconXCircle,
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
    isCriticalAcknowledgementRequired,
    setNotification,
    acknowledgeNotification,
    handleNotificationTap,
    disposeNotificationBar,
  } = useNotificationBar({ menuMessage: menuNotificationMessage })

  useEffect(() => {
    return () => { disposeNotificationBar() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') return undefined

    const previousDebug = window.hmiDebug ?? {}

    window.hmiDebug = {
      ...previousDebug,
      notify(status, message, options = {}) {
        setNotification(String(status ?? 'NORMAL').trim().toUpperCase(), String(message ?? ''), options)
      },
      notifyCritical(message = 'Simulated CRITICAL alert for operator acknowledgement test.') {
        setNotification('CRITICAL', String(message), { displayMode: 'ACKNOWLEDGED' })
      },
    }

    return () => {
      if (window.hmiDebug) {
        delete window.hmiDebug.notify
        delete window.hmiDebug.notifyCritical
      }
    }
  }, [setNotification])

  const notifications = { setNotification }
  const navigation = { goHome, goToPreviousPage }

  const notificationIcon = NOTIFICATION_ICON[notification.status] ?? IconInfo

const visibleHomePages =
  (menuConfig.homePage?.panels ?? [])


const autoOpenedHomePageId =
  visibleHomePages.length === 2
    ? (menuConfig.homePage?.id ?? null)
    : null

const isHomeTabActive =
  isAtHome ||
  (
    autoOpenedHomePageId !== null &&
    currentPage?.id === autoOpenedHomePageId
  )

const activeLevel1IdForFooter =
  isHomeTabActive ? null : activeLevel1Id

// Auto-navigate when home screen has exactly one page
useEffect(() => {
  if (!isAtHome || !autoOpenedHomePageId) return

  navigateToPage(autoOpenedHomePageId)
}, [isAtHome, autoOpenedHomePageId]) // eslint-disable-line react-hooks/exhaustive-deps

const logoutPageConfig =
  findPageById(menuConfig.pages, LOGOUT_PAGE_ID)
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
          Icon={notificationIcon}
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
        navigateToPage={navigateToPage}
        notifications={notifications}
        navigation={navigation}
      />
      {isCriticalAcknowledgementRequired && (
        <CriticalAlertModal
          message={notification.message}
          onAcknowledge={acknowledgeNotification}
        />
      )}
    </HmiShell>
  )
}
