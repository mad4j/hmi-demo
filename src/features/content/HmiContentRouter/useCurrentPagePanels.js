import { useState, useEffect, useMemo } from 'react'

// CACHE GLOBALE: Ricorda l'ultimo pannello visitato per ogni ID pagina
const panelHistoryCache = new Map()

export const useCurrentPagePanels = ({ currentPage }) => {
  // Inizializza con il valore in cache (se esiste), altrimenti parte da 0
  const [currentPanelIndex, setCurrentPanelIndex] = useState(() => {
    return panelHistoryCache.get(currentPage?.id) || 0
  })

  // Quando cambia la pagina, recupera il pannello dalla cache invece di azzerare sempre
  useEffect(() => {
    if (currentPage?.id) {
      const savedIndex = panelHistoryCache.get(currentPage.id) || 0
      setCurrentPanelIndex(savedIndex)
    }
  }, [currentPage?.id])

  

  // panels reali (sia array che oggetto-normalizzato → sempre array dopo menuConfig)
  const currentPagePanels = useMemo(() => {
    return Array.isArray(currentPage?.panels) ? currentPage.panels : null
  }, [currentPage])

  const currentPanel = useMemo(() => {
    return currentPagePanels?.[currentPanelIndex] ?? null
  }, [currentPagePanels, currentPanelIndex])

  // parametri del panel attivo (o della pagina se non ci sono panels)
  const pageParameters = useMemo(() => {
    if (currentPagePanels) {
      return currentPanel?.parameters ?? []
    }
    return currentPage?.parameters ?? []
  }, [currentPagePanels, currentPanel, currentPage])

  // submenus del panel attivo (per i panel di tipo "submenu")
  const pageSubmenus = useMemo(() => {
    if (currentPagePanels) {
      return currentPanel?.submenus ?? []
    }
    return currentPage?.submenus ?? []
  }, [currentPagePanels, currentPanel, currentPage])

  const handlePanelChange = (index) => {
    const validIndex = index >= 0 ? index : 0
    setCurrentPanelIndex(validIndex)
    
    // Quando l'utente cambia pannello, salviamo la sua scelta nella cache!
    if (currentPage?.id) {
      panelHistoryCache.set(currentPage.id, validIndex)
    }
  }

  const currentPanelLabel = useMemo(() => {
    return currentPanel?.label ?? ''
  }, [currentPanel])

  return {
    currentPagePanels,
    currentPanelIndex,
    currentPanel,
    pageParameters,
    pageSubmenus,
    currentPanelLabel,
    handlePanelChange,
  }
}