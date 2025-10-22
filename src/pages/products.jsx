import ProductList from '../components/ProductList'
import SidebarFilters from '../components/SidebarFilters' // Necesitarás crear este componente

export default function Products() {
  return (
    <main className="container py-4">
      
      {/* Título Principal */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="border-bottom pb-2 fw-bold text-dark">
            <i className="bi bi-tag-fill me-2 text-danger"></i> 
            Catálogo Completo
          </h1>
        </div>
      </div>

      {/* Contenido Principal: Sidebar y Lista de Productos */}
      <div className="row">
        
        {/* 1. BARRA LATERAL DE FILTROS (Sidebar) */}
        <div className="col-lg-3">
          {/*
            Nota: Se utiliza 'col-lg-3' para que en dispositivos grandes,
            la barra lateral ocupe 3 de las 12 columnas.
          */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white fw-bold">
              Filtros de Búsqueda
            </div>
            <div className="card-body">
              {/* Aquí se incluye un componente real de filtros (Categoría, Precio, Marca) */}
              <SidebarFilters /> 
              
              {/* Ejemplo de un filtro simple si aún no creas SidebarFilters */}
              <div className="mb-3">
                  <label className="form-label fw-bold">Categoría</label>
                  <select className="form-select form-select-sm">
                      <option>Todos</option>
                      <option>Tarjetas de Video</option>
                      <option>Monitores</option>
                      <option>Procesadores</option>
                  </select>
              </div>

              <div className="mb-3">
                  <label className="form-label fw-bold">Precio (máx.)</label>
                  <input type="range" className="form-range" min="0" max="1000" step="10" />
                  <small className="text-muted">Max: $500.000</small>
              </div>

            </div>
          </div>

          {/* Banner de Promoción Adicional en el Sidebar */}
          <div className="alert alert-warning text-center fw-bold" role="alert">
            ¡Envíos GRATIS sobre $50.000!
          </div>
        </div>

        {/* 2. LISTA DE PRODUCTOS */}
        <div className="col-lg-9">
          {/*
            Nota: Se utiliza 'col-lg-9' para que la lista de productos ocupe
            las 9 columnas restantes en dispositivos grandes.
          */}
          
          {/* Opciones de ordenamiento (Sort By) */}
          <div className="d-flex justify-content-end align-items-center mb-3">
            <span className="me-2 text-muted small">Ordenar por:</span>
            <select className="form-select form-select-sm w-auto">
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="newest">Más Nuevo</option>
            </select>
          </div>
          
          {/* La lista real de productos */}
          <ProductList limit={100} />
          
          {/* Paginación (Placeholder) */}
          <nav className="d-flex justify-content-center mt-5">
            <ul className="pagination">
              <li className="page-item disabled"><a className="page-link" href="#">Anterior</a></li>
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">3</a></li>
              <li className="page-item"><a className="page-link" href="#">Siguiente</a></li>
            </ul>
          </nav>
        </div>

      </div>
    </main>
  )
}