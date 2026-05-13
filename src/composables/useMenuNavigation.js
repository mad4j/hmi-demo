import { useSyncExternalStore } from 'react'
import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
} from './menuConfig.js'

const HOME_PAGE_ID = '__home__'
const HOME_PAGE = {
  id: HOME_PAGE_ID,
  label: '',
  icon: '',
  visibility: 'visible',
  mode: 'standard',
  goOnApply: 'STAY_HERE',
  submenus: [],
  parameters: [],
}

const selectablePages = flattenSelectablePages(menuConfig.pages)

// Module-level singleton state
let _navState = { currentPageId: HOME_PAGE_ID, pageHistory: [] }
const _listeners = new Set()
const _subscribe = (l) => { _listeners.add(l); return () => _listeners.delete(l) }
const _getSnapshot = () => _navState

const _notify = () => _listeners.forEach((l) => l())

export const useMenuNavigation = () => {
  const { currentPageId, pageHistory } = useSyncExternalStore(_subscribe, _getSnapshot)

  const isAtHome = currentPageId === HOME_PAGE_ID

  const currentPage = isAtHome
    ? HOME_PAGE
    : (findPageById(menuConfig.pages, currentPageId) ?? selectablePages[0] ?? menuConfig.pages[0])

  const level1Items = menuConfig.pages.filter((p) => p.visibility !== 'hidden')

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

  const navigateToPage = (pageId) => {
    if (!pageId || pageId === _navState.currentPageId) return
    const newHistory = _navState.currentPageId
      ? [..._navState.pageHistory, _navState.currentPageId]
      : _navState.pageHistory
    _navState = { currentPageId: pageId, pageHistory: newHistory }
    _notify()
  }

  const selectLevel1Item = (item) => navigateToPage(item.id)

  const goHome = () => {
    if (_navState.currentPageId === HOME_PAGE_ID) return
    const prev = _navState.currentPageId
    _navState = { currentPageId: HOME_PAGE_ID, pageHistory: prev ? [prev] : [] }
    _notify()
  }

  const goToPreviousPage = () => {
    const history = [..._navState.pageHistory]
    while (history.length) {
      const prevId = history.pop()
      if (!prevId || prevId === _navState.currentPageId) continue
      _navState = { currentPageId: prevId, pageHistory: history }
      _notify()
      return
    }
  }

  return {
    currentPageId,
    currentPage,
    isAtHome,
    level1Items,
    activeLevel1Id,
    canGoToPreviousPage,
    selectLevel1Item,
    goHome,
    goToPreviousPage,
    navigateToPage,
  }
}
