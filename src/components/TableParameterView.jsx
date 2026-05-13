import { useMemo, useState, useEffect } from 'react'
import './TableParameterView.css'

const PAGE_SIZE = 8

const asCellString = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

const parseRowsFromValue = (value) => {
  let parsed = value

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter((row) => row && typeof row === 'object' && !Array.isArray(row))
  }

  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.rows)) {
    return parsed.rows.filter((row) => row && typeof row === 'object' && !Array.isArray(row))
  }

  return []
}

const buildColumnList = (rows) => {
  const seen = new Set()
  const result = []
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (seen.has(key)) return
      seen.add(key)
      result.push(key)
    })
  })
  return result
}

const compareValues = (a, b) => {
  const aNum = Number(a)
  const bNum = Number(b)
  const bothNumeric = Number.isFinite(aNum) && Number.isFinite(bNum)
  if (bothNumeric) return aNum - bNum
  return String(a).localeCompare(String(b), 'it', { numeric: true, sensitivity: 'base' })
}

export default function TableParameterView({ title, rawValue }) {
  const [sortBy, setSortBy] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filters, setFilters] = useState({})
  const [pageIndex, setPageIndex] = useState(0)

  const rows = useMemo(() => parseRowsFromValue(rawValue), [rawValue])
  const columns = useMemo(() => buildColumnList(rows), [rows])

  useEffect(() => {
    setPageIndex(0)
  }, [rawValue, sortBy, sortDirection, filters])

  useEffect(() => {
    if (!sortBy && columns.length > 0) setSortBy(columns[0])
    if (sortBy && !columns.includes(sortBy)) setSortBy(columns[0] ?? '')
  }, [columns, sortBy])

  const filteredRows = useMemo(() => {
    if (!rows.length) return []
    return rows.filter((row) =>
      columns.every((column) => {
        const filterValue = (filters[column] ?? '').trim().toLowerCase()
        if (!filterValue) return true
        const rowCell = asCellString(row[column]).toLowerCase()
        return rowCell.includes(filterValue)
      }),
    )
  }, [rows, columns, filters])

  const sortedRows = useMemo(() => {
    if (!sortBy) return filteredRows
    const sorted = [...filteredRows].sort((left, right) =>
      compareValues(asCellString(left[sortBy]), asCellString(right[sortBy])),
    )
    return sortDirection === 'desc' ? sorted.reverse() : sorted
  }, [filteredRows, sortBy, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)

  const pagedRows = useMemo(() => {
    const start = safePageIndex * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [sortedRows, safePageIndex])

  const toggleSort = (column) => {
    if (sortBy !== column) {
      setSortBy(column)
      setSortDirection('asc')
      return
    }
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const setColumnFilter = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }))
  }

  return (
    <section className="table-parameter-view" aria-label={title || 'Tabella dati'}>
      <header className="table-parameter-view__header">
        <h2>{title || 'Data Table'}</h2>
        <span className="table-parameter-view__meta">
          {sortedRows.length} righe
        </span>
      </header>

      <div className="table-parameter-view__table-wrap">
        <table className="table-parameter-view__table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={`head-${column}`}>
                  <button
                    className="table-sort-button"
                    type="button"
                    onClick={() => toggleSort(column)}
                    aria-label={`Ordina per ${column}`}
                  >
                    <span>{column}</span>
                    <span className="table-sort-button__arrow" aria-hidden="true">
                      {sortBy === column ? (sortDirection === 'asc' ? '^' : 'v') : '<>'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
            <tr>
              {columns.map((column) => (
                <th key={`filter-${column}`}>
                  <input
                    className="table-filter-input"
                    value={filters[column] ?? ''}
                    onChange={(event) => setColumnFilter(column, event.target.value)}
                    placeholder="Filtro"
                    aria-label={`Filtra colonna ${column}`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row, index) => (
              <tr key={`row-${safePageIndex}-${index}`}>
                {columns.map((column) => (
                  <td key={`cell-${safePageIndex}-${index}-${column}`}>{asCellString(row[column])}</td>
                ))}
              </tr>
            ))}
            {pagedRows.length === 0 && (
              <tr>
                <td className="table-empty" colSpan={Math.max(1, columns.length)}>
                  Nessun dato disponibile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="table-parameter-view__pager" aria-label="Paginazione tabella">
        <button
          type="button"
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={safePageIndex <= 0}
        >
          Prev
        </button>
        <span>
          Pagina {safePageIndex + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={safePageIndex >= totalPages - 1}
        >
          Next
        </button>
      </footer>
    </section>
  )
}
