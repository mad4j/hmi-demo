import { reactive } from 'vue'
import { flattenSelectablePages, menuConfig } from './useMenuConfig.js'

// ── Sample values ─────────────────────────────────────────
// In a real application these would come from the model/bus layer.
const sampleValues = {
  temp_abitacolo: 21.5,
  temp_impostata: 22.0,
  temp_esterna: 14.2,
  umidita: 65,
  ventilazione_attiva: true,
  aria_ricircolo: false,
  velocita_ventola: 3,
  modalita_clima: 'AUTO',
  porta_ant_sx: false,
  porta_ant_dx: false,
  porta_post_sx: false,
  porta_post_dx: false,
  blocco_centrale: true,
  cofano: false,
  portabagagli: false,
  finestre_chiuse: true,
  allarme_batteria: false,
  allarme_temp_motore: false,
  allarme_pressione: false,
  allarme_olio: false,
  allarme_abs: false,
  allarme_airbag: false,
  allarme_carburante: true,
  livello_carburante: 23,
  versione_hmi: '1.0.3',
  stato_rete: 'ONLINE',
  connessione: 'CAN-BUS',
  uptime: 142,
  tensione_batteria: 12.4,
  temperatura_cpu: 48,
  data_sistema: '23/04/2026',
  ora_sistema: '17:30',
}

// ── Singleton state ───────────────────────────────────────
const seenParameterIds = new Set()
const uniqueParameters = flattenSelectablePages(menuConfig.pages)
  .flatMap((page) => page.parameters)
  .filter((p) => {
    if (seenParameterIds.has(p.id)) return false
    seenParameterIds.add(p.id)
    return true
  })

const parameterValues = reactive(
  Object.fromEntries(uniqueParameters.map((p) => [p.id, sampleValues[p.id] ?? null])),
)

export const useParameterStore = () => {
  const toggleParameter = (id) => {
    if (typeof parameterValues[id] === 'boolean') {
      parameterValues[id] = !parameterValues[id]
      return
    }
    const param = uniqueParameters.find((p) => p.id === id)
    if (param?.type === 'enum' && param.options?.length > 0) {
      const currentIndex = param.options.indexOf(String(parameterValues[id]))
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % param.options.length
      parameterValues[id] = param.options[nextIndex]
    }
  }

  const setParameterValue = (id, value) => {
    if (id in parameterValues) {
      parameterValues[id] = value
    }
  }

  return { parameterValues, toggleParameter, setParameterValue }
}
