import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { editProfile, listOrders, listOrderProducts } from '../api/xano'
import { formatCLPCurrency } from '../components/priceFormat.jsx'

export default function Profile() {
  const { user, token, setUser, updateUser } = useAuth()
  const [draft, setDraft] = useState({ name: '', last_name: '', shipping_address: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Orders state
  const [orders, setOrders] = useState([])
  const [oLoading, setOLoading] = useState(false)
  const [oErr, setOErr] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (user) {
      setDraft({
        name: user.name || '',
        last_name: user.last_name || '',
        shipping_address: user.shipping_address || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  useEffect(() => {
    let mounted = true
    async function loadOrders() {
      if (!token || !user) return
      setOLoading(true)
      setOErr('')
      try {
        const data = await listOrders({ token, user_id: user.id, limit: 100 })
        if (!mounted) return
        setOrders(data)
      } catch (e) {
        if (mounted) setOErr(e?.message || 'Error al cargar pedidos')
      } finally { if (mounted) setOLoading(false) }
    }
    loadOrders()
    return () => { mounted = false }
  }, [token, user?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Usamos la nueva función updateUser del contexto
      // Combinamos el usuario actual con el borrador para enviar el objeto completo
      const updatedUser = await updateUser(user.id, { ...user, ...draft })
      // El contexto ya se encarga de actualizar el estado si es el mismo usuario
      setSuccess('¡Perfil actualizado con éxito!')
    } catch (err) {
      setError(err.message || 'Ocurrió un error al actualizar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDraft(prev => ({ ...prev, [name]: value }))
  }

  if (!user) {
    return <div className="container py-4">Cargando perfil...</div>
  }

  return (
    <main className="container py-4" style={{ maxWidth: '900px' }}>
      <h1>Mi Perfil</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <h5>Editar información</h5>
          <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input type="text" className="form-control" id="name" name="name" value={draft.name} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="last_name" className="form-label">Apellido</label>
          <input type="text" className="form-control" id="last_name" name="last_name" value={draft.last_name} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Teléfono</label>
          <input type="tel" className="form-control" id="phone" name="phone" value={draft.phone} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="shipping_address" className="form-label">Dirección de Envío</label>
          <textarea className="form-control" id="shipping_address" name="shipping_address" rows="3" value={draft.shipping_address} onChange={handleChange}></textarea>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
          </form>
        </div>
        <div className="col-12 col-lg-7">
          <h5>Mis pedidos</h5>
          {oErr && <div className="alert alert-danger">{oErr}</div>}
          {oLoading && <div>Cargando pedidos...</div>}
          <div className="list-group">
            {orders.map(o => (
              <div key={o.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold">Orden #{o.id} • {new Date(o.created_at).toLocaleString()}</div>
                    <div className="small text-muted">Total: {formatCLPCurrency(o.total || 0)}</div>
                    <div className="small">Estado: <strong>{o.status}</strong></div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={async () => {
                      if (expanded === o.id) { setExpanded(null); return }
                      try {
                        const prods = await listOrderProducts(token, o.id)
                        setOrders(prev => prev.map(x => x.id === o.id ? { ...x, _products: prods } : x))
                        setExpanded(o.id)
                      } catch (e) { alert('No fue posible cargar productos del pedido') }
                    }}>{expanded === o.id ? 'Ocultar' : 'Ver detalles'}</button>
                  </div>
                </div>
                {expanded === o.id && (
                  <div className="mt-2">
                    <div className="list-group">
                      {(o._products || []).map(op => (
                        <div key={op.id} className="list-group-item d-flex justify-content-between">
                          <div>{op.product?.name || `Producto ID: ${op.product_id}`}</div>
                          <div className="text-muted">x{op.quantity} • {formatCLPCurrency(op.price_at_purchase || 0)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2"><strong>Dirección:</strong> {o.shipping?.address || user?.shipping_address || '—'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
