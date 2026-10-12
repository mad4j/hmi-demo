import { useState } from 'react'
import './AlarmTableWidget.css'

const rowKey = 'id'

const columns = [
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
    label: 'Codice'
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

export default function AlarmTableWidget({ title, data = [] }) {
  const [focusedCell, setFocusedCell] = useState(null)

  const handleCellClick = (rowId, colKey) => {
    if (focusedCell?.rowId === rowId && focusedCell?.colKey === colKey) {
      setFocusedCell(null)
    } else {
      setFocusedCell({ rowId, colKey })
    }
  }

  const hasFocus = focusedCell !== null

  return (
    <div className="table-widget">
      {title && (
        <div className="table-widget__title">{title}</div>
      )}
      
      <div className="table-widget__scroll-area">
        <table className="table-widget__table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={col.key || idx} 
                  className={`table-widget__th col-${col.key}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={hasFocus ? 'table-widget__tbody--focused' : ''}>
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const id = row[rowKey] || rowIndex
                const isRowFocused = focusedCell?.rowId === id

                return (
                  <tr 
                    key={id}
                    className={`table-widget__row ${isRowFocused ? 'table-widget__row--active' : ''}`}
                  >
                    {columns.map((col, colIndex) => {
                      const isCellFocused = isRowFocused && focusedCell?.colKey === col.key
                      
                      return (
                        <td 
                          key={colIndex} 
                          className={`table-widget__td col-${col.key} ${isCellFocused ? 'table-widget__cell--active' : ''}`}
                          onClick={() => handleCellClick(id, col.key)}
                        >
                          <div className="table-widget__cell-content">
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="table-widget__empty">
                  Nessun dato disponibile
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}