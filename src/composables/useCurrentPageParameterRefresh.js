import { useEffect } from 'react'
import { useParameterStore } from './useParameterStore.js'

export const useCurrentPageParameterRefresh = ({ currentPage, pageParameters }) => {
  const { refreshParameters } = useParameterStore()

  useEffect(() => {
    if (!currentPage) return
    const ids = pageParameters.map((param) => param.id)
    if (ids.length > 0) {
      refreshParameters(ids)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])
}
