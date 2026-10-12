import { useTransactionPageActions } from './useTransactionPageActions.js'
import { useCurrentPagePanels } from './useCurrentPagePanels.js'
import { useCurrentPageParameterRefresh } from './useCurrentPageParameterRefresh.js'

import PageParametersView from '@/features/parameters/PageParametersView/PageParametersView.jsx'
import HmiLinkGridPage from '@/features/link-grid/HmiLinkGridPage/HmiLinkGridPage.jsx'
import HmiThemeSettingsPage from '@/features/settings/HmiThemeSettingsPage/HmiThemeSettingsPage.jsx'
import HmiScreenSettingsPage from '@/features/settings/HmiScreenSettingsPage/HmiScreenSettingsPage.jsx'

const SETTINGS_PAGE_ID = 'tema'
const SCREEN_PAGE_ID = 'screen'

export default function HmiContentRouter({
  currentPage,
  isAtHome,
  navigateToPage,
}) {
  // Estraggo anche pageSubmenus, che legge i sottomenu del panel attivo!
  const {
    currentPagePanels,
    currentPanelIndex,
    pageParameters,
    pageSubmenus,
    handlePanelChange,
  } = useCurrentPagePanels({ currentPage })

  const {
    currentPageValues,
    handleToggleParameter,
    handleSubmitTransaction,
    handleRefreshParameters,
  } = useTransactionPageActions({ currentPage })

  useCurrentPageParameterRefresh({ currentPage, currentPanelIndex, pageParameters })
  
  // Usiamo pageSubmenus invece di currentPage.submenus
  const visibleSubmenus = (pageSubmenus ?? []).filter(
    (p) => p.visibility !== 'hidden'
  )
  const visibleParameters = (pageParameters ?? []).filter(
    (p) => p.visibility !== 'hidden'
  )


  if (currentPage?.id === SETTINGS_PAGE_ID) {
    return <HmiThemeSettingsPage />
  }

  if (currentPage?.id === SCREEN_PAGE_ID) {
    return <HmiScreenSettingsPage />
  }

  const hasPanels = Array.isArray(currentPagePanels) && currentPagePanels.length > 0



  // Se la pagina NON ha panels e contiene solo sottomenu, mostriamo direttamente la LinkGrid
  if (!hasPanels && visibleSubmenus.length > 0 && visibleParameters.length === 0) {
    return <HmiLinkGridPage items={visibleSubmenus} onNavigate={navigateToPage} />
  }

  // Altrimenti (come nella tua Home), passiamo TUTTO al PageParametersView,
  // inclusi i submenus e la funzione onNavigate.
  return (
    <PageParametersView
      pageId ={currentPage?.id}
      parameters={visibleParameters}
      submenus={visibleSubmenus}
      parameterValues={currentPageValues}
      panels={currentPagePanels}
      currentPanel={currentPanelIndex}
      onToggleParameter={handleToggleParameter}
      onSubmitTransaction={handleSubmitTransaction}
      onRefreshParameter={handleRefreshParameters}
      onPanelChange={handlePanelChange}
      onNavigate={navigateToPage}
    />
  )



}