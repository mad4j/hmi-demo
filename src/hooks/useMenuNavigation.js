import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { navigateToPage as navigateAction, goHome as goHomeAction, goToPreviousPage as goToPreviousPageAction } from '../store/navigationSlice.js'
import { menuConfig, flattenSelectablePages, findPageById } from '../composables/useMenuConfig.js'

const HOME_PAGE_ID = '__home__'
const HOME_PAGE = {
  id: HOME_PAGE_ID, label: '', icon: '', visibility: 'visible',
  mode: 'standard', goOnApply: 'STAY_HERE', submenus: [], parameters: [],
}

const selectablePages = flattenSelectablePages(menuConfig.pages)

export const useMenuNavigation = () => {
  const dispatch = useDispatch()
  const currentPageId = useSelector((state) => state.navigation.currentPageId)
  const pageHistory = useSelector((state) => state.navigation.pageHistory)

  const isAtHome = currentPageId === HOME_PAGE_ID

  const currentPage = (() => {
    if (currentPageId === HOME_PAGE_ID) return HOME_PAGE
    return findPageById(menuConfig.pages, currentPageId) ?? selectablePages[0] ?? menuConfig.pages[0]
  })()

  const level1Items = menuConfig.pages.filter((page) => page.visibility !== 'hidden')

  const activeLevel1Id = (() => {
    if (currentPageId === HOME_PAGE_ID) return null
    const direct = menuConfig.pages.find((p) => p.id === currentPageId)
    if (direct) return direct.id
    for (const page of menuConfig.pages) {
      if (page.submenus?.some((s) => s.id === currentPageId)) return page.id
    }
    return null
  })()

  const canGoToPreviousPage = pageHistory.some((id) => id && id !== currentPageId)

  const navigateToPage = useCallback((pageId) => dispatch(navigateAction(pageId)), [dispatch])
  const selectLevel1Item = useCallback((item) => dispatch(navigateAction(item.id)), [dispatch])
  const goHome = useCallback(() => dispatch(goHomeAction()), [dispatch])
  const goToPreviousPage = useCallback(() => dispatch(goToPreviousPageAction()), [dispatch])

  return { currentPageId, currentPage, isAtHome, level1Items, activeLevel1Id, canGoToPreviousPage, selectLevel1Item, goHome, goToPreviousPage, navigateToPage }
}