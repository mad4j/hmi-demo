// useTransactionPageState.js

const getPageParameterIds = (page) => {
  if (!page) return []
  if (Array.isArray(page.panels) && page.panels.length > 0) {
    return page.panels.flatMap((panel) => panel.parameters?.map((p) => p.id) ?? [])
  }
  return page.parameters?.map((p) => p.id) ?? []
}

const pickValues = (allValues, ids) =>
  Object.fromEntries(ids.map((id) => [id, allValues[id]]))

export const useTransactionPageState = ({
  currentPage,
  parameterValues,
}) => {
  const pageParameterIds = getPageParameterIds(currentPage)
  const currentPageValues = pickValues(parameterValues, pageParameterIds)

  return {
    currentPageValues,
  }
}