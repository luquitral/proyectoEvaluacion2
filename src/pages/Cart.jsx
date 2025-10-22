import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { items, loading, setQuantity, remove, total } = useCart()
  const { user } = useAuth()

  // Helpers para mostrar miniaturas de producto (soporta guest/backend)
  const storageBase = import.meta.env.VITE_XANO_STORAGE_BASE || import.meta.env.VITE_XANO_STORE_BASE || ''
  const buildUrlFromPath = (path) => {
    if (!path) return null
    if (typeof path !== 'string') return null
    if (path.startsWith('http')) return path
    if (!storageBase) return path
    return storageBase.replace(/\/$/, '') + (path.startsWith('/') ? path : `/${path}`)
  }
  const firstImageUrl = (productLike) => {
    const images = productLike?.images || productLike?.image || productLike?.pictures || []
    const arr = Array.isArray(images) ? images : (images ? [images] : [])
    for (const it of arr) {
      if (!it) continue
      if (typeof it === 'string') return it
      if (it.url) return it.url
      if (it.src) return it.src
      if (it.path) {
        const u = buildUrlFromPath(it.path)
        if (u) return u
      }
      if (it.file?.url) return it.file.url
      if (it.file?.path) {
        const u = buildUrlFromPath(it.file.path)
        if (u) return u
      }
    }
    return '/vite.svg'
  }

  return (
    <div className="container py-4">
      <h1>Tu carrito</h1>
      {!user && (
        <div className="alert alert-info">No has iniciado sesión. Puedes revisar tu carrito, pero inicia sesión para mantenerlo sincronizado.</div>
      )}
      {loading && <div>Cargando...</div>}
      {!loading && items.length === 0 && <div>El carrito está vacío.</div>}
      <div className="list-group">
        {items.map(it => (
          <div key={it.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <img
                src={firstImageUrl(it.product) || '/vite.svg'}
                alt={it.product?.name || 'Producto'}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }}
                loading="lazy"
              />
              <div>
                <div className="fw-bold">{it.product?.name || it.product_name || 'Producto'}</div>
                <div className="small text-muted">Precio: ${it.price ?? it.product?.price ?? 0}</div>
              </div>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <input type="number" value={it.quantity} min={1} style={{ width: 80 }} onChange={(e) => setQuantity(it.id, Number(e.target.value))} />
              <button className="btn btn-sm btn-outline-danger" onClick={() => remove(it.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 d-flex justify-content-end align-items-center gap-3">
        <div className="fs-4">Total: <strong>${total}</strong></div>
        <button className="btn btn-primary">Ir a pagar</button>
      </div>
    </div>
  )
}
