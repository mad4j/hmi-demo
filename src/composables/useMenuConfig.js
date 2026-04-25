import { load } from 'js-yaml'
import rawPlatformConfig from '../config/platform.yaml?raw'
import rawPlatformStatusIcons from '../config/platform-status-icons.yaml?raw'
import rawPlatformPagesMenu from '../config/platform-pages-menu.yaml?raw'
import rawPlatformPagesAllarmi from '../config/platform-pages-allarmi.yaml?raw'
import rawPlatformPagesInfo from '../config/platform-pages-info.yaml?raw'
import rawPlatformPagesImpostazioni from '../config/platform-pages-impostazioni.yaml?raw'

const includeRawByFile = {
  'platform-status-icons.yaml': rawPlatformStatusIcons,
  'platform-pages-menu.yaml': rawPlatformPagesMenu,
  'platform-pages-allarmi.yaml': rawPlatformPagesAllarmi,
  'platform-pages-info.yaml': rawPlatformPagesInfo,
  'platform-pages-impostazioni.yaml': rawPlatformPagesImpostazioni,
}

const fallbackConfig = {
  title: 'HMI Demo',
  statusIcons: [],
  pages: [
    {
      id: 'home',
      label: 'Menu',
      mode: 'standard',
      submenus: [],
      parameters: [],
    },
  ],
}

const MAX_MENU_DEPTH = 8
const TRANSACTION_GO_ON_APPLY_VALUES = ['STAY_HERE', 'GO_HOME', 'GO_BACK']

const isPlainObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value)

const mergeConfigSections = (baseConfig, sections) => {
  const merged = { ...baseConfig }

  for (const section of sections) {
    if (!isPlainObject(section)) continue

    for (const [key, value] of Object.entries(section)) {
      if (Array.isArray(value)) {
        const current = Array.isArray(merged[key]) ? merged[key] : []
        merged[key] = [...current, ...value]
        continue
      }

      if (isPlainObject(value)) {
        const current = isPlainObject(merged[key]) ? merged[key] : {}
        merged[key] = { ...current, ...value }
        continue
      }

      merged[key] = value
    }
  }

  return merged
}

export const normalizeStatusIcons = (icons) => {
  if (!Array.isArray(icons)) return []
  return icons
    .filter((ic) => ic && typeof ic === 'object' && typeof ic.id === 'string' && ic.id.trim())
    .map((ic) => {
      const pageIdByState =
        ic.pageIdByState && typeof ic.pageIdByState === 'object'
          ? Object.entries(ic.pageIdByState).reduce((acc, [state, pageId]) => {
              if (typeof state !== 'string' || !state.trim()) return acc
              if (typeof pageId !== 'string' || !pageId.trim()) return acc
              acc[state.trim()] = pageId.trim()
              return acc
            }, {})
          : {}

      return {
        id: ic.id.trim(),
        label:
          typeof ic.label === 'string' && ic.label.trim() ? ic.label.trim() : ic.id.trim(),
        icon: typeof ic.icon === 'string' ? ic.icon.trim() : ic.id.trim(),
        pageId: typeof ic.pageId === 'string' ? ic.pageId.trim() : '',
        pageIdByState,
        parameterId: typeof ic.parameterId === 'string' ? ic.parameterId.trim() : '',
      }
    })
}

export const normalizeParameters = (params) => {
  if (!Array.isArray(params)) return []
  return params
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim())
    .map((p) => {
      const type =
        ['number', 'percentage', 'enum', 'boolean', 'text', 'password', 'date'].includes(p.type)
          ? p.type
          : 'number'

      return {
        id: p.id.trim(),
        name: typeof p.name === 'string' && p.name.trim() ? p.name : p.id.trim(),
        type,
        unit: typeof p.unit === 'string' ? p.unit : '',
        precision: typeof p.precision === 'number' ? p.precision : null,
        options: Array.isArray(p.options) ? p.options.map(String) : [],
        readonly: p.readonly === true,
        clearOnApply: (type === 'text' || type === 'password') && p.clearOnApply === true,
      }
    })
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
      const mode =
        item.mode === 'transaction' || item.type === 'transaction' ? 'transaction' : 'standard'
      const goOnApply =
        mode === 'transaction' &&
        typeof item.goOnApply === 'string' &&
        TRANSACTION_GO_ON_APPLY_VALUES.includes(item.goOnApply.trim().toUpperCase())
          ? item.goOnApply.trim().toUpperCase()
          : 'STAY_HERE'

      return {
        id,
        label:
          typeof item.label === 'string' && item.label.trim() ? item.label : `Pagina ${index + 1}`,
        icon: typeof item.icon === 'string' ? item.icon : '',
        mode,
        goOnApply,
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

const buildConfig = () => {
  try {
    const parsedPlatformConfig = load(rawPlatformConfig)
    const rootConfig =
      parsedPlatformConfig && typeof parsedPlatformConfig === 'object'
        ? parsedPlatformConfig
        : {}
    const includeFiles = Array.isArray(rootConfig.includes)
      ? rootConfig.includes.filter(
          (entry) => typeof entry === 'string' && entry.trim() && includeRawByFile[entry.trim()],
        )
      : []
    const includeSections = includeFiles
      .map((includeFile) => load(includeRawByFile[includeFile.trim()]))
      .filter((section) => section && typeof section === 'object')
    const { includes, ...rootWithoutIncludes } = rootConfig
    const sourceConfig = mergeConfigSections(rootWithoutIncludes, includeSections)
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
      statusIcons: normalizeStatusIcons(sourceConfig.statusIcons),
      pages: normalizedPages,
    }
  } catch {
    return fallbackConfig
  }
}

export const menuConfig = buildConfig()
