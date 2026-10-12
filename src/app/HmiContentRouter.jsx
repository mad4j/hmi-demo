import { applicationConfig } from '@core/config/applicationConfig.js'
import { useTransactionPageActions } from '@features/transaction'
import { PageParametersView, useCurrentPageParameterRefresh } from '@features/parameters'
import { HmiLinkGridPage } from '@features/navigation'
import { HmiThemeSettingsPage } from '@features/theme'

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
