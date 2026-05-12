import { applicationConfig } from '../composables/applicationConfig.js'
import { useTransactionPageActions } from '../composables/useTransactionPageActions.js'
import { useCurrentPageParameterRefresh } from '../composables/useCurrentPageParameterRefresh.js'
import PageParametersView from './PageParametersView.jsx'
import HmiLinkGridPage from './HmiLinkGridPage.jsx'
import HmiThemeSettingsPage from './HmiThemeSettingsPage.jsx'

const SETTINGS_PAGE_ID = 'tema'

export default function HmiContentRouter({
  currentPage,
  isAtHome,
  currentPagePanels,
  currentPanelIndex,
  pageParameters,
  handlePanelChange,
  navigateToPage,
  notifications,
  navigation,
}) {
  const {
    isTransactionPage,
    currentPageValues,
    currentPageModifiedIds,
    canSubmitTransaction,
    handleToggleParameter,
    handleSetParameterValue,
    handleResetTransaction,
    handleSubmitTransaction,
  } = useTransactionPageActions({ currentPage, notifications, navigation })

  useCurrentPageParameterRefresh({ currentPage, pageParameters })

  const visibleHomePages = (applicationConfig.pages ?? []).filter((item) => item.visibility !== 'hidden')
  const visibleCurrentSubmenus = (currentPage?.submenus ?? []).filter((item) => item.visibility !== 'hidden')

  if (isAtHome) {
    return <HmiLinkGridPage items={visibleHomePages} onNavigate={navigateToPage} />
  }

  if (visibleCurrentSubmenus.length > 0) {
    return <HmiLinkGridPage items={visibleCurrentSubmenus} onNavigate={navigateToPage} />
  }

  if (currentPage?.id === SETTINGS_PAGE_ID) {
    return <HmiThemeSettingsPage />
  }

  return (
    <PageParametersView
      parameters={pageParameters}
      parameterValues={currentPageValues}
      transactionMode={isTransactionPage}
      modifiedParameterIds={currentPageModifiedIds}
      canSubmitTransaction={canSubmitTransaction}
      panels={currentPagePanels}
      currentPanel={currentPanelIndex}
      onToggleParameter={handleToggleParameter}
      onSetParameterValue={handleSetParameterValue}
      onResetTransaction={handleResetTransaction}
      onSubmitTransaction={handleSubmitTransaction}
      onPanelChange={handlePanelChange}
    />
  )
}
