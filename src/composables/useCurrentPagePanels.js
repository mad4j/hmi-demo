import { useState, useEffect, useMemo } from 'react'

export const useCurrentPagePanels = ({ currentPage }) => {
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  // Reset panel index when page changes
  useEffect(() => {
    setCurrentPanelIndex(0)
  }, [currentPage?.id])

  const currentPagePanels = useMemo(
    () =>
      Array.isArray(currentPage?.panels) && currentPage.panels.length > 0
        ? currentPage.panels
        : null,
    [currentPage],
  )

  const pageParameters = useMemo(
    () =>
      currentPagePanels
        ? currentPagePanels.flatMap((panel) => panel.parameters ?? [])
        : (currentPage?.parameters ?? []),
    [currentPagePanels, currentPage],
  )

  const currentPanelLabel = useMemo(() => {
    if (!currentPagePanels) return ''
    const panel = currentPagePanels[currentPanelIndex]
    return typeof panel?.label === 'string' ? panel.label.trim() : ''
  }, [currentPagePanels, currentPanelIndex])

  const handlePanelChange = (index) => {
    setCurrentPanelIndex(Number.isInteger(index) && index >= 0 ? index : 0)
  }

  return {
    currentPagePanels,
    currentPanelIndex,
    pageParameters,
    currentPanelLabel,
    handlePanelChange,
  }
}
