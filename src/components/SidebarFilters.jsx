

import { useMemo, useState } from 'react'
import { formatCLP } from './priceFormat.jsx'

export default function SidebarFilters({ filters, onChange, availableBrands = [] }) {
  const { q = '', minPrice = '', maxPrice = '', brandText = '' } = filters || {}
  // Local input states to allow formatted display
  const [minInput, setMinInput] = useState(minPrice ? String(minPrice) : '')
  const [maxInput, setMaxInput] = useState(maxPrice ? String(maxPrice) : '')

  function update(partial) {
    onChange?.(partial)
  }

  useMemo(() => { setMinInput(minPrice ? String(minPrice) : '') }, [minPrice])
  useMemo(() => { setMaxInput(maxPrice ? String(maxPrice) : '') }, [maxPrice])

  return (
    <div className="d-grid gap-4">
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Búsqueda</h6>
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Nombre"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>

      <hr />

      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Rango de Precio</h6>
        <div className="input-group input-group-sm mb-2">
          <span className="input-group-text">$</span>
          <input
            type="text"
            inputMode="numeric"
            className="form-control"
            placeholder="Mín."
            value={minInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
              setMinInput(raw ? formatCLP(raw) : '')
              update({ minPrice: raw })
            }}
          />
          <span className="input-group-text">a</span>
          <input
            type="text"
            inputMode="numeric"
            className="form-control"
            placeholder="Máx."
            value={maxInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
              setMaxInput(raw ? formatCLP(raw) : '')
              update({ maxPrice: raw })
            }}
          />
        </div>
      </div>

      <hr />

      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Marca</h6>
        <input
          type="text"
          className="form-control form-control-sm mb-2"
          placeholder="Buscar marca..."
          value={brandText}
          onChange={(e) => update({ brandText: e.target.value })}
        />
        {availableBrands.length > 0 && (
          <div className="filter-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {availableBrands.map((b) => (
              <button
                key={b}
                type="button"
                className="btn btn-light btn-sm w-100 text-start mb-1"
                onClick={() => update({ brandText: b })}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-sm btn-danger mt-2"
        type="button"
        onClick={() => update({ q: '', minPrice: '', maxPrice: '', brandText: '' })}
      >
        <i className="bi bi-x-circle me-1"></i> Limpiar Filtros
      </button>
    </div>
  )
}