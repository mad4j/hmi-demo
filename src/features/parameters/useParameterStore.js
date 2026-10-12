import { useSyncExternalStore } from 'react'
import { flattenSelectablePages, menuConfig } from '@/features/navigation/menuConfig.js'
import { useRadioGateway } from '@/features/radio-gateway/useRadioGateway.js'

const { getParameters, setParameters, notifyParameters, sendCommand } =
  useRadioGateway()

// ── PAGE PARAMETERS ──────────────────────────────────────
const seen = new Set()


const allPages = [
  menuConfig.homePage,
  ...(menuConfig.pages ?? []),
].filter(Boolean)   // ← rimuove undefined se homePage manca

console.log("All",allPages)
const getPageParameters = (page) => {
  // CASE 1: panels object (nuovo formato)
  if (Array.isArray(page.panels) && page.panels.length > 0) {
    return page.panels.flatMap((panel) => panel.parameters ?? [])
  }

  // CASE 2: parameters diretti (fallback vecchio formato)
  if (Array.isArray(page.parameters)) {
    return page.parameters
  }

  return []
}

const getLeafPages = (nodes) => {
  let leaves = [];

  if (!nodes || !Array.isArray(nodes)) return leaves;

  nodes.forEach(node => {
    // CONDIZIONE FOGLIA: Se "parameters" esiste ed è pieno, salviamo l'intera pagina
    if (node.parameters && node.parameters.length > 0) {
      leaves.push(node);
    }
    
    // Continuiamo a cercare in profondità nei sottomenù
    if (node.submenus && node.submenus.length > 0) {
      leaves.push(...getLeafPages(node.submenus));
    }

    // Continuiamo a cercare in profondità nei pannelli (se presenti)
    if (node.panels && node.panels.length > 0) {
      leaves.push(...getLeafPages(node.panels));
    }
  });

  return leaves;
};

// Esecuzione
const pagesWithParameters = getLeafPages(allPages).map(pag => pag.parameters)
console.log(pagesWithParameters);

const uniqueParameters = //flattenSelectablePages(allPages)
  //.flatMap(getPageParameters)
  pagesWithParameters
  .filter((p) => {
    if (!p?.id) return false
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
const parameterById = new Map(uniqueParameters.map((p) => [p.id, p]))

const paramToApplyConfMap = new Map()

  pagesWithParameters.forEach((page) => {
 
  console.log("pagex",page)
  // Cerchiamo il parametro di applicazione (nascosto e required: true)
  const applyConfParam = page.find(
    (p) => p.visibility === 'hidden' && p.required === true
  )

  if (applyConfParam) {
    // Mappiamo tutti gli ALTRI parametri di questa pagina al suo "Apply"
    page.forEach((p) => {
      if (p.id !== applyConfParam.id) {
        paramToApplyConfMap.set(p.id, applyConfParam)
      }

    })

    console.log("------------")
  }
})
console.log(paramToApplyConfMap)

const getDefaultValue = (p) =>
  p?.type === 'text' || p?.type === 'password' ? '' : null

let _paramValues = Object.fromEntries(
  uniqueParameters.map((p) => [p.id, getDefaultValue(p)])
)


// ── STORE CORE ───────────────────────────────────────────
let _version = 0
const _listeners = new Set()

const _subscribe = (l) => {
  _listeners.add(l)
  return () => _listeners.delete(l)
}

const _notify = () => {
  _version++
  _listeners.forEach((l) => l())
}

// ── LIVE UPDATES ─────────────────────────────────────────
notifyParameters((updates) => {
  let changed = false
  for (const [k, v] of Object.entries(updates)) {
    if (k in _paramValues) {
      _paramValues[k] = v
      changed = true
    }
  }
  if (changed) _notify()
})

// ── API ───────────────────────────────────────────────────
export const useParameterStore = () => {
  useSyncExternalStore(_subscribe, () => _version)

  // ids = [{ id, field }]
  const refreshParameters = async (ids) => {
        console.log("pre_Param",_paramValues)
    const result = await getParameters(ids)
    if (!result.ok) return

  
    _paramValues ={...result.values}
    console.log("pre_Param",_paramValues)
    _notify()
  }

 
  const setParametersValues = async (params) => {

    // 1. Prepariamo la lista finale dei parametri da inviare
    const finalParams = [...params]
    const applyParamsToAdd = new Map()

    // 2. Scopriamo se i parametri modificati richiedono un trigger "Apply"
    for (const { id } of params) {
      const applyConfParam = paramToApplyConfMap.get(id)

      if (applyConfParam) {
        // Prende il valore di ON (es. 1) se esiste optionsValue, altrimenti usa true
        const triggerValue =  true
        
        applyParamsToAdd.set(applyConfParam.id, {
          id: applyConfParam.id,
          value: triggerValue,
          field: applyConfParam.field,
        })
      }
    }

    // 3. Aggiungiamo i trigger "Apply" alla coda di invio (senza duplicati)
    applyParamsToAdd.forEach((applyParam) => {
      if (!finalParams.some((p) => p.id === applyParam.id)) {
        finalParams.push(applyParam)
      }
    })

    // Salvataggio locale di tutti i parametri (incluso il trigger)
    const prevValues = {}
    console.log("_paramValuesX",_paramValues)
    for (const { id, value } of finalParams) {
      prevValues[id] = _paramValues[id]
      _paramValues[id] = value
    }
    _notify()
    
   

    // Invio al server
    const result = await setParameters(finalParams)



    if (!result.ok) {
      // Rollback
      for (const { id } of finalParams) {
        _paramValues[id] = prevValues[id]
      }
      _notify()
      return
    }

    // Refresh dal server dei parametri appena settati
    console.log("_paramValues",_paramValues)
    const refreshIds = Object.keys(_paramValues)
      .map(( id ) => {
        const param = parameterById.get(id)
        return param ? { id: param.id, field: param.field } : null
      })
      .filter(Boolean)

    if (refreshIds.length > 0) {
      const refreshResult = await getParameters(refreshIds)
      if (refreshResult.ok) {
        _paramValues = { ...refreshResult.values }
        _notify()
      }
    }
  }

  const toggleParameter = async (id) => {
    const v = _paramValues[id]
    const next = typeof v === 'boolean' ? !v : v
    await setParametersValues([{ id, value: next }])
  }

  return {
    parameterValues: _paramValues,
    refreshParameters,
    setParametersValues,
    toggleParameter,
    sendCommand,
  }
}

export const _getParamValues = () => _paramValues
export { sendCommand as _sendCommand }