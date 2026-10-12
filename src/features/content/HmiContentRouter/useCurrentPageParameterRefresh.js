import { useEffect } from 'react'
import { useParameterStore } from '@/features/parameters/useParameterStore.js'

export const useCurrentPageParameterRefresh = ({
  currentPage,
  currentPanelIndex,
  pageParameters,
}) => {
  const { refreshParameters } = useParameterStore()

  useEffect(() => {
    if (!currentPage) return
    if (!pageParameters?.length) return

    const ids = pageParameters.map((p) => ({
      id: p.id,
      field: p.field,
    }))

    refreshParameters(ids)
  }, [
    currentPage?.id,
    currentPanelIndex,
    pageParameters,
  ])
}