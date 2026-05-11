import { createSlice } from '@reduxjs/toolkit'
import { menuConfig } from '../composables/useMenuConfig.js'
import { applicationConfig } from '../composables/useApplicationConfig.js'

// Collect all unique parameters from all pages
const collectParameters = (pages) => {
  const seen = new Set()
  const params = []
  const visit = (page) => {
    if (page.parameters) {
      for (const p of page.parameters) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          params.push(p)
        }
      }
    }
    if (page.submenus) page.submenus.forEach(visit)
    if (page.panels) page.panels.forEach(panel => {
      if (panel.parameters) panel.parameters.forEach(p => {
        if (!seen.has(p.id)) { seen.add(p.id); params.push(p) }
      })
    })
  }
  pages.forEach(visit)
  return params
}

const allPages = [
  ...(menuConfig.pages ?? []),
  ...(applicationConfig.pages ?? []),
]

export const uniqueParameters = collectParameters(allPages)

const getParameterDefaultValue = (param) => {
  if (param?.type === 'text' || param?.type === 'password') return ''
  return null
}

const initialValues = Object.fromEntries(uniqueParameters.map((p) => [p.id, getParameterDefaultValue(p)]))

// Also include status icon and header params
;(menuConfig.statusIcons ?? []).forEach((ic) => {
  if (ic.parameterId && !(ic.parameterId in initialValues)) initialValues[ic.parameterId] = 'off'
})
;(menuConfig.headerParams ?? []).forEach((p) => {
  if (p.id && !(p.id in initialValues)) initialValues[p.id] = null
})

const parametersSlice = createSlice({
  name: 'parameters',
  initialState: { values: initialValues, transactionDrafts: {} },
  reducers: {
    setParameterValue(state, action) {
      const { id, value } = action.payload
      state.values[id] = value
    },
    setParameterValues(state, action) {
      Object.assign(state.values, action.payload)
    },
    updateTransactionEntry(state, action) {
      const { pageId, id, entry } = action.payload
      if (!state.transactionDrafts[pageId]) state.transactionDrafts[pageId] = {}
      if (entry === null) {
        delete state.transactionDrafts[pageId][id]
      } else {
        state.transactionDrafts[pageId][id] = entry
      }
    },
    clearTransactionDraft(state, action) {
      const pageId = action.payload
      delete state.transactionDrafts[pageId]
    },
  },
})

export const { setParameterValue, setParameterValues, updateTransactionEntry, clearTransactionDraft } = parametersSlice.actions
export default parametersSlice.reducer