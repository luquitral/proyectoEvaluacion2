// Sidebar de filtros controlado por props
// Props esperadas:
// - filters: { q, minPrice, maxPrice, brandText }
// - onChange: (partial) => void
// - availableBrands?: string[] (opcional)

export default function SidebarFilters({ filters, onChange, availableBrands = [] }) {
  const { q = '', minPrice = '', maxPrice = '', brandText = '' } = filters || {}

  function update(partial) {
    onChange?.(partial)
  }

  return (
    <div className="d-grid gap-4">
      {/* Búsqueda por texto */}
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Búsqueda</h6>
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Nombre o descripción"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>

      <hr />

      {/* Rango de precio */}
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Rango de Precio</h6>
        <div className="input-group input-group-sm mb-2">
          <span className="input-group-text">$</span>
          <input
            type="number"
            className="form-control"
            placeholder="Mín."
            value={minPrice}
            onChange={(e) => update({ minPrice: e.target.value })}
          />
          <span className="input-group-text">a</span>
          <input
            type="number"
            className="form-control"
            placeholder="Máx."
            value={maxPrice}
            onChange={(e) => update({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      <hr />

      {/* Marca (texto o selección) */}
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