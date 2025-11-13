import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, createOrderProduct, createShipping } from '../api/xano'
import { formatCLPCurrency } from '../components/priceFormat.jsx'

export default function Checkout() {
  const { items, total, cart, remove } = useCart()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(user?.shipping_address || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handlePay() {
    if (!token || !user) return navigate('/login')
    if (!items || items.length === 0) return setError('El carrito está vacío')
    setLoading(true)
    setError(null)
    try {
      // 1) Crear orden
      const orderPayload = { user_id: user.id, total: total, status: 'pending' }
      const order = await createOrder(token, orderPayload)
      const orderId = order?.id || order?.order_id || null

      // 2) Crear order_product por cada item
      await Promise.all((items || []).map(async it => {
        const pid = it.product_id || it.product?.id || it.productId
        const qty = it.quantity || 1
        const price = Number(it.price ?? it.product?.price ?? 0)
        if (!pid) return
        await createOrderProduct(token, { order_id: orderId, product_id: pid, quantity: qty, price_at_purchase: price })
      }))

      // 3) Crear shipping record
      if (address) {
        await createShipping(token, { order_id: orderId, address, status: 'pending' })
      }

      // 4) Limpiar carrito: backend cart products will remain; better instruct CartContext user to refresh or manually remove items
      // For simplicity, redirect to My Orders
      navigate('/my-orders')
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !token) return (
    <main className="container py-4">
      <div className="alert alert-warning">Debes iniciar sesión para realizar el pago. <button className="btn btn-link" onClick={() => navigate('/login')}>Ir a login</button></div>
    </main>
  )

  return (
    <main className="container py-4">
      <h1>Checkout</h1>
      <div className="row">
        <div className="col-md-6">
          <h5>Dirección de envío</h5>
          <textarea className="form-control" rows={4} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección completa" />
        </div>
        <div className="col-md-6">
          <h5>Resumen del pedido</h5>
          <div className="list-group mb-3">
            {(items || []).map(it => (
              <div key={it.id || it.product_id || it.productId} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">{it.product?.name || it.name}</div>
                  <div className="small text-muted">x{it.quantity}</div>
                </div>
                <div className="text-end">{formatCLPCurrency((((it.price ?? it.product?.price) || 0) * (it.quantity || 1)))}</div>
              </div>
            ))}
            <div className="list-group-item d-flex justify-content-between fw-bold">Total <div>{formatCLPCurrency(total)}</div></div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-grid">
            <button className="btn btn-primary" onClick={handlePay} disabled={loading}>{loading ? 'Procesando...' : 'Pagar (simulado) y solicitar envío'}</button>
          </div>
        </div>
      </div>
    </main>
  )
}
