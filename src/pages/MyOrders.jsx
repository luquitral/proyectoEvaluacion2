import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listOrders, listOrderProducts } from '../api/xano'
import { formatCLPCurrency } from '../components/priceFormat.jsx'
import { useNavigate } from 'react-router-dom'

export default function MyOrders() {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token || !user) return
      setLoading(true)
      try {
        const data = await listOrders({ token, user_id: user.id, limit: 100 })
        if (!mounted) return
        setOrders(data)
      } catch (e) { if (mounted) setErr(e?.message || 'Error') }
      finally { if (mounted) setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [token, user])

  async function toggleDetails(o) {
    if (expanded === o.id) return setExpanded(null)
    try {
      const prods = await listOrderProducts(token, o.id)
      setOrders(orders.map(x => x.id === o.id ? { ...x, _products: prods } : x))
      setExpanded(o.id)
    } catch (e) { alert('No fue posible cargar productos del pedido') }
  }

  if (!user || !token) return <div className="container py-4">Debes iniciar sesión</div>

  return (
    <main className="container py-4">
      <h1>Mis pedidos</h1>
      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <div>Cargando pedidos...</div>}
      <div className="list-group">
        {orders.map(o => (
          <div key={o.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="fw-bold">Orden #{o.id} • {o.created_at}</div>
                <div className="small text-muted">Total: {formatCLPCurrency(o.total || 0)}</div>
                <div className="small">Estado: <strong>{o.status}</strong></div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleDetails(o)}>{expanded === o.id ? 'Ocultar' : 'Ver detalles'}</button>
              </div>
            </div>
            {expanded === o.id && (
              <div className="mt-3">
                <h6>Productos</h6>
                <div className="list-group">
                  {(o._products || []).map(op => (
                    <div key={op.id} className="list-group-item d-flex justify-content-between">
                      <div>{op.product?.name || op.product_id}</div>
                      <div className="text-muted">x{op.quantity} • {formatCLPCurrency(op.price_at_purchase || 0)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <strong>Dirección:</strong> {o.shipping?.address || '—'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
