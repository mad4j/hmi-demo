import { useMemo, useSyncExternalStore } from 'react'

import {
  menuConfig,
  flattenSelectablePages,
  findPageById,
} from './menuConfig.js'

const HOME_PAGE_ID = 'waveform'

// ============================================================
// HOME PAGE
// ============================================================

const HOME_PAGE = {
  id: HOME_PAGE_ID,
  label: menuConfig.title ?? 'Home',  
  icon: 'home',
  visibility: 'visible',
  mode: 'standard',
  goOnApply: 'STAY_HERE',
  panels: menuConfig.homePage?.panels ?? [], 
  parameters: [],
}

// ============================================================
// PAGINE
// ============================================================

// homePages = submenus dell'application page (primo include di platform.yaml)
// pages     = system pages (restanti include di platform.yaml)
const allPages = [
  menuConfig.homePage,
  ...(menuConfig.pages ?? []),
].filter(Boolean)
const selectablePages = flattenSelectablePages(allPages)

// ============================================================
// STORE
// ============================================================

let _navState = {
  currentPageId: menuConfig.homePage?.id ?? HOME_PAGE_ID,
  pageHistory: [],
}

const _listeners = new Set()

const _subscribe = (listener) => {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

const _getSnapshot = () => _navState

const _notify = () => {
  _listeners.forEach((l) => l())
}

// ============================================================
// HOOK
// ============================================================

export const useMenuNavigation = () => {
  const { currentPageId, pageHistory } =
    useSyncExternalStore(_subscribe, _getSnapshot)

  const isAtHome = currentPageId === HOME_PAGE_ID

  // ============================================================
  // CURRENT PAGE
  // ============================================================

  const currentPage = useMemo(() => {
    if (currentPageId === HOME_PAGE_ID) {
      return HOME_PAGE
    }

    return (
      findPageById(allPages, currentPageId) ||
      HOME_PAGE
    )
  }, [currentPageId])

  // ============================================================
  // LEVEL 1 MENU
  // ============================================================

const level1Items = useMemo(
  () => menuConfig.pages.filter((p) => p.visibility !== 'hidden'),
  []
)

const findRootPageId = (pages, targetId) => {
  for (const page of pages) {
    if (page.id === targetId) return page.id

    if (Array.isArray(page.submenus)) {
      const found = findRootPageId(page.submenus, targetId)
      if (found) return page.id
    }
  }
  return null
}
  // ============================================================
  // ACTIVE LEVEL 1
  // ============================================================

  const activeLevel1Id = useMemo(() => {
  if (currentPageId === HOME_PAGE_ID) return null

  return findRootPageId(menuConfig.pages, currentPageId)
}, [currentPageId])
  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigateToPage = (pageId) => {
    if (!pageId || pageId === _navState.currentPageId) return

    const newHistory = _navState.currentPageId
      ? [..._navState.pageHistory, _navState.currentPageId]
      : _navState.pageHistory

    _navState = {
      currentPageId: pageId,
      pageHistory: newHistory,
    }

    _notify()
  }

  const selectLevel1Item = (item) => {
    navigateToPage(item.id)
  }

  const goHome = () => {

   
    if (_navState.currentPageId === HOME_PAGE_ID) return

    const prev = _navState.currentPageId

    _navState = {
      currentPageId: HOME_PAGE_ID,
      pageHistory: prev ? [prev] : [],
    }

    _notify()
  }

  const goToPreviousPage = () => {
    const history = [..._navState.pageHistory]

    while (history.length) {
      const prevId = history.pop()

      if (!prevId || prevId === _navState.currentPageId) continue

      _navState = {
        currentPageId: prevId,
        pageHistory: history,
      }

      _notify()
      return
    }
  }

  const canGoToPreviousPage = pageHistory.some(
    (id) => id && id !== currentPageId
  )

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