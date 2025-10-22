import ProductImagesSlider from './ProductImagesSlider'
import { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const images = product?.images ?? (product?.image ? [product.image] : [])
  const { add } = useCart()
  const [adding, setAdding] = useState(false)
  const [msg, setMsg] = useState(null)

  async function handleAdd() {
    try {
      setAdding(true)
  await add(product, 1)
      setMsg('Agregado')
      setTimeout(() => setMsg(null), 1500)
    } catch (e) {
      console.error(e)
      setMsg('Error')
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="card h-100">
      <ProductImagesSlider images={images} alt={product?.name} aspect={'4/3'} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product?.name}</h5>
        <div className="text-muted small">{product?.brand || 'Marca'}</div>
        <div className="mt-2 fw-bold">${product?.price ?? '0'}</div>
        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-sm btn-primary" onClick={handleAdd} disabled={adding}>{adding ? '...' : 'Agregar al carrito'}</button>
          {msg && <div className="small text-success align-self-center">{msg}</div>}
        </div>
      </div>
    </article>
  )
}
