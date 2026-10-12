import { load } from 'js-yaml'
import rawPlatformConfig from '@/config/platform.yaml?raw'

const rawConfigFiles = import.meta.glob('/src/config/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const includeRawByFile = Object.entries(rawConfigFiles).reduce((acc, [path, content]) => {
  const parts = path.split('/')
  const fileName = parts[parts.length - 1]
  if (fileName && fileName !== 'platform.yaml') {
    acc[fileName] = content
  }
  return acc
}, {})

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

const fallbackConfig = {
  title: 'HMI Demo',
  statusIcons: [],
  homePages: [],
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MENU_DEPTH = 8
const TRANSACTION_GO_ON_APPLY_VALUES = ['STAY_HERE', 'GO_HOME', 'GO_BACK']
const VALID_PARAMETER_TYPES = [
  'number', 'percentage', 'enum', 'boolean', 'text',
  'password', 'date', 'textarea', 'string', 'button',
]
const VALID_FIELD_TYPES = [
  'long',
  'ulong',
  'short',
  'ushort',
  'boolean',
  'bool',
  'string',
  'char',
  'octets',
  'octet',
  'float',
  'double',
  'ipaddr',
  'int',
  'enum'
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeVisibility = (value) =>
  typeof value === 'string' && value.trim().toLowerCase() === 'hidden' ? 'hidden' : 'visible'

const warnMenuConfig = (message) => {
  if (import.meta.env?.DEV) {
    console.warn(`[menu-config] ${message}`)
  }
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// normalizeStatusIcons
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// normalizeParameters
// `field` = backend data type (int | float | string | boolean | enum)
// `type`  = UI widget type  (number | text | enum | password | boolean | ...)
// They are independent — both are preserved in output.
// ---------------------------------------------------------------------------

export const normalizeParameters = (params) => {
  if (!Array.isArray(params)) return []

  return params
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim())
    .map((p) => {
      const type = VALID_PARAMETER_TYPES.includes(p.type) ? p.type : 'number'

      // `field` is optional; keep it only when it's a known value
      const field =
        typeof p.field === 'string' && VALID_FIELD_TYPES.includes(p.field.trim())
          ? p.field.trim()
          : undefined

      let optionsLabel = []
      let optionsValue = []

      if (Array.isArray(p.options)) {
        optionsLabel = p.options.map(String)
        optionsValue = p.options.map((_, i) => i)
      } else {
        optionsLabel = Array.isArray(p.optionsLabel) ? p.optionsLabel.map(String) : []
        optionsValue = Array.isArray(p.optionsValue) ? p.optionsValue.map(String) : []
      }

      return {
        id: p.id.trim(),
        name: typeof p.name === 'string' && p.name.trim() ? p.name.trim() : p.id.trim(),
        type,
        ...(field !== undefined ? { field } : {}),
        unit: typeof p.unit === 'string' ? p.unit : '',
        precision: typeof p.precision === 'number' ? p.precision : null,
        optionsLabel,
        optionsValue,
        required: p.required === true,
        readonly: p.readonly === true,
        clearOnApply: (type === 'text' || type === 'password') && p.clearOnApply === true,
        visibility: normalizeVisibility(p.visibility),
        min: typeof p.min === 'number' ? p.min : undefined,
        max: typeof p.max === 'number' ? p.max : undefined,
      }
    })
}

// ---------------------------------------------------------------------------
// normalizePanels
//
// Gestisce panels solo come array:
//   panels:
//     - label: Summary
//       parameters: [...]
//     - label: Submenu
//       submenus: [...]
//
// Output uniforme:
//   [ { id: 'panel-0', label: 'Summary', parameters: [...], submenus: [] }, ... ]
// ---------------------------------------------------------------------------

const normalizePanels = (panelsArr, itemId, depth) => {
  if (!Array.isArray(panelsArr) || panelsArr.length === 0) return null

  const normalized = panelsArr
    .filter((panel) => panel && typeof panel === 'object')
    .map((panel, panelIndex) => {
      const id = typeof panel.id === 'string' ? panel.id : `panel-${panelIndex}`
      const label = typeof panel.label === 'string' ? panel.label : ''

      // Gestione submenus (se presenti nel panel)
      const normalizedSubmenus =
        Array.isArray(panel.submenus) && depth < MAX_MENU_DEPTH
          ? normalizeMenuItems(panel.submenus, `${itemId}-${id}`, depth + 1)
          : []

      // Gestione parameters
      const panelParameters = normalizeParameters(panel.parameters)

      if (
        (!Array.isArray(panel.parameters) || panel.parameters.length === 0) &&
        normalizedSubmenus.length === 0
      ) {
        warnMenuConfig(`Item '${itemId}', panel #${panelIndex + 1}: missing or empty parameters and submenus.`)
      } else if (Array.isArray(panel.parameters) && panelParameters.length !== panel.parameters.length) {
        warnMenuConfig(
          `Item '${itemId}', panel #${panelIndex + 1}: some parameters are invalid and have been ignored.`,
        )
      }

      return {
        id,
        label,
        parameters: panelParameters,
        submenus: normalizedSubmenus,
      }
    })
    .filter((panel) => panel.parameters.length > 0 || panel.submenus.length > 0)

  return normalized.length > 0 ? normalized : null
}
// ---------------------------------------------------------------------------
// normalizePanelsObject
//
// Gestisce panels come oggetto con chiavi nominate (struttura nuova):
//   panels:
//     summary:
//       label: summary
//       parameters: [...]
//     submenu:
//       label: submenu
//       submenus: [...]
//
// Output uniforme (stesso formato di normalizePanelsArray):
//   [ { key: 'summary', label: 'summary', parameters: [...], submenus: [] }, ... ]
//   [ { key: 'submenu', label: 'submenu', parameters: [],    submenus: [...] }, ... ]
// ---------------------------------------------------------------------------
export const normalizeMenuItems = (items, idPrefix = 'page', depth = 0) =>
  (Array.isArray(items) ? items : [])
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => {
      const id =
        typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `${idPrefix}-${index + 1}`

      // --- mode / goOnApply ---
      const mode =
        item.mode === 'transaction' || item.type === 'transaction' ? 'transaction' : 'standard'
      const goOnApply =
        mode === 'transaction' &&
        typeof item.goOnApply === 'string' &&
        TRANSACTION_GO_ON_APPLY_VALUES.includes(item.goOnApply.trim().toUpperCase())
          ? item.goOnApply.trim().toUpperCase()
          : 'STAY_HERE'

      // --- submenus diretti ---
      const normalizedSubmenus =
        Array.isArray(item.submenus) && depth < MAX_MENU_DEPTH
          ? normalizeMenuItems(item.submenus, `${id}-submenu`, depth + 1)
          : []

      // --- parameters diretti ---
      const normalizedParameters = normalizeParameters(item.parameters)
      if (
        Array.isArray(item.parameters) &&
        normalizedParameters.length !== item.parameters.length
      ) {
        warnMenuConfig(`Item '${id}': some parameters are invalid and have been ignored.`)
      }

      // --- panels: GESTITI ESCLUSIVAMENTE COME ARRAY ---
      let normalizedPanels = null

      if (Array.isArray(item.panels)) {
        normalizedPanels = normalizePanels(item.panels, id, depth)

        if (item.panels.length > 0 && !normalizedPanels) {
          warnMenuConfig(`Item '${id}': panels defined but no valid panel parameters/submenus found.`)
        }
        if (normalizedPanels && normalizedParameters.length > 0) {
          warnMenuConfig(
            `Item '${id}': both parameters and panels defined; parameters ignored in favor of panels.`,
          )
        }
      } else if (isPlainObject(item.panels)) {
        // Avviso opzionale nel caso in cui qualcuno usi ancora la vecchia sintassi a oggetto nei file YAML
        warnMenuConfig(`Item '${id}': 'panels' deve essere un array, ma è stato trovato un oggetto. Verrà ignorato.`)
      }

      return {
        id,
        label:
          typeof item.label === 'string' && item.label.trim()
            ? item.label.trim()
            : `Item ${index + 1}`,
        icon: typeof item.icon === 'string' ? item.icon.trim() : '',
        visibility: normalizeVisibility(item.visibility),
        mode,
        goOnApply,
        submenus: normalizedSubmenus,
        parameters:
          normalizedPanels !== null && normalizedPanels.length > 0 ? [] : normalizedParameters,
        ...(normalizedPanels !== null ? { panels: normalizedPanels } : {}),
      }
    })

// ---------------------------------------------------------------------------
// Utility exports
// ---------------------------------------------------------------------------

export const flattenSelectablePages = (pages) =>
  pages.flatMap((page) =>
    page.submenus?.length ? flattenSelectablePages(page.submenus) : [page],
  )

export const findPageById = (pages, targetId) => {
  if (!Array.isArray(pages)) return null

  for (const page of pages) {
    if (!page || typeof page !== 'object') continue

    if (page.id === targetId) return page

    // Cerchiamo i sottomenu sia direttamente nella pagina, sia dentro eventuali panels
    const directSubmenus = Array.isArray(page.submenus) ? page.submenus : []
    const panelSubmenus = Array.isArray(page.panels)
      ? page.panels.flatMap((panel) => Array.isArray(panel.submenus) ? panel.submenus : [])
      : []

    const allSubmenus = [...directSubmenus, ...panelSubmenus]

    if (allSubmenus.length > 0) {
      const nested = findPageById(allSubmenus, targetId)
      if (nested) return nested
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// buildConfig
//
// platform.yaml structure:
//   title: ...
//   includes:
//     - application.yaml        ← FIRST include → home page (pages[0].submenus)
//     - platform-status-icons.yaml
//     - platform-pages-*.yaml
//     - ...
//
// After merge, pages[0] is always the application/home page.
// Its submenus become `homePages`.
// Remaining pages become the system pages exposed as `pages`.
// ---------------------------------------------------------------------------

const buildConfig = () => {
  try {
    const parsedPlatformConfig = load(rawPlatformConfig)
    const rootConfig = isPlainObject(parsedPlatformConfig) ? parsedPlatformConfig : {}

    const includeFiles = Array.isArray(rootConfig.includes)
      ? rootConfig.includes.filter(
          (entry) => typeof entry === 'string' && entry.trim() && includeRawByFile[entry.trim()],
        )
      : []

    const includeSections = includeFiles
      .map((file) => load(includeRawByFile[file.trim()]))
      .filter((section) => isPlainObject(section))

    const { includes: _includes, ...rootWithoutIncludes } = rootConfig
    const sourceConfig = mergeConfigSections(rootWithoutIncludes, includeSections)
    const sourcePages = Array.isArray(sourceConfig.pages) ? sourceConfig.pages : []
    const normalizedPages = normalizeMenuItems(sourcePages)

    const [homePage, ...systemPages] = normalizedPages
   
    const selectableSystemPages = flattenSelectablePages(systemPages)
    
    if (!homePage || ((homePage.panels ?? []).length === 0 && selectableSystemPages.length === 0)) {
  return fallbackConfig
}

    return {
      title:
        typeof sourceConfig.title === 'string' && sourceConfig.title.trim()
          ? sourceConfig.title.trim()
          : fallbackConfig.title,
      statusIcons: normalizeStatusIcons(sourceConfig.statusIcons),
      headerParams: Array.isArray(sourceConfig.headerParams) ? sourceConfig.headerParams : [],
      pages: systemPages,
      homePage,
    }
  } catch {
    return fallbackConfig
  }
}

export const menuConfig = buildConfig()