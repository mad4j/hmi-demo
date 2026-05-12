import { useEffect } from 'react'

export const useCurrentPageParameterRefresh = ({
  currentPage,
  pageParameters,
  refreshParameters,
}) => {
  useEffect(() => {
    if (!currentPage) return
    const ids = pageParameters.map((param) => param.id)
    if (ids.length > 0) {
      refreshParameters(ids)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])
}
