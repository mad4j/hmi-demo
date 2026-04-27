import { watch } from 'vue'

export const useCurrentPageParameterRefresh = ({
  currentPage,
  pageParameters,
  refreshParameters,
}) => {
  watch(
    () => currentPage.value,
    (page) => {
      if (!page) return
      const ids = pageParameters.value.map((param) => param.id)
      if (ids.length > 0) {
        refreshParameters(ids)
      }
    },
  )
}
