import React, { useState } from 'react'
import './TableWidget.css'

export default function TableWidget({ 
  title, 
  columns = [], 
  data = [],
  rowKey = 'id' 
}) {
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