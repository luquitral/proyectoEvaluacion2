// src/components/SidebarFilters.jsx

export default function SidebarFilters() {
  return (
    <div className="d-grid gap-4">
      
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Categorías</h6>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="cat-gpu" />
          <label className="form-check-label" htmlFor="cat-gpu">Tarjetas de Video (GPU)</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="cat-cpu" />
          <label className="form-check-label" htmlFor="cat-cpu">Procesadores (CPU)</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="cat-ram" />
          <label className="form-check-label" htmlFor="cat-ram">Memorias RAM</label>
        </div>
        <a href="#" className="small mt-1 d-block text-decoration-none">Ver más...</a>
      </div>

      <hr />

      
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Rango de Precio</h6>
        {/* Aquí se pueden usar dos inputs de texto o un slider de rango */}
        <div className="input-group input-group-sm mb-2">
          <span className="input-group-text">$</span>
          <input type="number" className="form-control" placeholder="Mín." />
          <span className="input-group-text">a</span>
          <input type="number" className="form-control" placeholder="Máx." />
        </div>
        <button className="btn btn-sm btn-outline-secondary w-100">Aplicar Precio</button>
      </div>

      <hr />

      
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Marca</h6>
        
        
        <input type="text" className="form-control form-control-sm mb-2" placeholder="Buscar marca..." />

        <div className="filter-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="brand-nvidia" />
            <label className="form-check-label" htmlFor="brand-nvidia">NVIDIA</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="brand-amd" />
            <label className="form-check-label" htmlFor="brand-amd">AMD</label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="brand-intel" />
            <label className="form-check-label" htmlFor="brand-intel">Intel</label>
          </div>
        </div>
      </div>
      
      <hr />

      
      <div className="filter-group">
        <h6 className="fw-bold mb-2 text-primary">Disponibilidad</h6>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="stock-in" defaultChecked />
          <label className="form-check-label" htmlFor="stock-in">En Stock (150)</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id="stock-promo" />
          <label className="form-check-label" htmlFor="stock-promo">Con Oferta</label>
        </div>
      </div>

      <button className="btn btn-sm btn-danger mt-3">
        <i className="bi bi-x-circle me-1"></i> Limpiar Filtros
      </button>

    </div>
  );
}