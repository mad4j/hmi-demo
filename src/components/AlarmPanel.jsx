import React from 'react'
import TableWidget from './TableWidget.jsx'

// ============================================================
// 1. CONFIGURAZIONE DELLE COLONNE
// ============================================================
const alarmColumns = [
  { 
    key: 'time', 
    label: 'Timestamp', 
    render: (value) => {
      if (!value) return '—'
      const date = new Date(value)
      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(date)
    }
  },
  {
    key: 'code',
    label: 'Codice' // <-- NUOVO CAMPO
  },
  {
    key: 'severity',
    label: 'Livello',
    render: (value) => {
      const className = `severity-${value.toLowerCase()}`
      return <span className={className}>{value}</span>
    }
  },
  { 
    key: 'equipment', 
    label: 'Modulo HW', 
    render: (value) => <strong>{value}</strong>
  },
  { 
    key: 'alarm', 
    label: 'Descrizione Allarme'
  },
  {
    key: 'status',
    label: 'Stato',
    render: (value) => <i>{value}</i>
  }
]

// =====================
// 2. DATI SIMULATI
// =====================
const alarmData = [
  { id: 1, code: 'ERR-091', severity: 'Critical', alarm: 'VQ1-M BLACK OE Integrity check', equipment: 'DRE Module', status: 'Unack', time: 'Wed, 29 Jan 2020 05:51:19 GMT' },
  { id: 2, code: 'PWR-404', severity: 'Critical', alarm: 'Power supply fault', equipment: 'ASFE Module', status: 'Unack', time: 'Wed, 29 Jan 2020 05:51:19 GMT' },
  { id: 3, code: 'SYS-220', severity: 'Warning', alarm: 'CSS Bitlog file threshold length is almost exceeded 90 %', equipment: 'MCCE Module', status: 'Ack', time: 'Wed, 29 Jan 2020 05:51:14 GMT' },
  { id: 4, code: 'SYS-221', severity: 'Critical', alarm: 'CSS Common Alarms file threshold length is full', equipment: 'MCCE Module', status: 'Unack', time: 'Wed, 29 Jan 2020 05:51:23 GMT' },
  { id: 5, code: 'RF-002', severity: 'Minor', alarm: 'TX Synthesizer PLL Unlock', equipment: 'RF Module', status: 'Cleared', time: 'Wed, 29 Jan 2020 06:12:05 GMT' },
  { id: 6, code: 'SYS-221', severity: 'Critical', alarm: 'CSS Common Alarms file threshold length is full', equipment: 'MCCE Module', status: 'Unack', time: 'Wed, 29 Jan 2020 05:51:23 GMT' },
  { id: 7, code: 'RF-002', severity: 'Minor', alarm: 'TX Synthesizer PLL Unlock', equipment: 'RF Module', status: 'Cleared', time: 'Wed, 29 Jan 2020 06:12:05 GMT' }
]

// ============================================================
// 3. COMPONENTE PRINCIPALE
// ============================================================
export default function AlarmPanel() {
  return (
    <div className="alarm-panel">
      <TableWidget 
        title="System Critical Alarms" 
        columns={alarmColumns} 
        data={alarmData} 
        rowKey="id" 
      />

      <div className="alarm-panel__footer">
        <span className="alarm-panel__total">
          Totale: {alarmData.length}
        </span>
      </div>
    </div>
  )
}