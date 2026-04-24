import { load } from 'js-yaml'
import rawMenuConfig from '../config/menu.yml?raw'

const fallbackConfig = {
  title: 'HMI Demo',
  status: 'ONLINE',
  navigation: {
    previousLabel: 'Precedente',
    nextLabel: 'Successiva',
  },
  pages: [
    {
      id: 'home',
      label: 'Menu',
      title: 'Menu principale',
      content: 'Interfaccia ottimizzata per 800x600 e uso su mezzi mobili.',
      submenus: [],
      parameters: [],
    },
  ],
}

const MAX_MENU_DEPTH = 8

export const normalizeParameters = (params) => {
  if (!Array.isArray(params)) return []
  return params
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim())
    .map((p) => ({
      id: p.id.trim(),
      name: typeof p.name === 'string' && p.name.trim() ? p.name : p.id.trim(),
      type: ['number', 'percentage', 'enum', 'boolean'].includes(p.type) ? p.type : 'number',
      unit: typeof p.unit === 'string' ? p.unit : '',
      precision: typeof p.precision === 'number' ? p.precision : null,
      options: Array.isArray(p.options) ? p.options.map(String) : [],
      readonly: p.readonly === true,
    }))
}

export const normalizeMenuItems = (items, idPrefix = 'page', depth = 0) =>
  items
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const id =
        typeof item.id === 'string' && item.id.trim() ? item.id : `${idPrefix}-${index + 1}`
      const normalizedSubmenus = Array.isArray(item.submenus)
        ? depth < MAX_MENU_DEPTH
          ? normalizeMenuItems(item.submenus, `${id}-submenu`, depth + 1)
          : []
        : []

      return {
        id,
        label:
          typeof item.label === 'string' && item.label.trim() ? item.label : `Pagina ${index + 1}`,
        title:
          typeof item.title === 'string' && item.title.trim() ? item.title : `Pagina ${index + 1}`,
        content: typeof item.content === 'string' ? item.content : '',
        submenus: normalizedSubmenus,
        parameters: normalizeParameters(item.parameters),
      }
    })

export const flattenSelectablePages = (pages) =>
  pages.flatMap((page) =>
    page.submenus.length ? flattenSelectablePages(page.submenus) : [page],
  )

export const findPageById = (pages, targetId) => {
  for (const page of pages) {
    if (page.id === targetId) {
      return page
    }

    if (page.submenus.length) {
      const nestedPage = findPageById(page.submenus, targetId)
      if (nestedPage) {
        return nestedPage
      }
    }
  }

  return null
}

export const getMenuItemsByPath = (pages, path) => {
  let currentItems = pages

  for (const id of path) {
    const currentNode = currentItems.find((item) => item.id === id)
    if (!currentNode || !currentNode.submenus.length) {
      return pages
    }
    currentItems = currentNode.submenus
  }

  return currentItems
}

const buildConfig = () => {
  try {
    const parsedConfig = load(rawMenuConfig)
    const sourceConfig =
      parsedConfig && typeof parsedConfig === 'object' ? parsedConfig : {}
    const sourcePages = Array.isArray(sourceConfig.pages) ? sourceConfig.pages : []
    const normalizedPages = normalizeMenuItems(sourcePages)
    const selectablePages = flattenSelectablePages(normalizedPages)

    if (!normalizedPages.length || !selectablePages.length) {
      return fallbackConfig
    }

    return {
      title:
        typeof sourceConfig.title === 'string' && sourceConfig.title.trim()
          ? sourceConfig.title
          : fallbackConfig.title,
      status:
        typeof sourceConfig.status === 'string' && sourceConfig.status.trim()
          ? sourceConfig.status
          : fallbackConfig.status,
      navigation: {
        previousLabel:
          typeof sourceConfig.navigation?.previousLabel === 'string' &&
          sourceConfig.navigation.previousLabel.trim()
            ? sourceConfig.navigation.previousLabel
            : fallbackConfig.navigation.previousLabel,
        nextLabel:
          typeof sourceConfig.navigation?.nextLabel === 'string' &&
          sourceConfig.navigation.nextLabel.trim()
            ? sourceConfig.navigation.nextLabel
            : fallbackConfig.navigation.nextLabel,
      },
      pages: normalizedPages,
    }
  } catch {
    return fallbackConfig
  }
}

export const menuConfig = buildConfig()
